const { helpFile, pp, shortHelp, unknownArg } = require('./help-file.js');
const buildDirectories = require('./build-directories/build-directories.js');
const processActiveImages = require('./ingest-resize/ingest-resize.js');
const { toStatic, toActive } = require('./helpers/move-albums.js');
const hydrateJSON = require ('./hydrate/hydrate-json.js');
const hydrateApp = require('./hydrate/hydrate-app.js');
const hydrateNavJSON = require('./hydrate/hydrate-nav-json');
const serve = require('./serve/serve.js');

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
            hydrateJSON('./gallery-active/india-mahabs', 'svg', '__original', test);
            // buildDirectories(test);
            break;
        case 'serve':
            hydrateApp(() => { hydrateNavJSON(serve); });
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