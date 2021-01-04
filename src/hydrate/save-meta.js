const fs = require( 'fs' );
const path = require( 'path' );

const saveMeta = async (albumMeta, saveDirectory, successCallback) => {

    const album1to10 = {
        ...albumMeta,
        section: '1-to-10',
        imageCount: albumMeta.images.length,
        images: [],
        svgSequences: {}
    };

    const album11plus = {
        ...albumMeta,
        section: '11-plus',
        imageCount: albumMeta.images.length,
        images: [],
        svgSequences: {}
    };

    let count = 0;
    for (const image of albumMeta.images) {
        const target = (count < 10) ? album1to10 : album11plus;
        target.images.push(image);
        target.svgSequences[image.fileName] = albumMeta.svgSequences[image.fileName];
        count++;
    }


    const jsonA = JSON.stringify(album1to10);
    const filePathA = saveDirectory
        ? path.join(saveDirectory, 'album-1-to-10.json')
        : 'album-meta.json';

    const jsonB = JSON.stringify(album11plus);
    const filePathB = saveDirectory
        ? path.join(saveDirectory, 'album-11-plus.json')
        : 'album-11-plus.json';
    
    await fs.promises.writeFile(filePathA, jsonA);
    await fs.promises.writeFile(filePathB, jsonB);

    console.log(' ');
    console.log('saved: ' + filePathA);
    console.log('saved: ' + filePathB);

    if (successCallback) {
        successCallback(saveDirectory);
    }

    /*
    fs.writeFile(filePath, json, (err) => {
        if (!err) {
            console.log(' ');
            console.log('saved: ' + filePath);
            if (successCallback) {
                successCallback(saveDirectory);
            }
        } 
    });
    */
};

module.exports = saveMeta;

