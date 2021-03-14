const path = require( 'path' );
const prompt = require('prompt');
const colors = require('colors/safe');
const fs = require( 'fs' );
const { 
    APP_LOCAL_DIRECTORY, 
    GALLERY_MAIN_PATH 
} = require('../constants.js');

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

const getInputDirectory = async (albumArgument) => {
    return new Promise( async (resolve, reject) => {

        const galleryNames = await fs.promises.readdir(GALLERY_MAIN_PATH);
        const albums = [];

        for (const name of galleryNames.filter(notAppDir)) {
            const albumPath = path.join(GALLERY_MAIN_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { albums.push(name); }
        }

        const directorySchema = {
            properties: {
                directoryName: {
                    description: colors.blue('album directory name'),
                    type: 'string',
                    message: '\n\nMust be a valid directory in the gallery:\n\n' + 
                        albums.map(album => '    ' + album + '\n').join('') + 
                        '\nMust be a valid directory in the gallery:\n',
                    conform: function (value) {
                        return albums.includes(value);
                    },
                    default: albumArgument || albums[0] || '',
                    required: true
                    // before: function(value) { return 'v' + value; }
                }
            }
        };

        prompt.start();
        prompt.message = '';
        prompt.delimiter = '';

        prompt.get(directorySchema, async (err, result) => {

            if (err) {
                console.log('INPUT ERROR');
                console.log(err);
                process.exit(1);
            }

            const directoryName = result.directoryName;

            resolve(directoryName);

        });


    });
};


module.exports = getInputDirectory;
