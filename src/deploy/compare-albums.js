const path = require( 'path' );
const getMeta = require('../hydrate/get-meta.js');
const { 
    ALBUM_META_JSON,
    ALBUM_EXTRA_JSON 
} = require('../constants.js');

const composeAlbumNeedsUpdate = remoteURL => async albumPath => {
    const localAlbum = await getMeta(albumPath);
    const remoteAlbum = await getMeta(albumPath, remoteURL);

    console.log('>>> compare', remoteURL, albumPath);

    const report = {
        album: albumPath.split(path.sep).pop(),
        'Missing images': [],
        'Files to update': []
    };

    const localTS = localAlbum.latestUpdate || 0;
    const remoteTS = remoteAlbum.latestUpdate || 0;

    if (localTS > remoteTS) {
        report['Files to update'].push(ALBUM_META_JSON);
        report['Files to update'].push(ALBUM_EXTRA_JSON);
    }

    for (const image of localAlbum.images) {
        const remoteImage = remoteAlbum.images.find(next => next.fileName === image.fileName);
        if (!remoteImage) {
            report['Missing images'].push(image.fileName);
        }
    }

    if (report['Missing images'].length || report['Files to update'].length) {
        return report;
    }

    return false;

};

module.exports = {
    composeAlbumNeedsUpdate
};