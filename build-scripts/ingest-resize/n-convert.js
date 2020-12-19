//  EXTERNAL DEPENDENCY
//  This module requires the "nconvert" library
//  https://www.xnview.com/en/nconvert/
//  nconvert must be installed separately, and availabe in PATH

const { exec } = require('child_process');

const base = 'nconvert -ratio -rtype lanczos -rexifthumb -opthuff -overwrite ';

const commands = {
    microscopic: base + ' -q 7 -rmeta -resize longest  100 -i ',
    // png:         base + '-out png -clevel 3 -resize longest  120 -i ',
    tiny:        base + '-q 60 -resize longest  400 -i ',
    small:       base + '-q 65 -resize longest  700 -i ',
    medium:      base + '-q 70 -resize longest 1200 -i ',
    large:       base + '-q 75 -resize longest 1700 -i '
};

const nConvert = (size, filepath, successCallback) => {
    const command = commands[size] + filepath;

    successCallback(filepath);

    // eslint-disable-next-line no-unused-vars
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log('EXTERNAL DEPENDENCY: "nconvert"');
            console.log('https://www.xnview.com/en/nconvert/');
            console.log('nconvert must be installed separately, and availabe in PATH');

            console.error(err);
        } else {
            successCallback(filepath);
        }
    });

};

module.exports = nConvert;