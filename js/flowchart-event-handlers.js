// flowchart-event-handlers.js
// Now uses node dataset attributes for positions instead of querying rect.

export function setupModalCloseListeners(
    addNodeModal, 
    addNodeClose, 
    addNodeCancel,
    removeNodeModal, 
    removeNodeClose, 
    removeNodeCancel,
    settingsModal, 
    settingsClose, 
    settingsCancel,
    importModal,
    importClose,
    importCancel,
    exportModal,
    exportClose,
    exportCancel
) {
    // Close modals on close (x)
    addNodeClose.onclick = () => {
        addNodeModal.style.display = 'none';
    };

    removeNodeClose.onclick = () => {
        removeNodeModal.style.display = 'none';
    };

    settingsClose.onclick = () => {
        settingsModal.style.display = 'none';
    };

    importClose.onclick = () => {
        importModal.style.display = 'none';
    };

    exportClose.onclick = () => {
        exportModal.style.display = 'none';
    };

    // Close modals on Cancel buttons
    addNodeCancel.onclick = () => {
        addNodeModal.style.display = 'none';
    };

    removeNodeCancel.onclick = () => {
        removeNodeModal.style.display = 'none';
    };

    settingsCancel.onclick = () => {
        settingsModal.style.display = 'none';
    };

    importCancel.onclick = () => {
        importModal.style.display = 'none';
    };

    exportCancel.onclick = () => {
        exportModal.style.display = 'none';
    };
}

export function setupWindowClickHandler(
    addNodeModal, 
    removeNodeModal, 
    settingsModal,
    importModal,
    exportModal
) {
    window.onclick = function (event) {
        if (event.target === addNodeModal) {
            addNodeModal.style.display = "none";
        }
        if (event.target === removeNodeModal) {
            removeNodeModal.style.display = "none";
        }
        if (event.target === settingsModal) {
            settingsModal.style.display = "none";
        }
        if (event.target === importModal) {
            importModal.style.display = "none";
        }
        if (event.target === exportModal) {
            exportModal.style.display = "none";
        }
    };
}

export function setupSettingsButtonListener(settingsBtn, settingsModal) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
}

/**
 * Initialize connection points for existing nodes.
 * Now reads x,y,width,height from dataset attributes on the node group.
 */
export function initializeConnectionPoints(nodes) {
    nodes.forEach(node => {
        const inputPoint = node.el.querySelector('.connection-point.input');
        const outputPoint = node.el.querySelector('.connection-point.output');

        // Read from dataset
        const x = parseFloat(node.el.dataset.x);
        const y = parseFloat(node.el.dataset.y);
        const width = parseFloat(node.el.dataset.width);
        const height = parseFloat(node.el.dataset.height);

        inputPoint.setAttribute('cx', x);
        inputPoint.setAttribute('cy', y + height / 2);
        outputPoint.setAttribute('cx', x + width);
        outputPoint.setAttribute('cy', y + height / 2);
    });
}
