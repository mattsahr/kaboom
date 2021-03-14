import ConfirmModalContent from './ConfirmModalContent.svelte';


const styleBg = {
    background: 'rgba(0, 0, 0, 0)'
};

const styleWindow = {
    position: 'relative',
    width: 'inherit',
    maxWidth: 'inherit',
    maxHeight: 'inherit',
    height: '134px',
    margin: 0,
    borderRadius: '4px',
    border: 'solid 1px rgb(250, 146, 70)',
    background: 'rgb(250, 250, 250)',
    boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1)'
};

const styleContent = {
};

const styleCloseButton = {
    opacity: 0.3,
    top: '8px',
    right: '8px'
};

const styleWindowBASE = {
    position: 'absolute',
    margin: 0,
    height: '134px',
    width: '160px'
};


const confirmActionModal = ({message, action, open, close}) => { 

    return e => {
        const clickPosition = e.currentTarget
                ? e.currentTarget.getBoundingClientRect()
                : e.target.getBoundingClientRect();

        console.log('clickPosition', clickPosition);

        const onClick = () => {
            close();
            if (action) { action(); }
        };

        const styleWindowWrap = {
            ...styleWindowBASE,
            top: (clickPosition.top - 60) + 'px',
            left: (clickPosition.left + clickPosition.width - 130) + 'px'
        };

        open(
            ConfirmModalContent, 
            { 
                message,
                onClick
            },
            {
                styleBg,
                styleWindowWrap,
                styleWindow,
                styleContent,
                styleCloseButton
            }
        );
    };
};

export default confirmActionModal;