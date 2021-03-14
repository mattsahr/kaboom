// const { prompt, Input, AutoComplete } = require('enquirer');
const prompt = require('prompt');
const fs = require( 'fs' );
const path = require( 'path' );
const colors = require('colors/safe');
const axios = require('axios');
const { 
    NAV_META_JSON,
    GALLERY_MAIN_PATH
} = require('../constants.js');
const getInputURL = require('./get-input-url');
const { composeAlbumNeedsUpdate } = require('./compare-albums');

const getRemoteNav = async baseURL => {
    const url = baseURL + '/' + NAV_META_JSON;
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (err) {
        // console.log(res.status);
        // console.error(err);
        return false;
    }
};

const logAlbum = report => {
    console.log('------------');
    console.log(' ');

    console.log('ALBUM: ', report.album);

    if (report['Missing images'].length) {
        console.log('    Missing images');
        for (const fileName of report['Missing images']) {
            console.log('        ' + fileName);
        }
        console.log(' ');
    }

    if (report['Files to update'].length) {
        console.log('    Files to update');
        for (const fileName of report['Files to update']) {
            console.log('        ' + fileName);
        }
        console.log(' ');
    }


    console.log('------------');
    console.log(' ');
};

const deployCompare = async (url, successsCallback) => {

    const remoteURL = url || await getInputURL();
    const remoteNav = await getRemoteNav(remoteURL);

    if (!remoteNav) {
        console.log(' ');
        console.log(' ');
        console.log(colors.brightRed('    Comaprison Gallery Not Found: ') + url );
        console.log(' ');
        process.exit(1);
    }

    const albumNeedsUpdate = composeAlbumNeedsUpdate(remoteURL);
    const updates = [];

    for (const album of remoteNav.albums) {
        const report = await albumNeedsUpdate(path.join(GALLERY_MAIN_PATH, album.url));
        if (report) {
            updates.push(report);
        }
    }

    console.log('remoteNav');
    console.log('--------------------');
    for (const album of remoteNav.albums) {
        console.log(album.title, ' | ', album.url);
    }
    console.log(' ');

    console.log('UPDATES', updates.length);

    updates.map(logAlbum);

    console.log(' ');

    if (successsCallback) {
        successsCallback();
    }

};

module.exports = deployCompare;