const fs = require('fs');
const path = require( 'path' );
const { minify } = require('html-minifier');
const { 
    checkFile, 
    waitSerial 
} = require('../helpers/helpers.js');
const { 
    APP_DIRECTORY,
    APP_LOCAL_DIRECTORY,
    GALLERY_MAIN_PATH
} = require('../constants.js');

const requiredDirectories = [ APP_LOCAL_DIRECTORY ];

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

    writeToRoot(fileName, albumRoot, file)(localSuccessCallback);

};

const hydrateAppFile = (fileName, albumsPath) => async successCallback => {
    const filePath = path.join(APP_LOCAL_DIRECTORY, fileName);
    const sourcePath = path.join(APP_DIRECTORY, filePath);
    const file = await fs.promises.readFile(sourcePath, 'utf8');
    writeToAlbums(albumsPath, filePath, file, successCallback);
};

const writeToRoot = (fileName, directory, file) => async successCallback => {
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
    const writePath = path.join(directory, fileName);

    if (file) {
        fs.writeFile(writePath, file, successCallback);
    } else {
        const fileToSave = await fs.promises.readFile(sourcePath, 'utf8');
        fs.writeFile(writePath, fileToSave, successCallback);
    }

};


const hydrateHTML = (() => {

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

    const saveStaticBackup = callback => async () => {
        const sourceBasic = path.join(APP_DIRECTORY, 'basic.html');
        const basicHtml = await fs.promises.readFile(sourceBasic, 'utf8');
        const minifiedBasic = minify(basicHtml, minProps);
        const target = path.join(APP_LOCAL_DIRECTORY, 'index-basic.html');
        writeToAlbums(GALLERY_MAIN_PATH, target, minifiedBasic, callback);
    };

    const saveActiveBackup = callback => async () => {
        const source = path.join(APP_DIRECTORY, 'index.html');
        const indexHtml = await fs.promises.readFile(source, 'utf8');
        const minified = minify(indexHtml, minProps);
        const target = path.join(APP_LOCAL_DIRECTORY, 'index-active.html');
        writeToAlbums(GALLERY_MAIN_PATH, target, minified, callback);
    };

    const hydrateRootHTML = (sourceName, callback) => async () => {
        const source = path.join(APP_DIRECTORY, sourceName);
        const indexHtml = await fs.promises.readFile(source, 'utf8');
        const minified = minify(indexHtml, minProps);
        writeToRoot('index.html', GALLERY_MAIN_PATH, minified)(callback);
    };

    const hydrateActive = async successCallback => {
        const source = path.join(APP_DIRECTORY, 'index.html');
        const indexHtml = await fs.promises.readFile(source, 'utf8');
        const minified = minify(indexHtml, minProps);

        const saveBackup = saveStaticBackup(successCallback);
        const hydrateRoot = hydrateRootHTML('home.html', saveBackup);
        writeToAlbums(GALLERY_MAIN_PATH, 'index.html', minified, hydrateRoot);
    };

    const hydrateStatic = async successCallback => {
        const sourceBasic = path.join(APP_DIRECTORY, 'basic.html');
        const basicHtml = await fs.promises.readFile(sourceBasic, 'utf8');
        const minifiedBasic = minify(basicHtml, minProps);

        const saveBackup = saveActiveBackup(successCallback);
        const hydrateRoot = hydrateRootHTML('home-basic.html', saveBackup);
        writeToAlbums(GALLERY_MAIN_PATH, 'index.html', minifiedBasic, hydrateRoot);
    };

    return {
        active: hydrateActive,
        static: hydrateStatic
    };

})();

const app =        hydrateAppFile('album-app.js', GALLERY_MAIN_PATH);
const appCSS =     hydrateAppFile('bundle.css', GALLERY_MAIN_PATH);
const globalCSS =  hydrateAppFile('global.css', GALLERY_MAIN_PATH);
                        
const basic =      hydrateAppFile('album-basic.js', GALLERY_MAIN_PATH);
const basicCSS =   hydrateAppFile('bundle-basic.css', GALLERY_MAIN_PATH);

const nav =        writeToRoot('nav-app.js', GALLERY_MAIN_PATH);
const navCSS =     writeToRoot('bundle-nav.css', GALLERY_MAIN_PATH);


const hydrateApp = status => async (successCallback) => {

    waitSerial(
        {
            hydrateHTML: hydrateHTML[status] || hydrateHTML['active'],

            app,
            appCSS,
            globalCSS,

            basic,
            basicCSS,

            nav,
            navCSS

        },
        successCallback
        // 'REPORT'
    );

};

module.exports = hydrateApp;
