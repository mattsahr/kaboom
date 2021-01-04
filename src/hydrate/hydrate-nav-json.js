const fs = require( 'fs' );
const path = require( 'path' );
const {
    ALBUM_META_JSON,
    ALBUM_META_JSON_BACKUP,
    APP_LOCAL_DIRECTORY,
    DUMMY_RESOURCE_PATH,
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH,
    HOME_CONFIG
} = require('../constants.js');
const getMeta =  require('./get-meta.js');
const saveMeta = require('./save-meta.js');

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

const reconcileHomePage = (() => {

    const saveHomepage = (homePage, successCallback) => {
        const localSuccess = () => {
            saveMeta(homePage, GALLERY_STATIC_PATH, successCallback);
        };
        saveMeta(homePage, GALLERY_ACTIVE_PATH, localSuccess);
    };

    const updateImages = (() => {

        const replace = (target, update, currentSequences, updateSequences) => {

            delete currentSequences[target.fileName];

            for (const [key, value] of Object.entries(update)) {
                target[key] = value;
            }

            currentSequences[update.fileName] = updateSequences[update.fileName];

        };

        return (page, candidate) => {

            const batch = page.images;
            const updates = candidate.images;

            for (const next of updates) {

                const current = batch.find(image => image.url === next.url);

                if (!current) {
                    batch.push(next);
                    page.svgSequences[next.fileName] = candidate.svgSequences[next.fileName];
                } else {
                    const shouldReplace = current.fileName !== next.fileName;
                    if (shouldReplace) {
                        replace(current, next, page.svgSequences, updates.svgSequences);
                    }
                }
            }
        };

    })(); 
 
    const removeOrphanedImages = (page, candidate) => {

        const batch = page.images;
        const updates = candidate.images;
        const confirmedImages = [];

        for (const image of batch) {
            const albumFound = updates.find(next => next.url === image.url);
            if (albumFound) {
                confirmedImages.push(image);
            } else {
                delete page.svgSequences[image.fileName];
            }
        }

        page.images = confirmedImages;
    };

    return async (newPage, successCallback) => {

        const currentHomePage = await getMeta(GALLERY_ACTIVE_PATH);
        const homePage = { ...newPage, currentHomePage };

        updateImages(homePage, newPage);
        removeOrphanedImages(homePage, newPage);

        saveHomepage(homePage, successCallback);
    };

})(); 

const saveNav = async (navMeta, homePage, successCallback) => {
    const json = JSON.stringify(navMeta);

    const filePath = path.join(GALLERY_ACTIVE_PATH, 'nav-meta.json');
    
    await fs.promises.writeFile(filePath, json);

    const filePath2 = path.join(GALLERY_STATIC_PATH, 'nav-meta.json');

    await fs.promises.writeFile(filePath2, json);

    console.log(' ');
    console.log('Site Nav updated: ' + navMeta.albums.length + ' albums');
    console.log(' ');

    reconcileHomePage(homePage, successCallback);
};

const getChildMeta = async (metaPath, directory) => {
    try {
        return await fs.promises.readFile(metaPath, 'utf8');
    } catch (e) {
        const backupPath = path.join(directory, ALBUM_META_JSON_BACKUP);
        return await fs.promises.readFile(backupPath, 'utf8');
    }
};

const addNavItem = async (directory, navMeta, homePage) => {

    if (directory === GALLERY_ACTIVE_PATH || directory === GALLERY_STATIC_PATH) {
        return true;
    }

    const metaPath = path.join(directory, ALBUM_META_JSON);

    let meta = await getChildMeta(metaPath, directory);
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

    const promo = meta.promo ||
        meta.images.find(image => image.description) || 
        meta.images[0];

    const image = { ...next, ...promo };
    const sequence = meta.svgSequences[image.fileName];

    // console.log('collect nav: ' + directory);
    homePage.images.push(image);
    homePage.svgSequences[image.fileName] = sequence;

    navMeta.albums.push(next);

    return true;
};

const addDir = async (directory, name, navMeta, homePage) => {
    const testPath = path.join(directory, name);
    const stat = await fs.promises.stat(testPath);
    if (stat.isDirectory()) {
        await addNavItem(testPath, navMeta, homePage);
        return true;
    }
    return false;
};

const getHomePageConfig = async () => {
    try {
        return await fs.promises.readFile(HOME_CONFIG, 'utf8');
    } catch (e) {
        const homePath = path.join(DUMMY_RESOURCE_PATH, HOME_CONFIG);
        return await fs.promises.readFile(homePath, 'utf8');
    }
};

const hydrateNavJSON = successCallback => async () => {

    const navMeta = {
        albums: []
    };

    let homePage = await getHomePageConfig();

    homePage = JSON.parse(homePage);
    homePage.images = [];
    homePage.svgSequences = {};

    const activeNames = await fs.promises.readdir(GALLERY_ACTIVE_PATH);

    for (const name of activeNames.filter(notAppDir)) {
        const added = await addDir(GALLERY_ACTIVE_PATH, name, navMeta, homePage);
        if (!added && (name === ALBUM_META_JSON)) { 
            await addNavItem(GALLERY_ACTIVE_PATH, navMeta, homePage);
        }
    }

    const staticNames = await fs.promises.readdir(GALLERY_STATIC_PATH);

    for (const name of staticNames.filter(notAppDir)) {
        const added = await addDir(GALLERY_STATIC_PATH, name, navMeta, homePage);
        if (!added && (name === ALBUM_META_JSON)) { 
            addNavItem(GALLERY_STATIC_PATH, navMeta, homePage);
        }
    }

    saveNav(navMeta, homePage, successCallback);

};

module.exports = hydrateNavJSON;