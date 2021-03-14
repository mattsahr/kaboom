import { writable } from 'svelte/store';

const ACTIVE = window.Network && window.Network.saveNav;

const createNavStore = () => {
    const { subscribe, set, update } = writable ({
        leftover: 'LEFTOVERZZ',        
        albums: []
    });

    let STORE;
    subscribe(store => STORE = store);

    const save = () => {
        setTimeout(() => {
            if (ACTIVE) {
                window.Network.saveNav(STORE);
            }
        }, 50);
    };

    const updateMeta = newStuff => {
        const updated = {
            ...STORE,
            ...newStuff
        };

        set(updated); save();

        console.log('Nav Store Updated', updated);
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