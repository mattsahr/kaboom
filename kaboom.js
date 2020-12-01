const processActiveImages = require('./dev/ingest-resize/ingest-resize.js');
const buildNav = require('./dev/build-nav/build-nav.js');
const serve = require('./dev/serve/serve.js');

const args = process.argv.slice(2);

switch (args[0]) {
    case 'ingest':
        processActiveImages();
        break;
    case 'nav':
        buildNav();
        break;
    case 'serve':
        serve();
        break;
    default:
        console.log('unkown command: ' + args[0]);
}
