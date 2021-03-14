const networkAPI = (() => {

    const saveURL = '/save-album';
    const navSaveURL = '/save-nav';
    const deleteURL = '/delete-image';

    const deleteAPI = (() => {
        async function deleteItem(url = '') {
            const handleResponse = response => {
                if (response.status === 204) {
                    return 'SUCCESS';
                } else {
                    return 'ERROR: ' + response.status;
                }
            };

            // Default options are marked with *
            const response = await fetch(
                url, 
                {
                    method: 'DELETE',
                    mode: 'same-origin',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer'
                }
            );
            return handleResponse(response);
        }

        return fileName => {

            const path = window.location.pathname.split('/').filter(next => next).pop() || '';
            deleteItem(deleteURL + '?image=' + fileName + '&source=' + path)
                .then(response => response)
                .catch(err => {
                    console.groupCollapsed('NETWORK ERROR ' + deleteURL + ' | ' + fileName);
                    console.log(err);
                    console.groupEnd();
                });
        };

    })();

    const saveAPI = (() => {
    
        async function postData(url = '', data = {}) {
            const handleResponse = response => {
                if (response.status === 204) {
                    return 'SUCCESS';
                } else {
                    return 'ERROR: ' + response.status;
                }
            };

            // Default options are marked with *
            const response = await fetch(
                url, 
                {
                    method: 'PATCH',
                    mode: 'same-origin',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify(data)
                }
            );
            return handleResponse(response);
        }

        return (data, section, nav) => {
            if (nav){

                postData(navSaveURL, data)
                    .then(response => response)
                    .catch(err => {
                        console.groupCollapsed('NAV NETWORK ERROR');
                        console.log(err);
                        console.groupEnd();
                    });

            } else {

                const path = window.location.pathname.split('/').filter(next => next).pop() || '';
                postData(saveURL + '?section=' + section + '&source=' + path, data)
                    .then(response => response)
                    .catch(err => {
                        console.groupCollapsed('NETWORK ERROR ' + section);
                        console.log(err);
                        console.groupEnd();
                    });

            }

        };

    })(); 


    const saveNav = data => {
        saveAPI(data, null, 'nav');
    };

    const save = data => {

        const albumTo10 = {
            ...data,
            images: [],
            svgSequences: {},
            latestUpdate: Date.now()
        };

        const album11Plus = {
            ...data,
            images: [],
            svgSequences: {},
            latestUpdate: Date.now()
        };

        let count = 0;

        for (const image of data.images) {
            const target = (count < 10) ? albumTo10 : album11Plus;
            const next = { ...image };
            delete next.svgSequence;
            target.images.push(next);
            target.svgSequences[image.fileName] = data.svgSequences[image.fileName];

            count++;
        }

        saveAPI(albumTo10, '1-to-10');
        saveAPI(album11Plus, '11-plus');

    };

    const deleteImage = fileName => {
        deleteAPI(fileName);
    };

    return {
        deleteImage,
        save,
        saveNav
    };
})(); 

export default networkAPI;
