import { writable } from 'svelte/store';

const createUXStore = () => {
    const { subscribe, set, update } = writable ({
        manageHiddenPix: false
    });

    return {
      
        subscribe,
        set,
        update
    };
};

const UXStore = createUXStore();
export default UXStore;