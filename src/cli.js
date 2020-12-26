const { helpFile, pp, shortHelp, unknownArg } = require('./help-file.js');
const buildDirectories = require('./build-scripts/build-directories/build-directories.js');
const processActiveImages = require('./build-scripts/ingest-resize/ingest-resize.js');
const { toStatic, toActive } = require('./build-scripts/helpers/move-albums.js');

const { next, waitSerial } = require ('./build-scripts/helpers/helpers.js');
const buildNav = require('./build-scripts/build-nav/build-nav.js');
const hydrateApp = require('./build-scripts/hydrate/hydrate-app.js');
const hydrateNavJSON = require('./build-scripts/hydrate/hydrate-nav-json');
const serve = require('./build-scripts/serve/serve.js');

const test = () => { console.log( '-------- TEST CALLBACK >>> Finished! ---------'); };

// TODO -- Handle building the nav.json

const cli = (args) => {

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
            helpFile.map(pp);
            break;
        case 'to-static':
            toStatic(option);
            break;
        case 'to-active':
            toActive(option);
            break;
        case 'test':
            // buildDirectories(test);
            break;
        case 'ingest': {
            const next = () => { processActiveImages(option, test); };
            buildDirectories(next);
            break;
        }
        default: 
            unknownArg(command);
    }
    // console.dir(args);
};

module.exports = cli;