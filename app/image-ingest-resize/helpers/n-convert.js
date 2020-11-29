//  EXTERNAL DEPENDENCY
//  This module requires the "nconvert" library
//  https://www.xnview.com/en/nconvert/
//  nconvert must be installed separately, and availabe in PATH

const { exec } = require('child_process');

const base = 'nconvert -ratio -rtype lanczos -rexifthumb -opthuff -overwrite ';
const quality = '-q 70 ';

const commands = {
    microscopic: base + '-q 7 -rmeta -smoothingf 9 ' + 
                                  '-resize longest  120 -i ',
    tiny:        base + quality + '-resize longest  400 -i ',
    small:       base + quality + '-resize longest  700 -i ',
    medium:      base + quality + '-resize longest 1200 -i ',
    large:       base + quality + '-resize longest 1700 -i ',
};

const nConvert = (size, filepath, successCallback) => {
    const command = commands[size] + filepath;
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
        } else {
            successCallback(filepath);
        }
    });
};

module.exports = nConvert;