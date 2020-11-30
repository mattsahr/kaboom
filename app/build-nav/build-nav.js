const fs = require( 'fs' );
const path = require( 'path' );
const { checkFile } = require('../helpers/helpers.js');
const {
    GALLERY_ACTIVE_PATH,
    GALLERY_STATIC_PATH,
    SITE_NAV_JSON
} = require('../constants.js');

const buildNav = (() => {

    const surveyAlbum = async (albumPath, editStatus, callback) => {

        const metaPath = path.join(albumPath, 'album-meta.json');
        const gotAlbumMeta = checkFile(metaPath);

        if (!gotAlbumMeta) {
            callback(albumPath, null);
            return;
        }

        let albumMeta = await fs.promises.readFile(metaPath, 'utf8');
        albumMeta = JSON.parse(albumMeta);

        const localPath = path.parse(albumPath).base; 

        const navInfo = {
            title: albumMeta.title || localPath,
            subTitleA: albumMeta.subTitleA,
            subTitleB: albumMeta.subTitleB,
            url: localPath,
            weight: albumMeta.weight,
            month: albumMeta.month,
            year: albumMeta.year,
            imageCount: albumMeta.images.filter(next => !next.hidden).length,
            editStatus: editStatus
        };
        callback(albumPath, navInfo);
    };

    const initNavInfo = (() => {

        const navData = [];
        let directoryCount = 0;
        let count = 0;

        const saveNavData =async albumData => {

            const jsonPath = path.join(GALLERY_STATIC_PATH, SITE_NAV_JSON);
            const gotCurrentNav = checkFile(jsonPath);


            let currentNav = {
                'title': 'Title Not Set!'
            };

            if (!gotCurrentNav) {
                currentNav.albums = albumData;
            } else {
                currentNav = await fs.promises.readFile(jsonPath, 'utf8');
                currentNav = JSON.parse(currentNav);
                currentNav.albums = albumData;
            }

            currentNav = JSON.stringify(currentNav, null, 4);

            fs.writeFile(jsonPath, currentNav, (err) => {
                if (!err) {
                    console.log(' ');
                    console.log('Site Nav Saved: ' + jsonPath);
                } else {
                    console.error('Site Nave Save ERROR');
                    console.error(err);
                }
            });

        };


        const collectNavInfo = (albumPath, navInfo) => {
            count++;
            console.log('navInfo!', navInfo);

            if (navInfo) {
                navData.push(navInfo);
            }
            console.log('album ' + count + ' of ' + directoryCount + 
                ' | ' + (navInfo ? 'good' : ' BAD') +
                ' | ' + albumPath
            );

            if (count >= directoryCount) {
                saveNavData(navData);
            }
        };

        return total =>  {
            directoryCount = total;
            console.log('navData', navData);
            return collectNavInfo;
        };

    })();

    return async () => {
        const galleryActiveNames = await fs.promises.readdir(GALLERY_ACTIVE_PATH);
        const galleryStaticNames = await fs.promises.readdir(GALLERY_STATIC_PATH);

        const activeAlbums = [];
        const staticAlbums = [];

        for (const name of galleryActiveNames) {
            const albumPath = path.join(GALLERY_ACTIVE_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { activeAlbums.push(albumPath); }
        }

        for (const name of galleryStaticNames) {
            const albumPath = path.join(GALLERY_STATIC_PATH, name);
            const stat = await fs.promises.stat(albumPath);
            if (stat.isDirectory()) { staticAlbums.push(albumPath); }
        }

        const collectNavInfo = initNavInfo(activeAlbums.length + staticAlbums.length);

        for (const path of activeAlbums) {
            surveyAlbum(path, 'active', collectNavInfo);
        }
        for (const path of staticAlbums) {
            surveyAlbum(path, 'static', collectNavInfo);
        }

    };

})();

module.exports = buildNav;