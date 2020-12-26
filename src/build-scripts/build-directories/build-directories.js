const fs = require( 'fs' );
const path = require( 'path' );
const { copyFile, waitParallel, waitSerial } = require('../helpers/helpers.js');
const {
    ALBUM_META_JSON,
    APP_DIRECTORY,
    DEFAULT_IMAGE_DIRECTORY,
    DEMO_ALBUM,
    DEMO_PIX,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH,
    DUMMY_RESOURCE_PATH
} = require('../constants.js');

const buildDirectories = (() => {

    const buildActiveGallery = (successCallback) => {
        if (!fs.existsSync(GALLERY_ACTIVE_PATH)){
            fs.mkdirSync(GALLERY_ACTIVE_PATH);
            console.log('added directory: ' + GALLERY_ACTIVE_PATH);
        }
        if (successCallback) { successCallback(); }
    };

    const buildStaticGallery = (successCallback) => {
        if (!fs.existsSync(GALLERY_STATIC_PATH)){
            fs.mkdirSync(GALLERY_STATIC_PATH);
            console.log('added directory: ' + GALLERY_STATIC_PATH);
        }
        if (successCallback) { successCallback(); }
    };

    const populateActiveGallery = async (successCallback) => {
        const galleryStaticNames = await fs.promises.readdir(GALLERY_STATIC_PATH);
        const staticAlbums = [];
        for (const name of galleryStaticNames) {
            const albumPath = path.join(GALLERY_STATIC_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { staticAlbums.push(albumPath); }
        }

        console.log(' ');
        console.log('static albums:', staticAlbums.length);

        const galleryActiveNames = await fs.promises.readdir(GALLERY_ACTIVE_PATH);
        const activeAlbums = [];
        for (const name of galleryActiveNames) {
            const albumPath = path.join(GALLERY_ACTIVE_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { activeAlbums.push(albumPath); }
        }

        console.log(' ');
        console.log('active albums:', activeAlbums.length);

        if (staticAlbums.length === 0 && activeAlbums.length === 0) {

            const albumPath = path.join(GALLERY_ACTIVE_PATH, DEMO_ALBUM);
            const imageDirPath = path.join(
                GALLERY_ACTIVE_PATH, 
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
                    GALLERY_ACTIVE_PATH, 
                    DEMO_ALBUM, 
                    DEFAULT_IMAGE_DIRECTORY, 
                    pic
                );

                const callback = copyCallback(source, destination);

                copyFile(source, destination,  callback);

            }


            console.log('added album: ' + GALLERY_ACTIVE_PATH + '/' + DEMO_ALBUM);

        } else {
            if (successCallback) { successCallback(); }
        }
    };

    /*
    const addDummyJson = (successCallback) => {
        const appJsonPath = path.join(APP_DIRECTORY, ALBUM_META_JSON);
        if (!fs.existsSync(appJsonPath)){
            const source = path.join(DUMMY_RESOURCE_PATH, ALBUM_META_JSON);

            const copyCallback = err => { 
                if (err) {
                    console.log('copy error ' + source + ' >> ' + appJsonPath);
                    console.log(err);
                } else {
                    console.log('added JSON file: ' + appJsonPath);
                    if (successCallback) { successCallback(); }

                }
            };

            copyFile(source, appJsonPath, copyCallback);
        } else {
            console.log('no dummyJSON needed!', appJsonPath);
            if (successCallback) { successCallback(); }            
        }
    };

    const addDummyImages = (successCallback) => {
        const appImagesPath = path.join(APP_DIRECTORY, DEFAULT_IMAGE_DIRECTORY);
        if (!fs.existsSync(appImagesPath)){
            fs.mkdirSync(appImagesPath);

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
                const destination = path.join(APP_DIRECTORY, DEFAULT_IMAGE_DIRECTORY, pic);

                const callback = copyCallback(source, destination);
                copyFile(source, destination, callback);
            }

            console.log('added working images: ' + appImagesPath);
        } else {
            console.log('image path exists!', appImagesPath);
            if (successCallback) { successCallback(); }
        }
    };
    */

    return async (successCallback) => {

        waitSerial(
            {
                buildStaticGallery,
                buildActiveGallery,
                populateActiveGallery
                // addDummyJson,
                // addDummyImages
            },
            successCallback
            // 'REPORT'
        );

    };

})();

module.exports = buildDirectories;
