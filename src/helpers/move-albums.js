const fs = require( 'fs' );
const path = require( 'path' );
const { GALLERY_ACTIVE_PATH, GALLERY_STATIC_PATH } = require('../constants.js');

const DONT_MOVE = {
    '__app': true
};

const move = (fromPath, toPath) => album => async () => {

    const sourceNames = await fs.promises.readdir(fromPath);
    const sourceAlbums = [];
    for (const name of sourceNames) {
        if (DONT_MOVE[name]) {
            continue;
        }
        if (album && name !== album) {
            continue;
        }
        const albumPath = path.join(fromPath, name);
        const stat = await fs.promises.stat(albumPath);
        if (stat.isDirectory()) { 
            const destinationPath = path.join(toPath, name);
            sourceAlbums.push([albumPath, destinationPath]); 
        }
    }

    if (!sourceAlbums.length) {
            console.log(' ');
        if (album) {
            console.log('Album [' + album + '] not found in ' + fromPath);
        } else {
            console.log('No albums found in ' + fromPath);
        }
        console.log(' ');
        process.exit(1);
    }

    let movedCount = 0;
    const renameCallback = err => {
        if(err) { throw err; }

        movedCount++;

        if (movedCount >= sourceAlbums.length) {
            console.log(' ');
            if (album) {
                console.log(
                    'Album [ ' + album + ' ] ' + 
                    'moved ['+ fromPath + '] >> [' + toPath + ']'
                );

            } else {
                console.log(
                    '[ ' + movedCount + ' ] director' + 
                    (movedCount > 1 ? 'ies ' : 'y ') +
                    'moved ['+ fromPath + '] >> [' + toPath + ']'
                );
            }
            console.log(' ');
        }
    };

    for (const [albumFrom, albumTo] of sourceAlbums) {
        fs.rename(albumFrom, albumTo, renameCallback);
    }
};

module.exports = {
    toStatic: move(GALLERY_ACTIVE_PATH, GALLERY_STATIC_PATH),
    toActive: move(GALLERY_STATIC_PATH, GALLERY_ACTIVE_PATH)
};
