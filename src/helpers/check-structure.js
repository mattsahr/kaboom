const fs = require( 'fs' );
const path = require( 'path' );

const {
    APP_DIRECTORY,
    APP_LOCAL_DIRECTORY,
    GALLERY_MAIN_PATH
} = require('../constants.js');

const directories = [
    path.join(APP_DIRECTORY, ''),
    path.join(GALLERY_MAIN_PATH, '')
];

const initDirectories = [
    path.join(APP_DIRECTORY, '')
];

const files = [
    path.join(APP_DIRECTORY, 'basic.html'),
    path.join(APP_DIRECTORY, 'nav-app.js'),
    path.join(APP_DIRECTORY, 'bundle-nav.css'),
    path.join(APP_DIRECTORY, APP_LOCAL_DIRECTORY, 'album-app.js'),
    path.join(APP_DIRECTORY, APP_LOCAL_DIRECTORY, 'album-basic.js'),
    path.join(APP_DIRECTORY, APP_LOCAL_DIRECTORY, 'bundle.css'),
    path.join(APP_DIRECTORY, APP_LOCAL_DIRECTORY, 'bundle-basic.css'),
    path.join(APP_DIRECTORY, APP_LOCAL_DIRECTORY, 'global.css')
];

const checkFile = path => {
    try {
        if (fs.existsSync(path)) {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
};

const checkStructureInit = successCallback => {
    const errors = [];

    for (const directory of initDirectories) {
        if (!checkFile(directory)) {
            errors.push('DIRECTORY: ' + directory + '  NOT FOUND');
        }
    }

    for (const file of files) {
        if (!checkFile(file)) {
            errors.push('FILE:      ' + file + '  NOT FOUND');
        }
    }

    if (errors.length) {
        for (const errorMsg of errors) {
            console.log(errorMsg);
        }
        process.exit(1);
    } else {
        console.log('checkStructure FINISHED');
        if (successCallback) { successCallback(); }
    }

};

const checkStructure = successCallback => {
    const errors = [];

    for (const directory of directories) {
        if (!checkFile(directory)) {
            errors.push('DIRECTORY: ' + directory + '  NOT FOUND');
        }
    }

    for (const file of files) {
        if (!checkFile(file)) {
            errors.push('FILE:      ' + file + '  NOT FOUND');
        }
    }

    if (errors.length) {
        for (const errorMsg of errors) {
            console.log(errorMsg);
        }
        if (!checkFile(GALLERY_MAIN_PATH) && errors.length === 1) {
            console.log(' ');
            console.log('From the /kaboom/ directory root,');
            console.log('Run "kaboom init" to set up the ' + GALLERY_MAIN_PATH + ' directory.');
            console.log('This set up the ' + GALLERY_MAIN_PATH + ' directory.');
            console.log(' ');
        }

        process.exit(1);
    } else {

        console.log('checkStructure FINISHED');

        if (successCallback) { successCallback(); }
    }

};

module.exports = { 
    checkStructure,
    checkStructureInit
};