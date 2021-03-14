const fs = require( 'fs' );
const path = require( 'path' );
const { 
    NAV_META_JSON,
    GALLERY_MAIN_PATH
} = require('../constants.js');

const saveNav = (() => {
    return async (data, errCallback) => {
        const navPath = path.join(GALLERY_MAIN_PATH, NAV_META_JSON);
        const json = JSON.stringify(data, null, 2);

        fs.writeFile(
            navPath,
            json,
            err => { if (err) { errCallback(err); } }
        );

    };

})();

module.exports = saveNav;
