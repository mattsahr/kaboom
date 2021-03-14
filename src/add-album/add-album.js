const prompt = require('prompt');
const fs = require( 'fs' );
const path = require( 'path' );
const copyImages = require('./copy-process-images');
const colors = require('colors/safe');

const imgTypeMaster = {
    '.jpg':  true, 
    '.jpeg': true,
    '.png':  true,
    '.gif':  true
};

const getPathNameInput = async successCallback => {

    const pathSchema = {
        properties: {
            albumPath: {
                description: colors.blue('New Album: enter new directory name'),
                type: 'string',
                pattern: /^[A-Za-z0-9_-]+$/,
                message: 'Must be a valid pathname: letters, numbers, dashes, underscores',
                required: true
            }
        }
    };

    prompt.start();
    prompt.message = '';
    prompt.delimiter = '';

    prompt.get(pathSchema, (err, result) => {

        if (err) {
            console.log('INPUT ERROR');
            console.log(err);
            process.exit(1);
        }

        if (successCallback) {
            successCallback(result);
        }
    });
};

const getImageNames = async () => {
  const fileNames = await fs.promises.readdir(process.cwd());
    const imageNames = [];

    const imgTypes = { ...imgTypeMaster };

    for (const name of fileNames) {
        if (imgTypes[path.extname(name)]) {
            imgTypes[path.extname(name)] = (imgTypes[path.extname(name)] === true)
                ? 1
                : imgTypes[path.extname(name)] + 1;
            imageNames.push(name);
        }
    }

    console.log('------------------------');
    console.log(' ');
    console.log('CURRENT DIRECTORY');
    console.log(process.cwd());
    console.log(' ');

    if (!imageNames.length) {
        console.log('No images found');
        console.log(' ');

    } else {

        const jpg = ((imgTypes['.jpg'] === true) ? 0 : imgTypes['.jpg']) +
                    ((imgTypes['.jpeg'] === true) ? 0 : imgTypes['.jpeg']);

        const png = ((imgTypes['.png'] === true) ? 0 : imgTypes['.png']);
        const gif = ((imgTypes['.gif'] === true) ? 0 : imgTypes['.gif']);


        if (jpg) { console.log('    JPG images:  ' + (jpg < 10 ? ' ' : '') + jpg); }
        if (png) { console.log('    PNG images:  ' + (png < 10 ? ' ' : '') + png); }
        if (gif) { console.log('    GIF images:  ' + (gif < 10 ? ' ' : '') + gif); }


        console.log('------------------------');
        console.log('  TOTAL IMAGES:  ' + (imageNames.length < 10 ? ' ' : '') + imageNames.length);
        console.log(' ');
    }

    return imageNames;

};


const addAlbum = async successCallback => {

    const imageNames = await getImageNames();

    if (!imageNames.length) {
        process.exit(0);
    }

    getPathNameInput(copyImages(imageNames, successCallback));
 
};

module.exports = addAlbum;
