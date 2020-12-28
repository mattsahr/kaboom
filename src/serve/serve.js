const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const saveAlbum = require('./save-album.js');

const jsonParser = bodyParser.json();

const serve = () => {

    const app = express();
    app.use(compression());

    const port = 2317;

    app.get('/test', (req, res) => {
        res.send('this is a test GET!');
    });

    app.patch(
        '/save-album', 
        jsonParser,
        (req, res, next) => {
            saveAlbum(req.body, req.query.section, next);
            res.status(204).send();
        });

    app.use(express.static('gallery-static'));
    app.use(express.static('gallery-active'));

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });

};

module.exports = serve;
