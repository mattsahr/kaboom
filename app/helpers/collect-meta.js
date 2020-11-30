const fs = require( 'fs' );
const path = require( 'path' );
const Jimp = require('jimp');
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
            const image = await Jimp.read(fromPath);
            const dataURI = await image.getBase64Async(Jimp.MIME_JPEG);

            const baseFileName = replaceLastOrAdd(fileName, '--' + size, '');

            const original = await Jimp.read(path.join(originalDirectory, baseFileName));

            const currentMeta = albumMeta.images.find(next => next.fileName === baseFileName);

            if (currentMeta) {
                currentMeta.width = original.bitmap.width;
                currentMeta.height = original.bitmap.height;
                currentMeta.dataURI = dataURI;

                console.log(
                    'data URI | ' + 
                    (count < 10 ? ('0' + count) : count) +
                    ' of ' + total + ' | >> ' +
                    dataURI.length + ' | ' + 
                    currentMeta.fileName  + ' | ' + 
                    currentMeta.width  + 'w X ' + 
                    currentMeta.height  + 'h'
                );

                if (currentMeta.description) {
                    console.log(currentMeta.description);
                    console.log(' ');
                }

            } else {
                const nextImage = {
                    fileName: baseFileName,
                    width: original.bitmap.width,
                    height: original.bitmap.height,
                    title: currentMeta,
                    description: '',
                    dataURI: dataURI
                };
                albumMeta.images.push(nextImage);

                console.log(
                    'data URI | ' + 
                    (count < 10 ? ('0' + count) : count) +
                    ' of ' + total + ' | >> ' +
                    dataURI.length + ' | ' + 
                    nextImage.fileName  + ' | ' + 
                    nextImage.width  + 'w X ' + 
                    nextImage.height  + 'h'
                );
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
