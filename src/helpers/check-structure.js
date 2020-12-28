const fs = require( 'fs' );
const path = require( 'path' );

const {
    APP_DIRECTORY,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH
} = require('../constants.js');

const directories = [
    path.join(APP_DIRECTORY, ''),
    path.join(GALLERY_ACTIVE_PATH, ''),
    path.join(GALLERY_STATIC_PATH, '')
];

const initDirectories = [
    path.join(APP_DIRECTORY, '')
];

const files = [
    path.join(APP_DIRECTORY, 'basic.html'),
    path.join(APP_DIRECTORY, 'nav-app.js'),
    path.join(APP_DIRECTORY, 'bundle-nav.css'),
    path.join(APP_DIRECTORY, '__app/album-app.js'),
    path.join(APP_DIRECTORY, '__app/album-basic.js'),
    path.join(APP_DIRECTORY, '__app/bundle.css'),
    path.join(APP_DIRECTORY, '__app/bundle-basic.css'),
    path.join(APP_DIRECTORY, '__app/global.css')
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


const checkStructure = (successCallback, init) => {

    const errors = [];

    for (const directory of (init ? initDirectories : directories)) {
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
        console.log(' ');
        console.log('Are you in the /kaboom/ directory root?');
        console.log(' ');
        process.exit(1);
    } else {
        if (successCallback) { successCallback(); }
    }

};

module.exports = checkStructure;