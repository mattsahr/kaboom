//  EXTERNAL DEPENDENCY
//  This module requires the "primitive" go library
//  https://github.com/fogleman/primitive
//  primitive must be installed separately

const { exec } = require('child_process');

const PROCESS_THREADS = 3; // use 3 process threads -- set to 0 to use all possible threads

const shapes = {
    all: ' -m 0',
    triangle: ' -m 1',
    rectangle: ' -m 2',
    ellipse: ' -m 3',
    circle: ' -m 4',
    rotatedRect: ' -m 5',
    beziers: ' -m 6',
    rotatedEllipse: ' -m 7',
    polygon: ' -m 8'
};

const buildCommand = (sourcePath, destinationPath) => 
    'primitive' + 
    ' -i ' + sourcePath + 
    ' -o ' + destinationPath + 
    ' -j ' + PROCESS_THREADS + // use X process threads
    ' -a 0' + // let algorithm choose opacity 
    ' -bg F0F0F0' + // starting background is off white
    ' -s 256' + // size 256px output
    ' -n 100' + // draw 100 shapes
    shapes['ellipse'];

const primitiveSVG = (sourcePath, destinationPath, successCallback) => {
    const command = buildCommand(sourcePath, destinationPath);

    // eslint-disable-next-line no-unused-vars
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log('EXTERNAL DEPENDENCY: "primitive"');
            console.log('https://github.com/fogleman/primitive');
            console.log('primitive must be installed separately');

            console.error(err);
        } else {
            successCallback(destinationPath);
        }
    });

};

module.exports = primitiveSVG;