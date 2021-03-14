const fs = require( 'fs' );
const path = require( 'path' );
const { 
    copyFile, 
    waitSerial 
} = require('../helpers/helpers.js');
const {
    APP_LOCAL_DIRECTORY,
    DEFAULT_IMAGE_DIRECTORY,
    DEMO_ALBUM,
    DEMO_PIX,
    GALLERY_MAIN_PATH,
    DUMMY_RESOURCE_PATH
} = require('../constants.js');

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

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
        }
    };

    const populateGallery = async (successCallback) => {
        const galleryNames = await fs.promises.readdir(GALLERY_MAIN_PATH);
        const albums = [];

        for (const name of galleryNames.filter(notAppDir)) {
            const albumPath = path.join(GALLERY_MAIN_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { albums.push(albumPath); }
        }

        console.log(' ');
        console.log('albums:', albums.length);

        if (albums.length === 0) {

            const albumPath = path.join(GALLERY_MAIN_PATH, DEMO_ALBUM);
            const imageDirPath = path.join(
                GALLERY_MAIN_PATH, 
                DEMO_ALBUM, 
                DEFAULT_IMAGE_DIRECTORY
            );
            fs.mkdirSync(albumPath);
            fs.mkdirSync(imageDirPath);

            let pixCount = 0;

            const copyCallback = (src, dest) => err => {
                if (err) {
                    console.log('copy error ' + src + ' >> ' + dest);
                    console.log(err);
                } else {
                    pixCount++;
                    if (pixCount >= DEMO_PIX.length) {
                        if (successCallback) { successCallback(); }
                    }
                }
            };

            for (const pic of DEMO_PIX) {
                const source = path.join(DUMMY_RESOURCE_PATH, pic);
                const destination = path.join(
                    GALLERY_MAIN_PATH, 
                    DEMO_ALBUM, 
                    DEFAULT_IMAGE_DIRECTORY, 
                    pic
                );

                const callback = copyCallback(source, destination);

                copyFile(source, destination,  callback);

            }
            console.log('added album: ' + GALLERY_MAIN_PATH + '/' + DEMO_ALBUM);

        } else {
            if (successCallback) { successCallback(); }
        }
    };

    return async successCallback => {

        console.log('buildDirectories callback: ', successCallback);

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
