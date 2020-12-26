import { onDestroy } from 'svelte';
import { get } from 'svelte/store';

const modalizer = (() => {

    let outsideClickListener;

    const removeClickListener = listener => {
        if (listener) { 
            document.removeEventListener('click', listener); 
        }
        if (outsideClickListener) { 
            document.removeEventListener('click', outsideClickListener); 
        }
    };

    return (element, active, oldListener) => {

        removeClickListener(oldListener);

        if (element && active) {
            outsideClickListener = event => {
                if (!element.contains(event.target)) { 
                    active.set(false);
                    removeClickListener();
                }
            };

            document.addEventListener('click', outsideClickListener);
        }

        return outsideClickListener;
    };

}); 

function initModal(dom, el, activeState) {

    let activeListener;
    const modalUpdate = modalizer();
    const currentState = get(activeState);

    const update = () => {
        setTimeout(() => {
            activeListener = modalUpdate(dom[el], activeState, activeListener);
        }, 100);
    };

    if (currentState) {
        update();
    }

    activeState.subscribe(active => {
        if (active) {
            update();
        } else {
            activeListener = modalUpdate(null, null, activeListener);
        }
    });

    onDestroy(() => { 
        console.log('ondestroy modal!', el); 
        return modalUpdate(null, null, activeListener)
    });

}

export default initModal;