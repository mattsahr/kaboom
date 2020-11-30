const processActiveImages = require('./app/ingest-resize/ingest-resize.js');
const buildNav = require('./app/build-nav/build-nav.js');
const serve = require('./app/serve/serve.js');

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
