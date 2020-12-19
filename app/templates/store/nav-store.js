import { writable } from 'svelte/store';

const createNavStore = () => {
    const { subscribe, set, update } = writable ({
        leftover: 'LEFTOVERZZ',        
        albums: []
    });

    let STORE;
    subscribe(store => STORE = store);


    const updateMeta = newStuff => {
        const updated = {
            ...STORE,
            ...newStuff
        };

        set(updated);

        console.log('STORE updateMeta', newStuff);
    };

    return {
        subscribe,
        set,
        update,

        updateMeta
    };
};



const NavStore = createNavStore();
export default NavStore;