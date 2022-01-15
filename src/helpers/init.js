const { copyFile } = require ('./helpers.js');
const { updateConstants } = require ('./update-constants.js');

const init = async successCallback => {

    const copyFinal = copyError => {
        if (copyError) {
            console.log('copyERROR');
            console.log(copyError);
            console.log(' ');
            console.log('Only run "kaboom init" from the root /kaboom/ directory');
            console.log(' ');
            process.exit(1);
        }

        updateConstants(successCallback);
    };

    const toCopy = [
        {
            source: 'src/dummy/site-config.json',
            target: 'src/site-config.json'
        },
        {
            source: 'src/dummy/remote-urls.json',
            target: 'src/remote-urls.json'
        }
    ];

    
    const copyNextSuccess = (() => {
        let errorz = undefined;
        return err => {
            errorz = errorz || err; 
            if (toCopy.length) { copyNext(); } else { copyFinal(errorz); }
        };
    })();

    const copyNext = () => {
        const { source, target } = toCopy.pop();
        copyFile(source, target, copyNextSuccess);
    };

    copyNext();
};

module.exports = init;
