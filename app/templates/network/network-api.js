const networkAPI = (() => {

    const saveURL = '/save-album';

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
            const response = await fetch(url, {
                method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
                mode: 'same-origin', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            });
            return handleResponse(response);
            // return response.json();
        }

        return (data, section) => {
            postData(saveURL + '?section=' + section, data)
                .then(response => {
                    console.groupCollapsed('SAVE RESPONSE ' + section);
                    console.log('data', data);
                    console.log('response', response);
                    console.groupEnd();
                }).catch(err => {
                    console.groupCollapsed('NETWORK ERROR ' + section);
                    console.log(err);
                    console.groupEnd();
                });
        };

    })(); 


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

        console.log('1-to-10 | ', albumTo10.images.length);
        console.log('11-plus | ', album11Plus.images.length);

        saveAPI(albumTo10, '1-to-10');
        saveAPI(album11Plus, '11-plus');

    };

    return {
        save
    };
})(); 

export default networkAPI;
