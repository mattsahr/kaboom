const fs = require( 'fs' );
const path = require( 'path' );
const Jimp = require('jimp');
// const potrace = require('potrace');
// const SVGO = require('svgo');
// const { SVGO_PARAMS } = require('../constants.js');
const { checkFile, replaceLastOrAdd } = require('./helpers.js');


const saveMeta = (albumMeta, saveDirectory) => {
    const json = JSON.stringify(albumMeta);

    const filePath = saveDirectory
        ? path.join(saveDirectory, 'album-meta.json')
        : 'album-meta.json';
    
    fs.writeFile(filePath, json, (err) => {
        if (!err) {
            console.log(' ');
            console.log('saved: ' + filePath);
        }
    });
};

const endBracket = /\/>/g;
const endG = /<\/g>/g;
const endSVG = /<\/svg>/g;

const svgToData = data => {
    const sequence = [];
    const circles = data.split('<ellipse ');

    const frontMatter = circles.shift();
    let dimensions = frontMatter.split('width="')[1];
    dimensions = dimensions.split('" height="');
    const width = dimensions[0];
    const height = dimensions[1].split('">')[0];
    console.log('---- width', width, ' height', height);

    for (const next of circles) {
        const prepped = next
            .replace(endBracket, '')
            .replace(endG, '')
            .replace(endSVG, '')
            .replace('fill=', '')
            .replace(' fill-opacity=', ', ')
            .replace(' cx=', ', ')
            .replace(' cy=', ', ')
            .replace(' rx=', ', ')
            .replace(' ry=', ', ');

        const nextData = JSON.parse('[' + prepped + ']');
        nextData[1] = Number(nextData[1]).toFixed(3);
        sequence.push(nextData);
    }
    return { height, width, sequence };
};

const collectMeta = async (albumDirectory, size, originals) => {
    
    let albumMeta = {
        images: []
    };

    const metaPath = path.join(albumDirectory, 'album-meta.json');

    const gotAlbumMeta = checkFile(metaPath);

    if (gotAlbumMeta) {
        albumMeta = await fs.promises.readFile(metaPath, 'utf8');
        albumMeta = JSON.parse(albumMeta);

        console.log('already got albumMeta!');

        for (const image of albumMeta.images) {
            if (image.description) {
                console.log(image.fileName, image.description);
            }
        }

    } 

    const imageDirectory = path.join(albumDirectory, size);
    const originalDirectory = path.join(albumDirectory, originals);
    const imageNames = await fs.promises.readdir(imageDirectory);
    const total = imageNames.length;
    let count = 0;

    for (const fileName of imageNames) {
        // Get the full paths
        const fromPath = path.join(imageDirectory, fileName);
        const stat = await fs.promises.stat(fromPath);

        if( stat.isFile() ) {
            count++;

            const svgData = await fs.promises.readFile(fromPath, 'utf8');
            const { height, width, sequence } = svgToData(svgData);
            console.log(fromPath, 'svgSequence', JSON.stringify(sequence).length);

            const baseFileName = replaceLastOrAdd(fileName, size, 'jpg');
            const original = await Jimp.read(path.join(originalDirectory, baseFileName));

            const currentMeta = albumMeta.images.find(next => next.fileName === baseFileName);

            if (currentMeta) {
                currentMeta.width = original.bitmap.width;
                currentMeta.height = original.bitmap.height;

                delete currentMeta.dataURI;
                delete currentMeta.svg;
                delete currentMeta.svgString;
                currentMeta.svgSequence = sequence;
                currentMeta.svgHeight = height;
                currentMeta.svgWidth = width;

            } else {
                const nextImage = {
                    fileName: baseFileName,
                    id: baseFileName,
                    width: original.bitmap.width,
                    height: original.bitmap.height,
                    title: currentMeta,
                    description: '',
                    svgSequence: sequence,
                    svgHeight: height,
                    svgWidth: width
                };
                albumMeta.images.push(nextImage);
            }

        } else {
            count++;
        }

        if (count >= total) {
            saveMeta(albumMeta, albumDirectory);
        }
    }

};

module.exports = collectMeta;
