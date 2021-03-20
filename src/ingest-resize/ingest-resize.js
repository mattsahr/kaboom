const fs = require('fs');
const path = require( 'path' );
const { replaceLastOrAdd } = require('../helpers/helpers.js');
const hydrateJSON = require('../hydrate/hydrate-json.js');
const getDirectoryName = require('./get-input-directory.js');
const { logIntro } = require('./ingest-resize-info.js');
const {
    APP_LOCAL_DIRECTORY,
    DEFAULT_IMAGE_DIRECTORY,
    GALLERY_MAIN_PATH,
    SVG_CONSTANTS
} = require('../constants.js');
const { spawn, Pool, Worker }  = require('threads');

let pool;

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

const TRANSFORM_SIZES = {
    tiny: 'tiny',
    small: 'small',
    medium: 'medium',
    large: 'large',
    svg: 'svg' // included to make sure "svg" directory is built
};


const batchTransform = async (size, albumName, remoteDir, successCallback) => {

    if (size === 'svg') { successCallback(size); return; }

    const transformTasks = [];

    if (!TRANSFORM_SIZES[size]) {
        console.error('No handler for size: ' + size);
        return;
    }

    const destination = TRANSFORM_SIZES[size];
    const sourcePath = path.join(remoteDir, DEFAULT_IMAGE_DIRECTORY);
    const sourceImages = await fs.promises.readdir(sourcePath);

    let totalToProcess = 0;

    /*
    const handleTransformResults = destination => {
        successes.push(destination);

        console.log(
            size + ' conversion [ ' + 
            (successes.length < 10 ? ('0' + successes.length) : successes.length) +
             ' ] of ' + 
            totalToProcess + ':  ' 
            + albumName);

        if (successes.length >= totalToProcess) {
            if (successCallback) { successCallback(size); }
        }
    };
    */

    console.log(' ');
    console.log('---- Resize images: [ ' + size + ' ] ----');

    const goodTypes = {
        '.png': true,
        '.jpg': true,
        '.jpeg': true,
        '.gif': true
    };

    const addTask = (size, fromPath, destinationPath) => {
        const task = pool.queue(worker => 
            worker.resizeAndSave(size, fromPath, destinationPath)
        );

        transformTasks.push(task);
    };

    for(const imagePath of sourceImages) {

        const fromPath = path.join(sourcePath, imagePath);
        const stat = await fs.promises.stat(fromPath);

        if(stat.isFile()) {
            const imgExtension = path.extname(fromPath);

            if (goodTypes[imgExtension]) {
                totalToProcess++;
                const sizedFile = replaceLastOrAdd(imagePath, imgExtension, '--' + size + '.jpg');

                const destinationPath = path.join(remoteDir, destination, sizedFile);
                // resizeAndSave(size, fromPath, destinationPath, handleTransformResults);

                addTask(size, fromPath, destinationPath);
                // handleTransformResults(destinationPath);
            }
        }
    }

    await Promise.all(transformTasks);

    console.log('Images Processed:', totalToProcess);

    successCallback();
};

const albumTransform = async (albumName, albumPath, successCallback) => {

    pool = SVG_CONSTANTS && SVG_CONSTANTS.CPU_THREADS
        ? Pool(
            () => spawn(new Worker('worker-resize-and-save.js')), 
            SVG_CONSTANTS.CPU_THREADS
          )
        : Pool(() => spawn(new Worker('worker-resize-and-save.js')));

    const sizes = Object.values(TRANSFORM_SIZES);
    let svgBuildCalled = false;

    const transformNext = async (priorSize) => {
        if (priorSize && priorSize !== 'svg') {
            console.log(albumName, priorSize, 'conversions complete');
        }

        if (sizes.length) {
            const next = sizes.shift();
            batchTransform(next, albumName, albumPath, transformNext);

        } else {
            if (!svgBuildCalled) {
                svgBuildCalled = true;
                await pool.terminate(true);

                console.log(' ');
                console.log(albumName, 'ALL CONVERSIONS COMPLETE');
                console.log(' ');

                successCallback(albumName, albumPath); // call to hydrateJSON(albumPath)
            }
        }
    };


    transformNext();

};


const processActiveImages = (() => {

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const suffixes = letters.concat(
            letters.map(a => a + a),
            letters.map(a => a + a + a),
            letters.map(a => a + a + a + a)
    );

    const renameDupes = async (fileNames, directory) => {

        const names = fileNames.map(next => [path.parse(next).name, path.parse(next).ext]);
        const unique = {};
        const dupes = [];

        for (const [name, ext] of names) {
            if (!unique[name]) {
                unique[name] = true;
            } else {
                dupes.push([name, ext]);
            }
        }

        if (dupes.length) {

            for (const [dupe, ext] of dupes) {

                for (const suffix of suffixes) {
                    const replacement = dupe + '-' + suffix;

                    if (!unique[replacement]) {
                        unique[replacement] = true;

                        await fs.promises.rename(
                            path.join(directory, dupe + ext), 
                            path.join(directory, replacement + ext)
                        );

                        break;
                    }
                }
            }

        }
    };

    const clearDirectory = async pathName => {
        const files = await fs.promises.readdir(pathName);

        for (const file of files) {
            await fs.promises.unlink(path.join(pathName, file));
        }

        return true;
    };

    const surveyAlbum = async (albumName, albumPath, successCallback, finalCallback) => {

        const topItems = await fs.promises.readdir(albumPath);
        const originalPath = path.join(albumPath, DEFAULT_IMAGE_DIRECTORY);

        if (!topItems.includes(DEFAULT_IMAGE_DIRECTORY)) {
            console.error('No directory found: ' + DEFAULT_IMAGE_DIRECTORY);
            return;
        }

        const originals = await fs.promises.readdir(originalPath);
        if (!originals.length) {
            console.error('No images found: ' + originalPath);
            return;
        }

        await renameDupes(originals, originalPath);

        for (const size of Object.values(TRANSFORM_SIZES)) {
            const sizePath = path.join(albumPath, size);
            if (!topItems.includes(size)) {
                fs.mkdirSync(sizePath);
            } else {
                await clearDirectory(sizePath);
            }
        }

        if (successCallback) { 
            successCallback(albumName, albumPath, finalCallback);
        }
    };

    const buildAlbumConversionSuccess = (allAlbums, successCallback) => {  
        return (albumName, albumPath) => {
            hydrateJSON(albumName, albumPath, successCallback);
        };
    };

    return (albumArgument, successCallback, skipNameInput) => async () => {

        if (!skipNameInput) {
            logIntro();
        }

        const albumName = skipNameInput 
            ? albumArgument
            : await getDirectoryName(albumArgument);

        const workingPath = GALLERY_MAIN_PATH;
        const gallery = await fs.promises.readdir(workingPath);

        const albumPaths = [];
        for (const item of gallery.filter(notAppDir)) {
            if (albumName && item !== albumName) {
                continue;
            }
            const albumPath = path.join(workingPath, item);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) {
                albumPaths.push(albumPath);
            }
        }

        if (!albumPaths.length) {
            console.log(' ');
            if (albumName) {
                console.log('Album [' + albumName + '] not found in /gallery-active');
            } else {
                console.log('No albums to process in /gallery-active');    
            }
            console.log(' ');
            if (successCallback) { successCallback(); }
            return;
        }

        const surveyNext = albumPath => {
            surveyAlbum(albumName, albumPath, albumTransform, conversionSuccess);
        };

        const proceed = () => {
            if (albumPaths.length) {
                const albumPath = albumPaths.shift();
                surveyNext(albumPath);
            } else if (successCallback) { 
                successCallback(); 
            }
        };

        const conversionSuccess = buildAlbumConversionSuccess(albumPaths, proceed);

        proceed();

    };

})();

module.exports = processActiveImages;
