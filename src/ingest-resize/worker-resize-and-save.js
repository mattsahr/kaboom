const { expose } =require('threads/worker');
const jimp = require('jimp');


const sizes = {
    tiny:   { quality: 60, dimension:  400 },
    small:  { quality: 65, dimension:  700 },
    medium: { quality: 70, dimension: 1200 },
    large:  { quality: 80, dimension: 2000 }
};

const resizeAndSave = async (size, source, destination, successCallback) => {

    let image;

    try {
        image = await jimp.read(source);
    } catch (err) {
        console.log(' ');
        console.log('/src/ingest-resize/resize-and-save.js');
        console.log('ERROR LOADING FILE: ', source);
        console.log(err);
        console.log(' ');
        process.exit(1);
    }

    const { quality, dimension } = sizes[size];

    if (image.bitmap.width > image.bitmap.height) {
        await image.resize(dimension, jimp.AUTO);
    } else {
        await image.resize(jimp.AUTO, dimension);
    }

    image.quality(quality);

    await image.writeAsync(destination);

    return destination;

};

expose({resizeAndSave});
