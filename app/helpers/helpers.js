const fs = require( 'fs' );

const checkFile = path => {
    try {
        if (fs.existsSync(path)) {
            return true;
            console.log("Directory exists.");
        } else {
            return false;
        }
    } catch(e) {
        console.log("Directory check ERROR: " + path);
        return false;
    }
};

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", err => {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", err => {
        done(err);
    });
    wr.on("close", () => {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

const replaceLastOrAdd = (input, find, replaceWith) => {
    if (!input || !find || !input.length || !find.length) {
        return input;
    }

    const lastIndex = input.lastIndexOf(find);
    if (lastIndex < 0) {
        return input + (replaceWith ? replaceWith : '');
    }

    return input.substr(0, lastIndex) + 
        replaceWith + 
        input.substr(lastIndex + find.length);
};

module.exports = { 
    copyFile,
    replaceLastOrAdd,
    checkFile
};
