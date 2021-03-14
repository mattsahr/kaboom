const fs = require( 'fs' );
const path = require( 'path' );
const {
    ALBUM_META_JSON,
    // ALBUM_META_JSON_BACKUP,
    APP_LOCAL_DIRECTORY,
    DEFAULT_IMAGE_DIRECTORY,
    DUMMY_RESOURCE_PATH,
    GALLERY_IS_HOME_PAGE,
    GALLERY_MAIN_PATH,
    SITE_CONFIG
} = require('../constants.js');
const getMeta =  require('./get-meta.js');
const saveMeta = require('./save-meta.js');

const notAppDir = dir => dir !== APP_LOCAL_DIRECTORY;

const reconcileHomePage = (() => {

    const saveHomepage = (homePage, successCallback) => {
        saveMeta(homePage, GALLERY_MAIN_PATH, successCallback);
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
                        replace(current, next, page.svgSequences, candidate.svgSequences);
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

        const currentHomePage = await getMeta(GALLERY_MAIN_PATH);
        const homePage = { ...newPage, ...currentHomePage };

        console.log(' ');
        console.log('update svgSequences');
        for (const key of Object.keys(newPage.svgSequences)) {
            console.log(key, newPage.svgSequences[key].length);
        }
        console.log(' ');

        updateImages(homePage, newPage);

        removeOrphanedImages(homePage, newPage);

        saveHomepage(homePage, successCallback);
    };

})(); 

const saveNav = async (navMeta, homePage, successCallback) => {
    const json = JSON.stringify(navMeta);

    const filePath = path.join(GALLERY_MAIN_PATH, 'nav-meta.json');
    
    await fs.promises.writeFile(filePath, json);

    const filePath2 = path.join(GALLERY_MAIN_PATH, 'nav-meta.json');

    await fs.promises.writeFile(filePath2, json);

    console.log(' ');
    console.log('Site Nav updated: ' + navMeta.albums.length + ' albums');

    reconcileHomePage(homePage, successCallback);
};

const HomePage = (() => {

    const add = (navItem, meta, homePage) => {
        const { image, sequence } = composeImage(navItem, meta);
        if (shouldUpdateImage(image, homePage)) {
            replaceImage(image, sequence, homePage);
        } else {
            updateImageMeta(image, homePage);
        }
    };

    const composeImage = (navItem, meta) => {
        const promo = meta.promo ||
            meta.images.find(image => image.description) || 
            meta.images[0];

        const image = { 
            ...navItem, 
            ...promo,
            description: promo.promoDescription || promo.description,
            promoDescription: '',
            isPromo: false,
            title: navItem.title
        };

        const sequence = meta.svgSequences[image.fileName];
        return { image, sequence };
    };

    const getConfig = async () => {
        try {
            return await fs.promises.readFile(SITE_CONFIG, 'utf8');
        } catch (e) {
            const homePath = path.join(DUMMY_RESOURCE_PATH, SITE_CONFIG);
            return await fs.promises.readFile(homePath, 'utf8');
        }
    };

    const getHomePage = (() => {

        return async () => {

            const currentHomePage = await getMeta(GALLERY_MAIN_PATH);
            if (currentHomePage.images && currentHomePage.images.length) {
                return currentHomePage;
            }

            let homePage = await getConfig();

            homePage = JSON.parse(homePage);
            homePage.images = [];
            homePage.svgSequences = {};    

            return homePage;
        };

    })(); 

    const replaceImage = (candidate, sequence, homePage) => {

        stampTime(candidate);
        stampTime(homePage);

        const index = homePage.images.findIndex(next => next.url === candidate.url);

        if (index === -1) {
            homePage.images.push(candidate);
        } else {
            homePage.images[index] = candidate;
        }

        homePage.svgSequences[candidate.fileName] = sequence;
    };

    const shouldUpdateImage = (candidate, homePage) => {
        const current = homePage.images.find(next => next.url === candidate.url);
        if (!current) {
            return true;
        }

        const currentTS = current.lastUpdate || 0;
        const candidateTS = candidate.lastUpdate || 0;
        return candidateTS >= currentTS;
    };

    const stampTime = obj => {
        obj.lastUpdate = Date.now();
    };

    const updateImageMeta = (source, homePage) => {
        const current = homePage.images.find(next => next.url === source.url);
        if (!current) {
            return true;
        }

        current.title = source.title;
        current.subtitle_A = source.subtitle_A;
        current.subtitle_B = source.subtitle_B;

    };

    return {
        add,
        get: getHomePage,
        getConfig
    };

})();



const addNavItem = async (directory, navMeta, homePage) => {

    if (directory === GALLERY_MAIN_PATH) {
        return true;
    }

    const meta = await getMeta(directory);

    if (!meta || !meta.images || !meta.images.length) {
        console.log(' ');
        console.log('---- EMPTY ALBUM --------------');
        console.log('    ' + directory);
        console.log(' ');
        console.log('    Does this directory contain images?');
        console.log('    ' + path.join(directory, DEFAULT_IMAGE_DIRECTORY));
        console.log(' ');
        console.log('    Consider running "kaboom ingest ' + directory.split(path.sep).pop() + '"');
        console.log('-------------------------------');
        return false;
    }

    const next = {
        title: meta.title,
        subtitle_A: meta.subtitle_A,
        subtitle_B: meta.subtitle_B,
        date: meta.date,
        url: directory.split(path.sep).pop(),
        imageCount: meta.imageCount,
        navCategories: meta.navCategories
    };

    navMeta.albums.push(next);

    HomePage.add(next, meta, homePage);


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

const orderByDate = (() => {
    const byDate = (A, B) => {
        if (!A.date) {
            return B.date ? -1 : 0;
        }
        if (!B.date) {
            return A.date ? -1 : 0;
        }
        const Adate = new Date(A.date || 0);
        const Bdate = new Date(B.date || 0);
        return Adate < Bdate
            ? -1
            : Adate > Bdate
                ? 1
                : 0;
    };

    return homePage => {
         homePage.images.sort(byDate);
    };

})();


const hydrateNavJSON = successCallback => async () => {

    let config = await HomePage.getConfig();
    config = JSON.parse(config);

    console.log('hydrateNavJSON');
    console.log(config);
    console.log(' ');
    console.log('config customNav');
    console.log(config.custom_nav);
    console.log(' ');

    const navMeta = {
       ...(config.custom_nav || {}),
        albums: []
    };

    const homePage = await HomePage.get();
    homePage[GALLERY_IS_HOME_PAGE] = true;

    const init = homePage.images.length === 0;

    const names = await fs.promises.readdir(GALLERY_MAIN_PATH);

    for (const name of names.filter(notAppDir)) {
        const added = await addDir(GALLERY_MAIN_PATH, name, navMeta, homePage);
        if (!added && (name === ALBUM_META_JSON)) { 
            await addNavItem(GALLERY_MAIN_PATH, navMeta, homePage);
        }
    }

    if (init) { orderByDate(homePage); }

    saveNav(navMeta, homePage, successCallback);

};

module.exports = hydrateNavJSON;
