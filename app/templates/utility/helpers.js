
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

const replaceExtension = (() => {

    const extensions = ['.jpg', '.jpeg', '.gif', '.png'];

    return (name, replacement) => {
        for (const extension of extensions) {
            if (name.endsWith(extension)) {
                return replaceLastOrAdd(name, extension, replacement);
            }
        }
        return name + '.ERROR-BAD-EXTENSION';
    };

})(); 

export const sizeName = (size, name) => replaceExtension(name, '--' + size + '.jpg');

export const getSizedPath = (size, fileName, url) => 
    size === 'original' 
        ? url 
            ? url + '/__original/' + fileName
            : '__original/' + fileName
        : url
            ? url + '/' + size + '/' + replaceExtension(fileName, '--' + size + '.jpg')
            : size + '/' + replaceExtension(fileName, '--' + size + '.jpg');
