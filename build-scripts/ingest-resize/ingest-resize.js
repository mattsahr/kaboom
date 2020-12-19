const fs = require( 'fs' );
const path = require( 'path' );
const { copyFile, replaceLastOrAdd } = require('../helpers/helpers.js');
const nConvert = require('./n-convert.js');
const primitive = require('./primitive.js');
const hydrateJSON = require('../hydrate/hydrate-json.js');
const hydrateNavJSON = require('../hydrate/hydrate-nav-json.js');

const {
    DEFAULT_IMAGE_DIRECTORY,
    GALLERY_ACTIVE_PATH
} = require('../constants.js');

const TRANSFORM_SIZES = {
    // microscopic: 'microscopic',
    tiny: 'tiny',
    small: 'small',
    medium: 'medium',
    large: 'large'
    // svg: 'svg'
    // png: 'png'
};

const transform = (size, source, destination, handleResults) => {

    const handleCopyResults = err => {
        if (err) {
            console.log('Copy File: error');
            console.log(err);
        } else {
            nConvert(size, destination, handleResults);
        }
    };

    copyFile(source, destination, handleCopyResults);
};

const batchTransform = async (size, remoteDir, successCallback) => {

    if (size === 'svg') { return; }

    if (!TRANSFORM_SIZES[size]) {
        console.error('No handler for size: ' + size);
        return;
    }

    const destination = TRANSFORM_SIZES[size];
    const sourcePath = path.join(remoteDir, DEFAULT_IMAGE_DIRECTORY);
    const sourceImages = await fs.promises.readdir(sourcePath);

    let totalToProcess = 0;
    const successes = [];

    const handleTransformResults = destination => {
        successes.push(destination);

        console.log(
            size + ' conversion [ ' + 
            (successes.length < 10 ? ('0' + successes.length) : successes.length) +
             ' ] of ' + 
            totalToProcess + ':  ' 
            + destination);

        if (successes.length >= totalToProcess) {
            if (successCallback) { successCallback(size); }
        }
    };

    console.log(' ');
    console.log('---- Resize images: [ ' + size + ' ] ----');

    for(const imagePath of sourceImages) {

        const fromPath = path.join(sourcePath, imagePath);
        const stat = await fs.promises.stat(fromPath);

        if(stat.isFile()) {

            totalToProcess++;
            const sizedFile = size === 'png'
                ? replaceLastOrAdd(imagePath, '.jpg', '.png')
                : replaceLastOrAdd(imagePath, '.jpg', '--' + size + '.jpg');

            const destinationPath = path.join(remoteDir, destination, sizedFile);
            transform(size, fromPath, destinationPath, handleTransformResults);
        }
    }
};

const buildSVG = async (albumPath, successCallback) => {
    const sourcePath = path.join(albumPath, DEFAULT_IMAGE_DIRECTORY);

    console.log('BUILD SVG', sourcePath);
    console.log('Be patient... SVG creation can take a while.');
    console.log(' ');

    const sourceImages = await fs.promises.readdir(sourcePath);

    const toProcess = [];
    let total = 0;
    let finished = 0;

    const handleConversionResults = (destination) => {
        if (destination) {
            finished++;
            console.log(
                'SVG [ ' + finished + ' ] of ' + total + ':  ' + destination
            );
        }

        if (toProcess.length) {
            const imagePath = toProcess.shift();
            const fromPath = path.join(sourcePath, imagePath);
            const svgFile = replaceLastOrAdd(imagePath, '.jpg', '.svg');
            const destinationPath = path.join(albumPath, 'svg', svgFile);

            primitive(fromPath, destinationPath, handleConversionResults);
        } else {
            console.log(albumPath, ' ');
            console.log(albumPath, '-- all SVG images complete');
            successCallback(albumPath);
        }
    };    

    for(const imagePath of sourceImages) {
        const fromPath = path.join(sourcePath, imagePath);
        const stat = await fs.promises.stat(fromPath);

        if(stat.isFile()) {
           toProcess.push(imagePath);
           total++;
       }
    }

    handleConversionResults();
};

const albumTransform = async (albumPath, successCallback) => {

    const sizes = Object.values(TRANSFORM_SIZES);
    let svgBuildCalled = false;

    const transformNext = (priorSize) => {
        if (priorSize) {
            console.log(albumPath, priorSize, 'conversions complete');
        }

        if (sizes.length) {
            const next = sizes.shift();
            batchTransform(next, albumPath, transformNext);

        } else {
            if (!svgBuildCalled) {
                svgBuildCalled = true;

                console.log(' ');
                console.log(albumPath, 'ALL CONVERSIONS COMPLETE');
                console.log(' ');

                buildSVG(albumPath, successCallback);      
            }
        }
    };

    transformNext();

};


const processActiveImages = (() => {

    const surveyAlbum = async (albumPath, successCallback, finalCallback) => {

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

        for (const size of Object.values(TRANSFORM_SIZES)) {
            if (!topItems.includes(size)) {
                const sizePath = path.join(albumPath, size);
                fs.mkdirSync(sizePath);
            }
        }

        const fullItems = await fs.promises.readdir(albumPath);
        console.log(albumPath, '---- all directories ----');
        for (const item of fullItems) {
            console.log('    ' + item);
        }
        console.log('---- ---- ----');
        console.log('  ');

        if (successCallback) { 
            successCallback(albumPath, finalCallback);
        }
    };



    const buildAlbumConversionSuccess = allAlbums => {  

        const finished = [];

        const jsonSuccess = (albumPath) => {
            finished.push(albumPath);
            if (finished.length >= allAlbums.length) {
                console.log(' ');
                console.log('---- All "album-meta.json" files processed ----');
                console.log('---- Building Nav JSON ----');
                hydrateNavJSON();
            }
        };

        return albumPath => {
            console.log(' ');
            console.log('---- ' + albumPath + ' --- Collect all metadata in a json file ----');
            hydrateJSON(albumPath, 'svg', DEFAULT_IMAGE_DIRECTORY, jsonSuccess);
        };
    };

    return async galleryPath => {
        const workingPath = galleryPath || GALLERY_ACTIVE_PATH;
        const gallery = await fs.promises.readdir(workingPath);

        const albums = [];
        for (const item of gallery) {
            const albumPath = path.join(workingPath, item);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) {
                albums.push(albumPath);
            }
        }

        const conversionSuccess = buildAlbumConversionSuccess(albums);

        for (const item of gallery) {
            const albumPath = path.join(workingPath, item);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) {
                surveyAlbum(albumPath, albumTransform, conversionSuccess);
            }
        }

    };

})();

module.exports = processActiveImages;