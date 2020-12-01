const express = require('express');


const serve = () => {

    const app = express();
    const port = 2317;

    app.get('/test', (req, res) => {
        res.send('this is a test GET!');
    });

    app.use(express.static('gallery-static'));
    app.use(express.static('gallery-active'));

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });

};

module.exports = serve;

    /*

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });
    */
