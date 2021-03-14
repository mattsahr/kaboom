const prompt = require('prompt');
const colors = require('colors/safe');
const fs = require( 'fs' );
const { REMOTE_URLS_JSON } = require('../constants.js');


const saveURLs = async urls => {
    const json = JSON.stringify(urls);
    await fs.promises.writeFile(REMOTE_URLS_JSON, json);
    return true;
};

const getInputURL = async () => {

    return new Promise( async (resolve, reject) => {

        let REMOTE_URLS = await fs.promises.readFile(REMOTE_URLS_JSON, 'utf8');    
        REMOTE_URLS = JSON.parse(REMOTE_URLS);

        const urlSchema = {
            properties: {
                remoteURL: {
                    description: colors.blue('Remote gallery URL'),
                    type: 'string',
                    // pattern: /^(http|https):\/\//,
                    pattern: /^(http|https):\/\/[^ "]+$/,
                    message: 'Must be a valid url, starting with "http://" or "https://"',
                    default: REMOTE_URLS[0] || '',
                    required: true
                    // before: function(value) { return 'v' + value; }
                }
            }
        };

        prompt.start();
        prompt.message = '';
        prompt.delimiter = '';

        if (!REMOTE_URLS.length) {
            console.log('Please Enter the remote URL where your gallery is located');
            console.log('include "https://" or "http://" in the url');
        }

        prompt.get(urlSchema, async (err, result) => {

            if (err) {
                console.log('INPUT ERROR');
                console.log(err);
                process.exit(1);
            }

            const remoteURL = result.remoteURL;

            if (REMOTE_URLS[0] !== remoteURL) {
                REMOTE_URLS.unshift(remoteURL);
                await saveURLs(REMOTE_URLS);
            }

            resolve(remoteURL);

        });

    });

};

module.exports = getInputURL;