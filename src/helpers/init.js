const path = require( 'path' );
const fs = require( 'fs' );
const { copyFile } = require ('./helpers.js');
const constantsSOURCE = require ('../dummy/constants.js');


const init = async successCallback => {

    const updateConstants = async () => {

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

        const fileString = 'module.exports = ' + JSON.stringify(constants, null, 4) + ';\n';
        const constantsPath = path.join('src', 'constants.js');
        await fs.promises.writeFile(constantsPath, fileString);

        if (successCallback) {
            successCallback();
        }
    };


    const copyFinal = copyError => {
        if (copyError) {
            console.log('copyERROR');
            console.log(copyError);
            console.log(' ');
            console.log('Only run "kaboom init" from the root /kaboom/ directory');
            console.log(' ');
            process.exit(1);
        }

        updateConstants();
    };

    const toCopy = [
        {
            source: 'src/dummy/site-config.json',
            target: 'src/site-config.json'
        },
        {
            source: 'src/dummy/remote-urls.json',
            target: 'src/remote-urls.json'
        }
    ];

    
    const copyNextSuccess = (() => {
        let errorz = undefined;
        return err => {
            errorz = errorz || err; 
            if (toCopy.length) { copyNext(); } else { copyFinal(errorz); }
        };
    })();

    const copyNext = () => {
        const { source, target } = toCopy.pop();
        copyFile(source, target, copyNextSuccess);
    };

    copyNext();
};

module.exports = init;
