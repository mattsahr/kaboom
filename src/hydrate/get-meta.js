const fs = require( 'fs' );
const path = require( 'path' );
const { checkFile } = require('../helpers/helpers.js');

const getMeta = (() => {

    const baseAlbum = albumDirectory => ({
        images: [],
        svgSequences: {},
        url: path.basename(albumDirectory) // albumDirectory.split('\\').pop()
    });

    return async albumDirectory => {
        let albumMeta = baseAlbum(albumDirectory);
        const metaPath = path.join(albumDirectory, 'album-meta.json');

        const gotAlbumMeta = checkFile(metaPath);

        if (gotAlbumMeta) {
            albumMeta = await fs.promises.readFile(metaPath, 'utf8');
            albumMeta = JSON.parse(albumMeta);

            albumMeta.url = path.basename(albumDirectory); // albumDirectory.split('/').pop();

            albumMeta.svgSequences = albumMeta.svgSequences || {};

            // clean up old style embedded sequence
            // TODO -- REMOVE THIS LOOP
            for (const image of albumMeta.images) {
                if (image.svgSequence) { 
                    albumMeta.svgSequences[image.fileName] = image.svgSequence;
                    delete image.svgSequence;
                }
            }

        } 

        const meta10Path = path.join(albumDirectory, 'album-1-to-10.json');
        const meta11Path = path.join(albumDirectory, 'album-11-plus.json');
        
        const gotAlbum10 = checkFile(meta10Path);
        const gotAlbum11 = checkFile(meta11Path);

        if (gotAlbum10) {
            albumMeta = await fs.promises.readFile(meta10Path, 'utf8');
            albumMeta = JSON.parse(albumMeta);
            albumMeta.url = path.basename(albumDirectory); // albumDirectory.split('/').pop();

            albumMeta.svgSequences = albumMeta.svgSequences || {};

            // clean up old style embedded sequence
            // TODO -- REMOVE THIS LOOP
            for (const image of albumMeta.images) {
                if (image.svgSequence) { 
                    albumMeta.svgSequences[image.fileName] = image.svgSequence;
                    delete image.svgSequence;
                }
            }

        } 

        if (gotAlbum11) {
            const meta11 = await fs.promises.readFile(meta11Path, 'utf8');
            const { images, svgSequences } = JSON.parse(meta11);
            for (const image of images) {
                if (!albumMeta.images.find(next => next.fileName === image.fileName)) {
                    delete image.svgSequence;
                    albumMeta.images.push(image);
                    albumMeta.svgSequences[image.fileName] = svgSequences[image.fileName];
                }
            }
        }

        return albumMeta;

    };

})(); 

module.exports = getMeta;
