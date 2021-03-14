const prompt = require('prompt');
const colors = require('colors/safe');

const gotYes = {
    'y'  : true,
    'ye' : true,
    'yes': true,
    'Y'  : true,
    'Ye' : true,
    'Yes': true,
    'YE' : true,
    'YES': true
};

const gotNo = {
    'n' : true,
    'no': true,
    'N' : true,
    'No': true,
    'NO': true
};


const confirmPrompt = async (message, preamble, defaultResponse) => {

    return new Promise((resolve, reject) => {

        if (preamble) { console.log(colors.green(preamble)); }

        const confirmSchema = {
            properties: {
                confirmation: {
                    description: colors.brightGreen(message),
                    type: 'string',
                    default: defaultResponse || 'yes',
                    conform: function(input) {
                        return gotNo[input] || gotYes[input];
                    },
                    messsage: 'Must be "Y" "yes" -- or -- "N" "no"',
                    required: true
                }
            }
        };

        prompt.start();
        prompt.message = '';
        prompt.delimiter = '';

        prompt.get(confirmSchema, (err, result) => {

            if (err) {
                console.log('INPUT ERROR');
                console.log(err);
                process.exit(1);
            }

            if (gotYes[result.confirmation]) {
                resolve(true);
            } else {
                process.exit(0);
            }

        });

    });

};

module.exports = confirmPrompt;
