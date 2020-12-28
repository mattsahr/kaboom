const fs = require( 'fs' );
const path = require( 'path' );
const {
    ALBUM_META_JSON,
    ALBUM_META_JSON_BACKUP,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH
} = require('../constants.js');

const saveMeta = async (navMeta, successCallback) => {
    const json = JSON.stringify(navMeta);

    const filePath = path.join(GALLERY_ACTIVE_PATH, 'nav-meta.json');
    
    await fs.promises.writeFile(filePath, json);

    const filePath2 = path.join(GALLERY_STATIC_PATH, 'nav-meta.json');

    await fs.promises.writeFile(filePath2, json);

    if (successCallback) {
        console.log(' ');
        console.log('Site Nav updated: ' + navMeta.albums.length + ' albums');
        console.log(' ');
        successCallback();
    }
};

const addNavItem = async (directory, navMeta) => {
    const metaPath = path.join(directory,  ALBUM_META_JSON);
    let meta;

    try {
        meta = await fs.promises.readFile(metaPath, 'utf8');
    } catch {
        const backupPath = path.join(directory, ALBUM_META_JSON_BACKUP);
        meta = await fs.promises.readFile(backupPath, 'utf8');
    }

    meta = JSON.parse(meta);

    const next = {
        title: meta.title,
        subtitle_A: meta.subtitle_A,
        subtitle_B: meta.subtitle_B,
        date: meta.date,
        url: meta.url,
        imageCount: meta.imageCount,
        navCategories: meta.navCategories,
        appActive: directory.includes(GALLERY_ACTIVE_PATH)
    };

    // console.log('collect nav: ' + directory);
    navMeta.albums.push(next);
    return path;
};

const addDir = async (directory, name, navMeta) => {
    const testPath = path.join(directory, name);
    const stat = await fs.promises.stat(testPath);
    if (stat.isDirectory()) {
        await addNavItem(testPath, navMeta);
        return true;
    }
    return false;
};

const hydrateNavJSON = successCallback => async () => {

    const navMeta = {
        albums: []
    };

    const activeNames = await fs.promises.readdir(GALLERY_ACTIVE_PATH);
    // const activeAlbums = [];

    for (const name of activeNames) {
        const added = await addDir(GALLERY_ACTIVE_PATH, name, navMeta);
        if (!added && (name === ALBUM_META_JSON)) { 
            await addNavItem(GALLERY_ACTIVE_PATH, navMeta);
        }
    }

    // for (const albumPath of activeAlbums) {
    //     await addNavItem(albumPath, navMeta);
    // }

    const staticNames = await fs.promises.readdir(GALLERY_STATIC_PATH);
    // const staticAlbums = [];

    for (const name of staticNames) {
        const added = await addDir(GALLERY_STATIC_PATH, name, navMeta);
        if (!added && (name === ALBUM_META_JSON)) { 
            addNavItem(GALLERY_STATIC_PATH, navMeta);
        }
    }

    // for (const albumPath of staticAlbums) {
    //     await addNavItem(albumPath, navMeta);
    // }

    saveMeta(navMeta, successCallback);

};

module.exports = hydrateNavJSON;