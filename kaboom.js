const processActiveImages = require('./build-scripts/ingest-resize/ingest-resize.js');
const buildNav = require('./build-scripts/build-nav/build-nav.js');
const buildDirectories = require('./build-scripts/build-directories/build-directories.js');
const serve = require('./build-scripts/serve/serve.js');

const args = process.argv.slice(2);

const test = () => { console.log( '-------- Finished! ---------'); };

switch (args[0]) {
    case 'ingest':
        buildDirectories(processActiveImages);
        break;
    case 'nav':
        buildDirectories(buildNav);
        break;
    case 'serve':
        serve();
        break;
    default:
        buildDirectories(test);
}
