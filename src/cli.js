const { 
    helpFile, 
    pp, 
    shortHelp, 
    unknownArg 
} = require('./help-file.js');
const buildDirectories = require('./build-directories/build-directories.js');
const processActiveImages = require('./ingest-resize/ingest-resize.js');
const {
    checkStructure,
    checkStructureInit 
} = require ('./helpers/check-structure.js');
const { waitSerial } = require('./helpers/helpers.js');
const deployCompare = require('./deploy/deploy-compare.js');
// const hydrateJSON = require ('./hydrate/hydrate-json.js');
const addAlbum = require ('./add-album/add-album.js');
const hydrateApp = require('./hydrate/hydrate-app.js');
const hydrateNavJSON = require('./hydrate/hydrate-nav-json');
const serve = require('./serve/serve.js');
const init = require('./helpers/init.js');


const test = () => { 
    console.log( '-------- TEST CALLBACK >>> Finished! ---------'); 
    process.exit(0);
};

const exitCallback = () => {
    process.exit(0);
};

const cli = args => {

    const command = args[2];
    const option = args[3];

    switch(command) {

        case undefined:
            shortHelp.map(pp);
            break;

        case 'help':
        case '-h':
        case '-help':
        case '--help':
            if (option) { 
                if (helpFile[option]) {
                    helpFile[option].map(pp);    
                } else {
                    shortHelp.map(pp);
                    console.log('');
                    console.log('Unknown command: "kaboom ' + option + '"');
                    console.log('');
                    console.log('');
                }
            } else {
                helpFile.default.map(pp);
            }
            break;

        case 'serve':
            waitSerial({
                checkStructure,
                hydrateApp: hydrateApp(option),
                thenHydrateNav: hydrateNavJSON(serve)
            });
            break;

        case 'init': {
            waitSerial({
                init,
                checkStructureInit,
                buildDirectories,
                processDemo: processActiveImages('demo-album',exitCallback, 'skipNameInput')
            });
            break;
        }

        case 'ingest':
            waitSerial({
                checkStructure,
                thenProcessImages:  processActiveImages(option, exitCallback, option)
            });
            break;

        case 'compare':
            deployCompare(option, exitCallback);
            break;

        case 'add':
            addAlbum(exitCallback);
            break;

        case 'static':
            hydrateApp('static')(exitCallback);
            break;

        case 'test':
            init();
            // hydrateJSON('./gallery-active/africa-ethiopia', test);
            break;

        default: 
            unknownArg(command);
    }

};

module.exports = cli;
