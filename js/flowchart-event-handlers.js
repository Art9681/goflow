// flowchart-event-handlers.js
// Handles event listeners for modals, context menu, and other UI interactions.
// Also initializes connection points for existing nodes.

/**
 * Set up modal close/cancel event listeners for all modals.
 * @param {HTMLElement} addNodeModal 
 * @param {HTMLElement} addNodeClose 
 * @param {HTMLElement} addNodeCancel 
 * @param {HTMLElement} removeNodeModal 
 * @param {HTMLElement} removeNodeClose 
 * @param {HTMLElement} removeNodeCancel 
 * @param {HTMLElement} settingsModal 
 * @param {HTMLElement} settingsClose 
 * @param {HTMLElement} settingsCancel 
 */
export function setupModalCloseListeners(
    addNodeModal, 
    addNodeClose, 
    addNodeCancel,
    removeNodeModal, 
    removeNodeClose, 
    removeNodeCancel,
    settingsModal, 
    settingsClose, 
    settingsCancel
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
}

/**
 * Sets up a global window click handler to close modals if clicking outside them.
 * @param {HTMLElement} addNodeModal 
 * @param {HTMLElement} removeNodeModal 
 * @param {HTMLElement} settingsModal 
 */
export function setupWindowClickHandler(
    addNodeModal, 
    removeNodeModal, 
    settingsModal
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
    };
}

/**
 * Sets up the settings button event listener to open the settings modal.
 * @param {HTMLButtonElement} settingsBtn 
 * @param {HTMLElement} settingsModal 
 */
export function setupSettingsButtonListener(settingsBtn, settingsModal) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
}

/**
 * Initialize connection points for existing nodes in the SVG.
 * @param {Array} nodes - Array of node objects with {id, el}.
 */
export function initializeConnectionPoints(nodes) {
    nodes.forEach(node => {
        const inputPoint = node.el.querySelector('.connection-point.input');
        const outputPoint = node.el.querySelector('.connection-point.output');
        const rect = node.el.querySelector('rect');
        const x = parseFloat(rect.getAttribute('x'));
        const y = parseFloat(rect.getAttribute('y'));
        const width = parseFloat(rect.getAttribute('width'));
        const height = parseFloat(rect.getAttribute('height'));

        inputPoint.setAttribute('cx', x);
        inputPoint.setAttribute('cy', y + height / 2);
        outputPoint.setAttribute('cx', x + width);
        outputPoint.setAttribute('cy', y + height / 2);
    });
}
