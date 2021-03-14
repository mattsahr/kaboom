const colors = require('colors/safe');

const logIntro = () => {
    console.log('');
    console.log(colors.blue('INGEST'));
    console.log(colors.brightBlue('Choose an album to process.'));
    console.log('');
    console.log(colors.brightBlue('For each image in the album,'));
    console.log(colors.brightBlue('Kaboom will make various sizes,'));
    console.log(colors.brightBlue('and an inline place-holder.'));
};


module.exports = {
    logIntro
};
