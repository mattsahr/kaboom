//  EXTERNAL DEPENDENCY
//  This module requires the "primitive" go library
//  https://github.com/fogleman/primitive
//  primitive must be installed separately

const { exec } = require('child_process');

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
    ' -j 3' + // use 3 process threads
    ' -a 0' + // let algorithm choose opacity 
    ' -bg F0F0F0' + // starting background is off white
    ' -s 256' + // size 256px output
    ' -n 100' + // draw 100 shapes
    shapes['ellipse'];

const primitiveSVG = (sourcePath, destinationPath, successCallback) => {

    const command = buildCommand(sourcePath, destinationPath);

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
        } else {
            successCallback(destinationPath);
        }
    });
};

module.exports = primitiveSVG;