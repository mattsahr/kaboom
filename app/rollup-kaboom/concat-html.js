const fs = require( 'fs' );
const path = require( 'path' );

const SOURCE_DIRECTORY = './base/html';
const INCLUDES_DIRECTORY = './base/html-includes';

const getFiles = async () => {
    const partNames = await fs.promises.readdir(SOURCE_DIRECTORY);
    const delivery = [];

    for (const partName of partNames) {
        // Get the full paths
        const fromPath = path.join(SOURCE_DIRECTORY, partName);
        const part = await fs.promises.readFile(fromPath, 'utf8');
        delivery.push(part);
    }
    return delivery;
};

const getIncludes = async (includes) => {
    const delivery = [];

    for (const include of includes) {
        const fromPath = path.join(INCLUDES_DIRECTORY, include);
        const part = await fs.promises.readFile(fromPath, 'utf8');
        delivery.push(part);
    }
    return delivery;
};


const defaults = {
    replacements: {
        __app_file_name__: '__app/default-app-bundle.js',
        __API_file_name__: '',
        __css_global_file_name__: '',
        __css_bundle_file_name__: '__app/default-bundle.css',
        __html_bundle_output__: 'default-index.html',
        __css_nav_file_name__: '/default-nav.css'   
    },
    includes: []
};


const template = ({ replacements, files, includedFiles }) => {
    
    let final = files.pop();
    for (const [target, replacement] of Object.entries(replacements)) {
        final = final.replace(target, replacement);
    }

    let delivery = files.join('');
    for (const [target, replacement] of Object.entries(replacements)) {
        delivery = delivery.replace(target, replacement);
    }

    for (const included of includedFiles) {
        delivery += included;
    }

    delivery += final;
    return delivery;
};


const html = (opts = {}) => {
    const includes = opts.includes || [...defaults.includes];
    const replacements = opts.replacements 
        ? { ...defaults.replacements, ...opts.replacements }
        : { ...defaults.replacements };

    return {
        name: 'kaboom_html',

        async generateBundle(/* output, bundle */) {
            const files = await getFiles();
            const includedFiles = await getIncludes(includes);
            const source = template({ replacements, files, includedFiles });

            const htmlFile = {
                type: 'asset',
                source,
                name: 'Rollup HTML Asset',
                fileName: replacements.__html_bundle_output__
            };

            this.emitFile(htmlFile);

        }
    };
};

export default html;