const jimp = require('jimp');

const { 
    Bitmap, 
    ImageRunner, 
    ShapeTypes, 
    ShapeJsonExporter 
} = require('geometrizejs');

const options = {
    shapeTypes: [ShapeTypes.ELLIPSE],
    candidateShapesPerStep: 2048,
    shapeMutationsPerStep: 2048,
    alpha: 102
};

const iterations = 100;
const shapes = [];
const getColor = item => item.color.slice(0, 3).join(',') + '|';
const getShape = item => item.data.join(',');
const buildSequence = next => getColor(next) + getShape(next);

const testGEO = async () => {

    const image = await jimp.read('src/dummy/kaboom_2_demo.jpg');

    if (image.bitmap.width > image.bitmap.height) {
        await image.resize(256, jimp.AUTO);
    } else {
        await image.resize(jimp.AUTO, 256);
    }

    const bitmap = Bitmap.createFromByteArray(
        image.bitmap.width, 
        image.bitmap.height, 
        image.bitmap.data
    );

    const runner = new ImageRunner(bitmap);


    console.log('---------------');
    console.log(' ');

    for (let i = 0; i < iterations; i++) {

        shapes.push(
            buildSequence(
                JSON.parse(
                    ShapeJsonExporter.exportShapes(
                        runner.step(options)
                    )
                )
            )
        );

        console.log('"' + shapes[i]  + '",');
    }

    console.log(' ');
    console.log('---------------');
    console.log(' ');

};

module.exports = testGEO;
