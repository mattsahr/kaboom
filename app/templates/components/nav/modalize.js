let outsideClickListener;

const removeClickListener = listener => {
    if (listener) { 
        document.removeEventListener('click', listener); 
    }
    if (outsideClickListener) { 
        document.removeEventListener('click', outsideClickListener); 
    }
};

const modalize = (element, active, oldListener) => {

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

export default modalize;
