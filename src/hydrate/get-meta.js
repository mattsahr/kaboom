const axios = require('axios');
const fs = require( 'fs' );
const path = require( 'path' );
const { checkFile } = require('../helpers/helpers.js');
const { 
    ALBUM_META_JSON,
    ALBUM_EXTRA_JSON
    // GALLERY_MAIN_PATH,
    // GALLERY_IS_HOME_PAGE
} = require('../constants.js');

const getRemote = async url => {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (err) {
        return false;
    }
};

const getAlbum10 = async(albumDirectory, remoteURL) => {
    if (remoteURL) {
        const localDir = albumDirectory.split(path.sep).pop();
        return getRemote(remoteURL + '/' + localDir + '/' + ALBUM_META_JSON);
    } else {
        const meta10Path = path.join(albumDirectory, ALBUM_META_JSON);
        const gotAlbum10 = checkFile(meta10Path);
        if (gotAlbum10) {
            const album10 = await fs.promises.readFile(meta10Path, 'utf8');
            return JSON.parse(album10);
        }
        return false;
    }
};

const getAlbum11 = async(albumDirectory, remoteURL) => {
    if (remoteURL) {
        const localDir = albumDirectory.split(path.sep).pop();
        return getRemote(remoteURL + '/' + localDir + '/' + ALBUM_EXTRA_JSON);
    } else {
        const meta11Path = path.join(albumDirectory, ALBUM_EXTRA_JSON);
        const gotAlbum11 = checkFile(meta11Path);
        if (gotAlbum11) {
            const album11 = await fs.promises.readFile(meta11Path, 'utf8');
            return JSON.parse(album11);
        }
        return false;
    }
};


const getMeta = (() => {

    const baseAlbum = (/*albumDirectory*/) => ({
        images: [],
        svgSequences: {}
        // url: albumDirectory === GALLERY_MAIN_PATH
        //     ? GALLERY_HOME_PAGE_CONSTANT
        //     : albumDirectory.split(path.sep).pop()
    });

    return async (albumDirectory, remoteURL) => {
        let albumMeta = baseAlbum(/*albumDirectory*/);

        const album10 = await getAlbum10(albumDirectory, remoteURL);
        const album11 = await getAlbum11(albumDirectory, remoteURL);

        if (album10) {
            albumMeta = album10;
        } 

        if (album11) {
            const { images, svgSequences } = album11;
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
