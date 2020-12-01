import Album from './Album.svelte';

function loadJSON(fileName, callback) {
    var xobj = new XMLHttpRequest();
    
    xobj.overrideMimeType("application/json");
    xobj.open('GET', fileName, true);
    // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState === 4 && xobj.status === 200) {
            // Required use of an anonymous callback 
            // as .open() will NOT return a value but simply 
            // returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

var loadFile = (() => {
    var loader = (fileName, callback, type, varName) => {

        var fileRequest;

        var fileType = type || 'js';

        if (fileType === 'json' && varName) {
            loadJSON(fileName, response => {
                // Parse JSON string into object
                window[varName] = JSON.parse(response);
                console.log(varName, window[varName]);
                if (callback) { callback(); }
            });
        } else if (fileType === 'js') {
            fileRequest = document.createElement('script');
            fileRequest.setAttribute('type', "text/javascript");
            fileRequest.setAttribute('src', fileName);
            fileRequest.setAttribute('async', true);
            if (callback) {
                fileRequest.onload = callback;
            }
        } else if (fileType === 'css') {
            fileRequest = document.createElement('link');
            fileRequest.setAttribute('rel', 'stylesheet');
            fileRequest.setAttribute('type', 'text/css');
            fileRequest.setAttribute('href', fileName);
        }

        if (fileRequest) {
            document.getElementsByTagName("head")[0].appendChild(fileRequest);
        }
    };

    return loader;
})();

const startApp = () => {

    if (window.GALLERY && window.GALLERY.title) {
        document.title = window.GALLERY.title;
    }

    // eslint-disable-next-line no-unused-vars
    const app = new Album({
        target: document.body,
        props: {
            GALLERY: window.GALLERY
        }
    });
};

var loadApp = () => {
    loadFile('album-meta.json', startApp, 'json', 'GALLERY');
};

loadApp();

export default loadApp;
