const fs = require( 'fs' );
const path = require( 'path' );
const Jimp = require('jimp');

const transformers = {
    'x-small': async (source, destination) => {
        const image = await Jimp.read(source);
        image
            .blur(8)
            .scaleToFit( 240, 240)
            .quality(10)
            .write(destination);
        console.log('wrote > ' + destination);
    }
};

const batch = (() => {
    const destinations = {
        'x-small': 'x-small'
    }

    return async (size, remoteDir) => {
        if (!destinations[size]) {
            console.error('No folder for size: ' + size);
            return;
        }
        if (!transformers[size]) {
            console.error('No transformer for size: ' + size);
            return;
        }

        const transform = transformers[size];
        const destination = destinations[size];

        const files = await fs.promises.readdir( 'source' );

        for( const file of files ) {
            // Get the full paths
            const fromPath = path.join( 'source', file );
            const stat = await fs.promises.stat( fromPath );

            if( stat.isFile() ) {
                console.log(' ');
                console.log( "'%s' is a file.", fromPath );

                const destinationPath = remoteDir
                    ? path.join( '..', remoteDir, destination, file )
                    : path.join(destination, file);

                transform(fromPath, destinationPath);
            }
        }
    };

})(); 

batch('x-small');

/*
Jimp.read('demo.jpg')
    .then(demo => {
        console.log('what up dawg?');

        return demo
          // .resize(256, 256) // resize
            .blur(8)
            .scaleToFit( 240, 240)
            .quality(10) // set JPEG quality
            // .greyscale() // set greyscale
            .write('demo-small.jpg'); // save
    })
    .catch(err => {
        console.error(err);
    });
*/

/*
const moveFrom = "source";
const moveTo = "destination";

// Make an async function that gets executed immediately
(async ()=>{
    // Our starting point
    try {
        // Get the files as an array
        const files = await fs.promises.readdir( moveFrom );

        // Loop them all with the new for...of
        for( const file of files ) {
            // Get the full paths
            const fromPath = path.join( moveFrom, file );
            const toPath = path.join( moveTo, file );

            // Stat the file to see if we have a file or dir
            const stat = await fs.promises.stat( fromPath );

            if( stat.isFile() )
                console.log( "'%s' is a file.", fromPath );
            else if( stat.isDirectory() )
                console.log( "'%s' is a directory.", fromPath );

            // Now move async
            // await fs.promises.rename( fromPath, toPath );

            // Log because we're crazy
            console.log( "Moved '%s'->'%s'", fromPath, toPath );
        } // End for...of
    }
    catch( e ) {
        // Catch anything bad that happens
        console.error( "We've thrown! Whoops!", e );
    }

})(); // Wrap in parenthesis and call now
*/