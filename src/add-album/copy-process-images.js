const prompt = require('prompt');
const fs = require( 'fs' );
const path = require( 'path' );
const { 
    checkFile, 
    copyFile,
    waitSerial 
} = require('../helpers/helpers.js');
const {
    DEFAULT_IMAGE_DIRECTORY,
    GALLERY_MAIN_PATH
} = require('../constants.js');
const processImages = require('../ingest-resize/ingest-resize.js');
const { checkStructure } = require ('../helpers/check-structure.js');
const confirmPrompt = require('../helpers/confirm-prompt.js');


const composeCopyImages = (imageNames, successCallback) => async input => {

    const albumPath = path.join(GALLERY_MAIN_PATH, input.albumPath);
    const imageDirPath = path.join(GALLERY_MAIN_PATH, input.albumPath, DEFAULT_IMAGE_DIRECTORY);

    console.log(' ');

    if (!checkFile(albumPath)) {

        await confirmPrompt(
            'Create new?',
            'The album "' + input.albumPath + '" does not exist.'
        );
        fs.mkdirSync(albumPath);

    } else {

        await confirmPrompt(
            'Add/update these images?', 
            'The album "' + input.albumPath + '" already exists.'
        );
    }

    if (!checkFile(imageDirPath)) {
        fs.mkdirSync(imageDirPath);
    }

    const processImages = composeProcessImages(input.albumPath, successCallback);
    const currentDir = process.cwd();

    const copyNextImage = () => {
        if (imageNames.length) {
            const imgName = imageNames.shift();
            const source = path.join(currentDir, imgName);
            const destination = path.join(imageDirPath, imgName);
            copyNext(source, destination);
        } else {
            processImages();
        }
    };

    const copyNext = (source, destination) => {
        copyFile(source, destination, copyNextImage);
    };

    copyNextImage();

};

const composeProcessImages = (albumPath, successCallback) => async () => {

    console.log(' ');
    console.log('PROCESS albumPath', albumPath);
    console.log(' ');

    waitSerial({
        checkStructure,
        thenProcessImages:  processImages(albumPath, successCallback, 'skipNameInput')
    });

};

module.exports = composeCopyImages;