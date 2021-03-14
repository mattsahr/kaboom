const util = require('util'); 

const shortHelp = [
'__________________________',
'',
' kaboom                   Short help',
' kaboom help              Full help',
' kaboom help [command]    help for [command]',
'',
' kaboom init              Make a /gallery/ directory and put a /demo-album/ inside',
'',
' kaboom serve             Run a web server on localhost:4444',
' kaboom serve static      Run a web server on localhost:4444, static version',
'',
' kaboom add               From the curent directory, add all images to a new album',
'                          ',
' kaboom ingest            Choose an album, resize & make placeholders for all images',
'',
' kaboom compare           Declare a remote deploy directory, check what needs updated',
'                          ',
' kaboom static            Set albums to static, ready for FTP or other delivery',
'__________________________',
''
];

const helpFile = {

intro: [
'',
'------- KABOOM HELP FILE -------',
'  If you installed globally:',
'  USAGE:  kaboom [command]',
'',
'  If you installed locally:',
'  USAGE:  node kaboom [command]',
'________________________________',
'',
'',
'',
'kaboom',
'________________________________',
'  Running "kaboom" by itself provides a short list of commands.'
],

init: [
'',
'',
'',
'kaboom init',
'________________________________',
'  When you first clone or download the kaboom project, there is',
'  no /gallery/ directory under the /kaboom/ project directory.',
'',
'  Running "kaboom init" makes a /kaboom/gallery/ directory.',
'',
'  All albums will reside inside the /kaboom/gallery/ directory,',
'  each in its own subdirectory.',
'',
'  The "kaboom init" script also makes a demo album',
'  located at /kaboom/gallery/demo-album/',
'  and then copies some example images into it.',
'',
'  The "kaboom init" script then runs',
'  the equivalent of "kaboom ingest" on',
'  the /demo-album/ directory, which processes',
'  all demo-album images for use in the app.'
],

serve: [
'',
'',
'',
'kaboom serve',
'kaboom serve static',
'________________________________',
'  The "kaboom serve" command starts',
'  a web server on http://localhost:4444',
'',
'  The default mode is "active", where albums',
'  are set to provide in-app editing features.',
'  -- Rearrange photos',
'  -- Delete photos',
'  -- Write captions',
'  -- Change nav settings',
'',
'  Running "kaboom serve static" will start the server',
'  with pages in "static" mode, no editing features.',
'',
'  NOTE -- Before sending albums to a public server,',
'  run "kaboom static" or "kaboom serve static"',
'  to turn off the interactive editing features.',
'',
'  If the "active" files are deployed, it\'s not',
'  the end of the world -- public editing is not permanent,',
'  since the public server will not save the edits.'
],

add: [
'',
'',
'',
'kaboom add',
'________________________________',
'  Use "kaboom add" to add images to a new album, or existing album.',
'',
'  The "kaboom add" script expects to be run',
'  from a source directory full of images.',
'  The source directory need not be in or near the /kaboom/ project.',
'',
'  You will be prompted to choose a directory name for a new album.',
'  If the album already exists, images will be added to it.',
'  Otherwise a new directory will be made for your album,',
'  with a subdirectory inside called /++original/.',
'',
'  The "kaboom add" script will copy all .gif .jpg and .png files',
'  from the source directory to the /album-name/++original/ directory.',
'',
'  After copying the images, the script will run the equivalent',
'  of "kaboom ingest" on the target album.'
],

ingest: [
'',
'',
'',
'kaboom ingest',
'________________________________',
'  You can manually add images (gif, jpg, png) to an album, by copying',
'  the files to the /kaboom/gallery/album-name/++original/ directory.',
'  In this case, the new images will need to be processed',
'  with "kaboom ingest" for use in the app.',
'',
'  When you run "kaboom ingest", you will',
'  be asked to choose an album in the /gallery/ directory.',
'',
'  The "ingest" process will make resized and svg versions of all',
'  .gif .jpg and .png images found in the album\'s /++original/ directory.',
'',
'  NOTE: this process requires installation of two external libraries:',
'  The "nconvert" library',
'       https://www.xnview.com/en/nconvert/',
'  The "primitive" go library',
'       https://github.com/fogleman/primitive',
'',
'  NOTE: this process can take a long time,',
'  depending on how many images are in the album.',
'  Generally the "primitive" process takes 20 to 60 seconds per image.'
],

compare: [
'',
'',
'',
'kaboom compare',
'________________________________',
'  When you edit your albums, they record a "lastUpdate" timestamp.',
'  Running "kaboom compare" will check the local "lastUpdate" timestamps',
'  against files on your public deployed site.',
'  ',
'  You will get a list of albums and images that need updated.',
'  Generally, albums without recent edits don\'t need re-deployed.',
'',
'  When in doubt, you can always just re-deploy all albums',
'  and all images, but using "kaboom compare" can save you',
'  bandwidth and upload time.'
],

spacer: [
'',
''
]


};

helpFile.default = [].concat(
    helpFile.intro,
    helpFile.init,
    helpFile.serve,
    helpFile.add,
    helpFile.ingest,
    helpFile.compare,
    helpFile.spacer
);

const pp = str => console.log(util.format('%s', str));

const unknownArg = arg => {
    const messages = [
        '',
        'Unknown command: "' + arg + '"',
        'Type "kaboom help" for a list of options.'
    ];
    messages.map(pp);
};

module.exports = {
    helpFile: helpFile,
    pp: pp,
    shortHelp: shortHelp,
    unknownArg: unknownArg
};
