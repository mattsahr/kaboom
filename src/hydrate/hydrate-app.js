const fs = require('fs');
const path = require( 'path' );
const { minify } = require('html-minifier');
const { checkFile, waitSerial } = require('../helpers/helpers.js');
const { 
    APP_DIRECTORY,
    APP_LOCAL_DIRECTORY,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH
} = require('../constants.js');

const requiredDirectories = [ '__app' ];

// const writeToRoot = async (albumRoot, fileName, file, successCallback) => {

//     const writePath = path.join(album, fileName);
//     fs.writeFile(writePath, file, writeCallback);
// };

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

const writeToAlbums = async (albumRoot, fileName, file, successCallback) => {

    if (!checkFile(albumRoot)) {
        console.log('------- WRITE ' + fileName + '  -- NO GALLERY ROOT: ' + albumRoot + ' -----');
        successCallback();
        return;
    }

    const galleryNames = await fs.promises.readdir(albumRoot);
    const albums = [];

    for (const name of galleryNames.filter(notAppDir)) {
        const albumPath = path.join(albumRoot, name);
        const stat = await fs.promises.stat(albumPath);
        if (stat.isDirectory()) { albums.push(albumPath); }
    }

    if (albums.length === 0) {
        console.log('------- WRITE ' + fileName + '  -- NO ALBUMS FOUND: ' + albumRoot + ' -----');
        successCallback();
        return;
    }

    for (const album of albums) {
        for (const directory of requiredDirectories) {
            const directoryPath = path.join(album, directory);
            if (!checkFile(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }
        }
    }

    const localSuccessCallback = () => {
        let writeCount = 0;

        const writeCallback = err => {
            if (err) {
                console.log('write error', err);
            } else {
                writeCount++;
                if (successCallback && (writeCount >= albums.length)) {
                    successCallback();
                }
            }
        };

        for (const album of albums) {
            const writePath = path.join(album, fileName);
            fs.writeFile(writePath, file, writeCallback);
        }
    };

    writeToRoot(fileName, albumRoot)(localSuccessCallback);

};

const hydrateAppFile = (fileName, albumsPath) => async successCallback => {

    const filePath = path.join('__app/', fileName);
    const sourcePath = path.join(APP_DIRECTORY, filePath);
    const file = await fs.promises.readFile(sourcePath, 'utf8');

    writeToAlbums(albumsPath, filePath, file, successCallback);
};

const writeToRoot = (fileName, directory) => async successCallback => {
    if (!checkFile(directory)) {
        console.log('------- WRITE ' + fileName + '  -- NO GALLERY ROOT: ' + directory + ' -----');
        successCallback();
        return;
    }

    for (const required of requiredDirectories) {
        const directoryPath = path.join(directory, required);
        if (!checkFile(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
    }

    const sourcePath = path.join(APP_DIRECTORY, fileName);
    const file = await fs.promises.readFile(sourcePath, 'utf8');
    const writePath = path.join(directory, fileName);
    fs.writeFile(writePath, file, successCallback);
};


const hydrateHTML = async (successCallback) => {

    const minProps  = {
        collapseWhitespace: true,
        removeComments: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeTagWhitespace: true,
        minifyCSS: true,
        useShortDoctype: true,
        minifyJS: true
    };

    const source = path.join(APP_DIRECTORY, 'index.html');
    const indexHtml = await fs.promises.readFile(source, 'utf8');
    const minified = minify(indexHtml, minProps);

    const firstBatchCallBack = async () => {

        const sourceBasic = path.join(APP_DIRECTORY, 'basic.html');
        const basicHtml = await fs.promises.readFile(sourceBasic, 'utf8');
        const minifiedBasic = minify(basicHtml, minProps);

        writeToAlbums(GALLERY_STATIC_PATH, 'index.html', minifiedBasic, successCallback);
    };

    writeToAlbums(GALLERY_ACTIVE_PATH, 'index.html', minified, firstBatchCallBack);
};

const app =             hydrateAppFile('album-app.js', GALLERY_ACTIVE_PATH);
const appCSS =          hydrateAppFile('bundle.css', GALLERY_ACTIVE_PATH);
const appGlobalCSS =    hydrateAppFile('global.css', GALLERY_ACTIVE_PATH);

const basic =           hydrateAppFile('album-basic.js', GALLERY_STATIC_PATH);
const basicCSS =        hydrateAppFile('bundle-basic.css', GALLERY_STATIC_PATH);

const navActiveCSS =    writeToRoot('bundle-nav.css', GALLERY_ACTIVE_PATH);
const navStaticCSS =    writeToRoot('bundle-nav.css', GALLERY_STATIC_PATH);
const navActive =       writeToRoot('nav-app.js', GALLERY_ACTIVE_PATH);
const navStatic =       writeToRoot('nav-app.js', GALLERY_STATIC_PATH);
// const basicGlobalCSS =  hydrateAppFile('global-basic.css', GALLERY_STATIC_PATH);

const hydrateApp = (() => {

    return async (successCallback) => {

        waitSerial(
            {
                hydrateHTML,

                app,
                appCSS,
                appGlobalCSS,

                basic,
                basicCSS,

                navActive,
                navStatic,
                navActiveCSS,
                navStaticCSS

            },
            successCallback
            // 'REPORT'
        );
    };

})();

module.exports = hydrateApp;
