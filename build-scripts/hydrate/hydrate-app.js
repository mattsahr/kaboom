const fs = require('fs');
const path = require( 'path' );
const { minify } = require('html-minifier');
const { checkFile, waitSerial } = require('../helpers/helpers.js');
const { 
    APP_DIRECTORY,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH
} = require('../constants.js');

const writeToAlbums = async (albumRoot, fileName, file, successCallback) => {

    const requiredDirectories = [ '__app' ];

    if (!checkFile(albumRoot)) {
        console.log('------- WRITE ' + fileName + '  -- NO ALBUMS FOUND: ' + albumRoot + ' -----');
        successCallback();
        return;
    }

    const galleryNames = await fs.promises.readdir(albumRoot);
    const albums = [];

    for (const name of galleryNames) {
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

const hydrateAppFile = fileName => async successCallback => {

    const filePath = path.join('__app/', fileName);
    const sourcePath = path.join(APP_DIRECTORY, filePath);
    const file = await fs.promises.readFile(sourcePath, 'utf8');

    const firstBatchCallBack = () => {
        writeToAlbums(GALLERY_STATIC_PATH, filePath, file, successCallback);
    };
    writeToAlbums(GALLERY_ACTIVE_PATH, filePath, file, firstBatchCallBack);
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

    const firstBatchCallBack = () => {
        writeToAlbums(GALLERY_STATIC_PATH, 'index.html', minified, successCallback);
    };
    writeToAlbums(GALLERY_ACTIVE_PATH, 'index.html', minified, firstBatchCallBack);
};

const hydrateAlbumApp = hydrateAppFile('album-app.js');
const hydateAlbumCss = hydrateAppFile('bundle.css');

const hydrateApp = (() => {

    return async (successCallback) => {

        waitSerial(
            {
               hydrateHTML,
               hydrateAlbumApp,
               hydateAlbumCss
            },
            successCallback,
            'REPORT'
        );
    };

})();

module.exports = hydrateApp;
