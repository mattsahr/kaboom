const jimp = require('jimp');
const { expose } =require('threads/worker');

const { 
    Bitmap, 
    ImageRunner, 
    ShapeTypes, 
    ShapeJsonExporter 
} = require('geometrizejs');
const { SVG_CONSTANTS } = require('../constants.js');

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

const DEFAULT_SHAPE_CANDIDATES = 2048;
const DEFAULT_SHAPE_MUTATIONS = 2048;

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const options = {
    shapeTypes: [ShapeTypes.ELLIPSE],
    candidateShapesPerStep: SVG_CONSTANTS.SVG_SHAPE_CANDIDATES || DEFAULT_SHAPE_CANDIDATES,
    shapeMutationsPerStep: SVG_CONSTANTS.SVG_SHAPE_MUTATIONS || DEFAULT_SHAPE_MUTATIONS,
    alpha: 102
};

const iterations = 100;
const getColor = item => rgbToHex(item.color[0], item.color[1], item.color[2]) + '|';
const getShape = item => item.data.join(',');
const buildSequence = next => getColor(next) + getShape(next);

const buildSvgSequence = async sourcePath => { // jimp source image

    const image = await jimp.read(sourcePath);

    const originalHeight = image.bitmap.height;
    const originalWidth = image.bitmap.width;

    if (originalWidth > originalHeight) {
        await image.resize(256, jimp.AUTO);
    } else {
        await image.resize(jimp.AUTO, 256);
    }

    const { height, width, data } = image.bitmap;

    const bitmap = Bitmap.createFromByteArray(width, height, data);

    const runner = new ImageRunner(bitmap);
    const sequence = [];

    for (let i = 0; i < iterations; i++) {
        sequence.push(
            buildSequence(
                JSON.parse(
                    ShapeJsonExporter.exportShapes(
                        runner.step(options)
                    )
                )
            )
        );

        // console.log('    ' + fileName + 
        //     ' oval [' + (i < 99 ? ' ' : '') + (i > 8 ? (i + 1) : ('0' + (i + 1))) + ']', 
        //     sequence[i]
        // );
    }

    return { originalHeight, originalWidth, height, width, sequence } ;
};

expose({build: buildSvgSequence});
