const processActiveImages = require('./app/image-ingest-resize/image-ingest-resize.js');

const args = process.argv.slice(2);

switch (args[0]) {
    case 'ingest':
        processActiveImages();
        break;
    default:
        console.log('unkown command: ' + args[0]);
}