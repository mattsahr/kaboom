const util = require('util'); 

const shortHelp = [
'',
'------- KABOOM -----------',
'                          ',
' kaboom                   short help file',
' kaboom help              full help file',
'                          ',
' kaboom init              add /gallery-static, /gallery-active/demo-album',
' kaboom serve             web server on localhost:3300',
'                          ',
' kaboom ingest            process images, all albums in /gallery-active',
' kaboom ingest [name]     process images in /gallery-active/[name]',
'                          ',
' kaboom to-static         move all /gallery-active to /gallery-static',
' kaboom to-static [name]  move /gallery-active/[name] to /gallery-static',
'                          ',
' kaboom to-active         move all /gallery-static to /gallery-active',
' kaboom to-active [name]  move /gallery-static/[name] to /gallery-active',
'                          ',
'--------------------------',
''
];

const helpFile = [
'',
'------- KABOOM HELP FILE -------',
'  If you installed globally:',
'  USAGE:  kaboom [command]',
'  ',
'  If you installed locally:',
'  USAGE:  node kaboom [command]',
'--------------------------------',
'  ',
'kaboom ingest',
'--------------------------------',
'  For each album directory in the /gallery-active/ directory:',
'  the "ingest" process will make resized and svg-ified versions of all',
'  .jpg and .png images found in the album\'s /__original/ directory.',
'  ',
'  NOTE: the directory /__original/ that holds the source images',
'  starts with TWO underscores, __original, not just one underscore.',
'  ',
'  NOTE: this process can take a long time,',
'  depending on how many images are in each album.',
'  If you have already processed an album, consider moving',
'  it to /gallery-static/ before you run "ingest" on new images.',
'  ',
'  NOTE: this process requires installation of two external libraries:',
'  The "nconvert" library',
'    https://www.xnview.com/en/nconvert/',
'  The "primitive" go library',
'    https://github.com/fogleman/primitive',
'  ',
'  '
];

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
