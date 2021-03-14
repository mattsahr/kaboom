const fs = require( 'fs' );
const path = require( 'path' );
const { 
    ALBUM_EXTRA_JSON,
    ALBUM_META_JSON, 
    GALLERY_IS_HOME_PAGE,
    GALLERY_MAIN_PATH
} = require('../constants.js');

const saveAlbum = (() => {

    const fileNames = {
        '1-to-10': ALBUM_META_JSON,
        '11-plus': ALBUM_EXTRA_JSON
    };

    return async (data, section, source, errCallback) => {


        const albumPath = data[GALLERY_IS_HOME_PAGE]
            ? GALLERY_MAIN_PATH
            : path.join(GALLERY_MAIN_PATH, source || '');
        const stat = await fs.promises.stat(albumPath);

        if (stat.isDirectory()) { 

            const filePath = path.join(albumPath, fileNames[section]);
            const json = JSON.stringify(data);

            fs.writeFile(
                filePath, 
                json, 
                err => { if (err) { errCallback(err); } }
            );

        } else {

            console.log('Directory not found: ' + albumPath);
            errCallback('Directory not found: ' + albumPath);

        }

    };

})();

module.exports = saveAlbum;
