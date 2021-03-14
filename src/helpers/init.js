const path = require( 'path' );
const replace = require('replace-in-file');
const { copyFile } = require ('./helpers.js');

const doubleBackSlash = (() => {
    const backSlash = /\\/g;
    const tripleBackSlash = /\\\\\\/g;
    return str => str.replace(backSlash, '\\\\').replace(tripleBackSlash, '\\\\');
})(); 

const init = async successCallback => {

    const updateConstants = () => {
        const constantsPath = path.join('src', 'constants.js');
        const current = process.cwd();

        const gallery = doubleBackSlash(path.join(current, 'gallery'));
        const appPages = doubleBackSlash(path.join(current, 'app', 'pages'));
        const dummy = doubleBackSlash(path.join(current, 'src', 'dummy'));
        const urlsJson = doubleBackSlash(path.join(current, 'src', 'remote-urls.json'));

        const options = {
            files: constantsPath,
            from: [
                './gallery', './app/pages', './src/dummy', './src/remote-urls.json',
                'DUMMY: true', 'SHOULD BE', 'COMMAND RUNS'
            ],
            to: [
                gallery, appPages, dummy, urlsJson,
                'PATHS_INITIALIZED: true', 'WERE', 'COMMAND WAS RUN'
            ],
            countMatches: true
        };

        const results = replace.sync(options);

        if (results && results.length === 1) {
            if (successCallback) { 
                successCallback(); 
            } else {
                console.log(' ');
                console.log('INIT SUCCESS');
                console.log(' ');
            }

        } else {
            console.log(' ');
            console.log('INIT ERROR');
            console.log(' ');
            console.log('Constants were not updated');
            console.log('update target: ', constantsPath);
            console.log(' ');
            process.exit(1);
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

/*
    const copy3 = () => {
        const source = 'src/dummy/site-config.json';
        const target = 'src/site-config.json';
        copyFile(source, target, copyFinal);
    };

    const copy2 = () => {
        const source = 'src/dummy/constants.js';
        const target = 'src/constants.js';
        copyFile(source, target, copy3);
    };

    const copy1 = () => {
        const source = 'src/dummy/remote-urls.json';
        const target = 'src/remote-urls.json';
        copyFile(source, target, copy2);
    };
*/
    const toCopy = [
        {
            source: 'src/dummy/site-config.json',
            target: 'src/site-config.json'
        },
        {
            source: 'src/dummy/constants.js',
            target: 'src/constants.js'
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

    // copy1();

};

module.exports = init;
