const fs = require('fs');
const path = require('path');
const { 
    DEFAULT_IMAGE_DIRECTORY,
    GALLERY_MAIN_PATH
} = require('../constants.js');
const { replaceLastOrAdd } = require('../helpers/helpers.js');

const deleteImage = (() => {

    const TRANSFORM_SIZES = {
        tiny: 'tiny',
        small: 'small',
        medium: 'medium',
        large: 'large',
        svg: 'svg',
        original: DEFAULT_IMAGE_DIRECTORY
    };

    const targets = Object.values(TRANSFORM_SIZES);

    const deleteFile = (pathName, sourceName) => size => {

        const imgExtension = path.extname(sourceName);
        const sizedFile = size === DEFAULT_IMAGE_DIRECTORY
            ? sourceName
            : size === 'svg'
                ? replaceLastOrAdd(sourceName, imgExtension, '.svg')
                : replaceLastOrAdd(sourceName, imgExtension, '--' + size + '.jpg');

        const filePath = path.join(pathName, size, sizedFile);

        fs.unlink(filePath, err => {
            if (err) throw err;
        });

    };
    
    return async (source, fileName, errCallback) => {


        const albumPath = path.join(GALLERY_MAIN_PATH, source || '');
        const stat = await fs.promises.stat(albumPath);

        if (stat.isDirectory()) { 

            targets.map(deleteFile(albumPath, fileName));


        } else {

            console.log('DELETE IMAGE >> Directory not found: ' + albumPath);
            errCallback('DELETE IMAGE >> Directory not found: ' + albumPath);

        }

    };

})();

module.exports = deleteImage;
