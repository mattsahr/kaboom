const fs = require( 'fs' );
const path = require( 'path' );
const saveMeta = require('./save-meta.js');
const getMeta = require('./get-meta.js');
const printHeaderNotes = require('./hydrate-json.notes');
const { DEFAULT_IMAGE_DIRECTORY, SVG_CONSTANTS } = require('../constants.js');
const { spawn, Pool, Worker }  = require('threads');

const goodImage ={
    '.jpg': true, 
    '.jpeg': true, 
    '.png': true, 
    '.gif': true
};

const removeOrphanJSON = (albumMeta, originals) => {
    const imageFound = originals => item => originals.includes(item.fileName);
    albumMeta.images = albumMeta.images.filter(imageFound(originals));
};

const getImageMeta = (fileName, albumMeta) => {

    let currentMeta = albumMeta.images.find(next => next.fileName === fileName);

    if (!currentMeta) {
        currentMeta = {
            fileName,
            title: fileName,
            description: ''
        };
        albumMeta.images.push(currentMeta);
    }

    return currentMeta;
};

const hydrateJSON = async (albumName, albumDirectory, successCallback) => {

    const albumMeta = await getMeta(albumDirectory);
    const pool = SVG_CONSTANTS && SVG_CONSTANTS.CPU_THREADS
        ? Pool(
            () => spawn(new Worker('../ingest-resize/worker-build-svg.js')), 
            SVG_CONSTANTS.CPU_THREADS
          )
        : Pool(() => spawn(new Worker('../ingest-resize/worker-build-svg.js')));

    albumMeta.title = albumMeta.title || albumDirectory.split(path.sep).pop();

    // const imageDirectory = path.join(albumDirectory, 'svg');
    const originalDirectory = path.join(albumDirectory, DEFAULT_IMAGE_DIRECTORY);
    const imageNames = await fs.promises.readdir(originalDirectory);

    const confirmedOriginals = [];

    for (const fileName of imageNames) {
        const fromPath = path.join(originalDirectory, fileName);

        try {
            const stat = await fs.promises.stat(fromPath);
            if( stat.isFile() && goodImage[path.extname(fileName)] ) {
                confirmedOriginals.push(fileName);
            }
        } catch (err) {
            console.log('/src/hydrate/hydrate-json.js  image file error');
            console.log('FILENAME:',  fileName);
            console.log(err);
        }
    }

    let count = 0;
    printHeaderNotes();
    const svgTasks = [];

    const addTask = (fileName, sourcePath, albumMeta) => {
        const task = pool.queue(worker => 
            worker.build(sourcePath)
        );

        task.then(({ originalHeight, originalWidth, height, width, sequence }) => {
            const imageMeta = getImageMeta(fileName, albumMeta);

            imageMeta.height = originalHeight;
            imageMeta.width = originalWidth;
            imageMeta.svgHeight = height;
            imageMeta.svgWidth = width;

            albumMeta.svgSequences[fileName] = sequence;

            count++;
            console.log('SVG: [' + count + '] of ' + confirmedOriginals.length + ' | ' + fileName);
            console.log(' ');
        });

        svgTasks.push(task);
    };

    for (const fileName of confirmedOriginals) {
        const sourcePath = path.join(originalDirectory, fileName);
        addTask(fileName, sourcePath, albumMeta);
    }

    await Promise.all(svgTasks);
    await pool.terminate(true);

    removeOrphanJSON(albumMeta, confirmedOriginals);
    saveMeta(albumMeta, albumDirectory, successCallback);

};

module.exports = hydrateJSON;
