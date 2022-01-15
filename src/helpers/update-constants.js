const path = require( 'path' );
const fs = require( 'fs' );
const constantsSOURCE = require ('../dummy/constants.js');

const updateConstants = async (successCallback) => {

    const constants = {...constantsSOURCE };

    delete constants.DUMMY;
    constants.PATHS_INITIALIZED = true;

    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    constants.INIT_STATUS = "UPDATED VIA 'kaboom init' -- " + 
        new Date().toLocaleDateString("en-US", dateOptions);

    const current = process.cwd();

    constants.APP_DIRECTORY = path.join(current, 'app', 'pages');
    constants.DUMMY_RESOURCE_PATH = path.join(current, 'src', 'dummy');
    constants.REMOTE_URLS_JSON = path.join(current, 'src', 'remote-urls.json');
    constants.GALLERY_MAIN_PATH = path.join(current, 'gallery');    
    constants.PROCESS_DIRECTORY = path.join(current, 'src');

    if (!successCallback) {
        console.log('NEW CONSTANTS');
        console.log(constants);
    }

    const fileString = 'module.exports = ' + JSON.stringify(constants, null, 4) + ';\n';
    const constantsPath = path.join('src', 'constants.js');
    await fs.promises.writeFile(constantsPath, fileString);

    if (!successCallback) {
        console.log('await writeFile FINISHED:', constantsPath);
    }

    if (successCallback) {
        successCallback();
    }
};

const testConstants = async () => {

    const constants = {...constantsSOURCE };

    delete constants.DUMMY;
    constants.PATHS_INITIALIZED = true;

    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    constants.INIT_STATUS = "UPDATED VIA 'kaboom init' -- " + 
        new Date().toLocaleDateString("en-US", dateOptions);

    const current = process.cwd();

    constants.APP_DIRECTORY = path.join(current, 'app', 'pages');
    constants.DUMMY_RESOURCE_PATH = path.join(current, 'src', 'dummy');
    constants.REMOTE_URLS_JSON = path.join(current, 'src', 'remote-urls.json');
    constants.GALLERY_MAIN_PATH = path.join(current, 'gallery');    
    constants.PROCESS_DIRECTORY = path.join(current, 'src');

    console.log('NEW CONSTANTS');
    console.log(constants);

};

module.exports = {
    updateConstants,
    testConstants
};
