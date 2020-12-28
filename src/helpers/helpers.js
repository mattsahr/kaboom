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


const waitParallel = (batch, finalize, REPORT) => { 

    let pending = Object.keys(batch);
    let finalizeCalled = !finalize;

    Object.entries(batch).forEach(([name, func]) => {
        func(() => { 
            if (!finalizeCalled) {

                pending = pending.filter(next => next !== name);

                if (REPORT) {
                    console.log(' ');
                    console.log('COMPLETE:  ' + name);
                    console.log(pending.length 
                        ? 'PENDING:   ' + pending.join(' | ')
                        : 'ALL FINISHED'
                    );
                    console.log(' ');
                }

                if (!pending.length) {
                    finalizeCalled = true;
                    finalize();
                }

            }
        });
    });
};

const waitSerial = (batch, finalize, REPORT) => {
    const series = Object.keys(batch);

    const iterate = {
        next: () => {
            const nextFunc = series.shift();

            if (REPORT) {
                console.log(' ');
                console.log('BEGIN:   ' + nextFunc);
                console.log('PENDING: ' + series.join(' | '));
                console.log(' ');
            }

            batch[nextFunc](iterate.proceed);
        },
        proceed: () => {
            if (series.length) {
                iterate.next();
            } else {

                if (REPORT) {
                    console.log(' ');
                    console.log('ALL FINISHED');
                    console.log(' ');
                }

                if (finalize) { finalize(); }
            }
        }
    };

    iterate.proceed();
};

const next = function() {
    const args = Array.prototype.slice.call(arguments);
    const func = args.shift();

    return () => {
        func(args[0], args[1], args[3]);
    };
};

module.exports = { 
    checkFile,
    copyFile,
    next,
    replaceLastOrAdd,
    waitParallel,
    waitSerial
};
