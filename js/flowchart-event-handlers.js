// Event Handlers for Flowchart Interactions

// Function to set up modal close/cancel event listeners
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
    // Close modals when clicking on <span> (x)
    addNodeClose.onclick = () => {
        addNodeModal.style.display = 'none';
    };

    removeNodeClose.onclick = () => {
        removeNodeModal.style.display = 'none';
    };

    settingsClose.onclick = () => {
        settingsModal.style.display = 'none';
    };

    // Close modals when clicking on Cancel buttons
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

// Function to set up window click event for closing modals
export function setupWindowClickHandler(
    addNodeModal, 
    removeNodeModal, 
    settingsModal
) {
    window.onclick = function (event) {
        if (event.target == addNodeModal) {
            addNodeModal.style.display = "none";
        }
        if (event.target == removeNodeModal) {
            removeNodeModal.style.display = "none";
        }
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    };
}

// Function to set up settings button event listener
export function setupSettingsButtonListener(settingsBtn, settingsModal) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
}

// Function to initialize connection points for existing nodes
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
