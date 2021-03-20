const fs = require( 'fs' );
const path = require( 'path' );
const { 
    copyFile, 
    waitSerial 
} = require('../helpers/helpers.js');
const {
    DEFAULT_IMAGE_DIRECTORY,
    DEMO_ALBUM,
    DEMO_PIX,
    GALLERY_MAIN_PATH,
    DUMMY_RESOURCE_PATH
} = require('../constants.js');

const buildDirectories = (() => {

    const buildGallery = (successCallback) => {
        if (!fs.existsSync(GALLERY_MAIN_PATH)){
            fs.mkdirSync(GALLERY_MAIN_PATH);

            const faviconPath = path.join(DUMMY_RESOURCE_PATH, 'favicon.png');
            const faviconDest = path.join(GALLERY_MAIN_PATH, 'favicon.png');
            copyFile(faviconPath, faviconDest, err => {
                if (err) { console.error('copyFile ERROR', err); }
                if (successCallback) { successCallback(); }
            });
        } else {
            if (successCallback) { successCallback(); }
        }
    };

    const populateGallery = async (successCallback) => {

        const demoAlbumPath = path.join(GALLERY_MAIN_PATH, DEMO_ALBUM);
        if (!fs.existsSync(demoAlbumPath)){
            fs.mkdirSync(demoAlbumPath);
        }

        const imageDirPath = path.join(GALLERY_MAIN_PATH, DEMO_ALBUM, DEFAULT_IMAGE_DIRECTORY);
        if (!fs.existsSync(imageDirPath)){
            fs.mkdirSync(imageDirPath);
        }

        let pixCount = 0;

        const copyCallback = (src, dest) => err => {
            if (err) {
                console.log('copy error ' + src + ' >> ' + dest);
                console.log(err);
            } else {
                pixCount++;
                if (pixCount >= DEMO_PIX.length) {
                    console.log('added album: ' + GALLERY_MAIN_PATH + '/' + DEMO_ALBUM);
                    if (successCallback) { successCallback(); }
                }
            }
        };

        for (const pic of DEMO_PIX) {
            const source = path.join(DUMMY_RESOURCE_PATH, pic);
            const destination = path.join(imageDirPath, pic);
            const callback = copyCallback(source, destination);
            copyFile(source, destination, callback);
        }

    };

    return async successCallback => {

        console.log(' ');
        console.log('Build Directories');
        console.log(' ');

        waitSerial(
            {
                buildGallery,
                populateGallery
            },
            successCallback
        );

    };

})();

module.exports = buildDirectories;
