const fs = require( 'fs' );
const path = require( 'path' );
const { copyFile, replaceLastOrAdd } = require('../helpers/helpers.js');
const nConvert = require('../helpers/n-convert.js');
const collectMeta = require('../helpers/collect-meta.js');
const {
    DEFAULT_IMAGE_DIRECTORY,
    GALLERY_ACTIVE_PATH
} = require('../constants.js');

const TRANSFORM_SIZES = {
    microscopic: 'microscopic',
    // tiny: 'tiny',
    // small: 'small',
    medium: 'medium'
    // large: 'large'
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

const batchTransform = async (size, remoteDir) => {

    if (!TRANSFORM_SIZES[size]) {
        console.error('No handler for size: ' + size);
        return;
    }

    const destination = TRANSFORM_SIZES[size];
    const sourcePath = path.join(remoteDir, DEFAULT_IMAGE_DIRECTORY);
    const sourceImages = await fs.promises.readdir(sourcePath);

    let totalToProcess = 0;
    const successes = [];

    const handleTransformResults = (destination) => {
        successes.push(destination);
        if (size === 'microscopic' && successes.length >= totalToProcess) {
            console.log(' ');
            console.log('---- Collect Data URI strings in a json file ----');
            collectMeta(remoteDir, size, DEFAULT_IMAGE_DIRECTORY);
        } else {
            console.log(
                size + ' conversion [ ' + 
                (successes.length < 10 ? ('0' + successes.length) : successes.length) +
                 ' ] of ' + 
                totalToProcess + ':  ' 
                + destination);
        }
    };

    console.log(' ');
    console.log('---- Resize images: [ ' + size + ' ] ----');

    for(const imagePath of sourceImages) {

        const fromPath = path.join(sourcePath, imagePath);
        const stat = await fs.promises.stat(fromPath);

        if(stat.isFile()) {

            totalToProcess++;
            const sizedFile = replaceLastOrAdd(imagePath, '.jpg', '--' + size + '.jpg');

            const destinationPath = path.join(remoteDir, destination, sizedFile);
            transform(size, fromPath, destinationPath, handleTransformResults);
        }
    }
};


const albumTransform = async albumPath => {
    for (const size of Object.values(TRANSFORM_SIZES)) {
        batchTransform(size, albumPath);
    } 
};


const processActiveImages = (() => {

    const surveyAlbum = async (albumPath, successCallback) => {

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
        console.log('--- all directories ---', albumPath);
        for (const item of fullItems) {
            console.log(item);
        }

        successCallback(albumPath);
    };

    return async galleryPath => {
        const workingPath = galleryPath || GALLERY_ACTIVE_PATH;
        const gallery = await fs.promises.readdir(workingPath);

        for (const item of gallery) {
            const albumPath = path.join(workingPath, item);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) {
                surveyAlbum(albumPath, albumTransform);
            }
        }
    };

})();

module.exports = processActiveImages;