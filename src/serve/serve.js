const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const { GALLERY_MAIN_PATH } = require('../constants.js');
const saveAlbum = require('./save-album.js');
const saveNav = require('./save-nav-meta.js');
const deleteImage = require('./delete-image.js');

const jsonParser = bodyParser.json();

const serve = () => {

    const app = express();
    app.use(express.json({limit: '5mb'}));
    app.use(compression());

    const port = 4444;

    app.get('/test', (req, res) => {
        res.send('this is a test GET!');
    });

    app.patch(
        '/save-album', 
        jsonParser,
        (req, res, next) => {
            saveAlbum(
                req.body, 
                req.query.section, 
                req.query.source, 
                next
            );
            res.status(204).send();
        });

    app.patch(
        '/save-nav', 
        jsonParser,
        (req, res, next) => {
            saveNav(req.body, next);
            res.status(204).send();
        });

    app.delete(
        '/delete-image',
        (req, res, next) => {
            deleteImage(
                req.query.source, 
                req.query.image, 
                next
            );
        });

    app.use(express.static(GALLERY_MAIN_PATH));

    app.listen(port, () => {
      console.log(`Kaboom app listening at http://localhost:${port}`);
    });

};

module.exports = serve;
