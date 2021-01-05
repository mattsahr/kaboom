const { helpFile, pp, shortHelp, unknownArg } = require('./help-file.js');
const buildDirectories = require('./build-directories/build-directories.js');
const processActiveImages = require('./ingest-resize/ingest-resize.js');
const checkStructure = require ('./helpers/check-structure.js');
const { waitSerial } = require('./helpers/helpers.js');
const { toStatic, toActive } = require('./helpers/move-albums.js');
const hydrateJSON = require ('./hydrate/hydrate-json.js');
const hydrateApp = require('./hydrate/hydrate-app.js');
const hydrateNavJSON = require('./hydrate/hydrate-nav-json');
const serve = require('./serve/serve.js');

const test = () => { console.log( '-------- TEST CALLBACK >>> Finished! ---------'); };

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
            waitSerial({
                checkStructure,
                thenToStatic: toStatic(option)
            });
            break;

        case 'to-active':
            waitSerial({
                checkStructure,
                thenToActive: toActive(option)
            });
            break;

        case 'serve':
            waitSerial({
                checkStructure,
                hydrateApp,
                thenHydrateNav: hydrateNavJSON(serve)
            });
            break;

        case 'init': 
            checkStructure(buildDirectories, 'init');
            break;

        case 'ingest':
            waitSerial({
                checkStructure,
                thenProcessImages:  processActiveImages(option /*, callbackNext */)
            });
            break;

        case 'test':
            hydrateJSON('./gallery-active/africa-ethiopia', test);
            break;

        default: 
            unknownArg(command);
    }

};

module.exports = cli;
