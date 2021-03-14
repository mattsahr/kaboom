const fs = require( 'fs' );
const path = require( 'path' );
const Jimp = require('jimp');
const saveMeta = require('./save-meta.js');
const getMeta = require('./get-meta.js');
const { DEFAULT_IMAGE_DIRECTORY } = require('../constants.js');
const { replaceLastOrAdd } = require('../helpers/helpers.js');

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
    // console.log('---- width', width, ' height', height);

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
        sequence.push(nextData.join(','));
    }
    return { height, width, sequence };
};


const removeOrphanJSON = (albumMeta, originals) => {
    const imageFound = originals => item => originals.includes(item.fileName);
    albumMeta.images = albumMeta.images.filter(imageFound(originals));
};

const hydrateJSON = async (albumDirectory, successCallback) => {

    const albumMeta = await getMeta(albumDirectory);

    albumMeta.title = albumMeta.title || albumDirectory.split(path.sep).pop();

    const imageDirectory = path.join(albumDirectory, 'svg');
    const originalDirectory = path.join(albumDirectory, DEFAULT_IMAGE_DIRECTORY);
    const imageNames = await fs.promises.readdir(imageDirectory);
    const total = imageNames.length;
    let count = 0;

    const confirmedOriginals = [];

    for (const fileName of imageNames) {
        // Get the full paths
        const fromPath = path.join(imageDirectory, fileName);
        const stat = await fs.promises.stat(fromPath);

        if( stat.isFile() ) {
            count++;

            const svgData = await fs.promises.readFile(fromPath, 'utf8');
            const { height, width, sequence } = svgToData(svgData);
            console.log(albumDirectory, fileName, 
                'svgSequence [' + count + '] of ' + total + ' | size:', 
                JSON.stringify(sequence).length
            );

            const imgTypes = [ 'jpg', 'jpeg', 'png', 'gif' ];

            let baseFileName;
            let original;
            let imgFound = false;

            while (!imgFound) {
                try {
                    baseFileName = replaceLastOrAdd(fileName, 'svg', imgTypes.shift());
                    original = await Jimp.read(path.join(originalDirectory, baseFileName));
                    imgFound = true;
                    confirmedOriginals.push(baseFileName);
                } catch (e) {
                    if (!imgTypes.length) {
                        console.error(albumDirectory, 'NO IMAGE FOUND', baseFileName);
                        baseFileName = false;
                        imgFound = true;
                        // process.exit(1);
                    }
                }
            }

            if (baseFileName) {

                const currentMeta = albumMeta.images.find(next => next.fileName === baseFileName);

                if (currentMeta) {
                    // currentMeta.id = baseFileName;

                    currentMeta.width = original.bitmap.width;
                    currentMeta.height = original.bitmap.height;

                    // currentMeta.svgSequence = sequence;
                    currentMeta.svgHeight = height;
                    currentMeta.svgWidth = width;

                    albumMeta.svgSequences[baseFileName] = sequence;

                } else {
                    const nextImage = {
                        // id: baseFileName,
                        fileName: baseFileName,

                        width: original.bitmap.width,
                        height: original.bitmap.height,

                        title: baseFileName,
                        description: '',
                        // svgSequence: sequence,
                        svgHeight: height,
                        svgWidth: width
                    };
                    albumMeta.svgSequences[baseFileName] = sequence;
                    albumMeta.images.push(nextImage);
                }

            }

        } else {
            count++;
        }

        if (count >= total) {
            removeOrphanJSON(albumMeta, confirmedOriginals);
            saveMeta(albumMeta, albumDirectory, successCallback);
        }
    }

};

module.exports = hydrateJSON;
