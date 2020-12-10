
export const replaceLastOrAdd = (input, find, replaceWith) => {
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

export const sizeName = (size, name) => replaceLastOrAdd(name, '.jpg', '--' + size + '.jpg');

export const getSizedPath = (size, fileName) => size === 'original' 
    ? '__original/' + fileName
    : size + '/' + replaceLastOrAdd(fileName, '.jpg', '--' + size + '.jpg');
