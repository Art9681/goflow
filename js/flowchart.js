// Enhanced Flowchart with typed inputs/outputs, Modals, and Settings
import { 
    nodes, 
    connectors, 
    updateConnectors, 
    runTests 
} from './flowchart-utils.js';

import { 
    selectNode, 
    onMouseDown, 
    onMouseMove, 
    onMouseUp 
} from './flowchart-drag-handlers.js';

import {
    capitalizeFirstLetter,
    handleAddNode,
    handleRemoveNode,
    handleSettingsChange
} from './flowchart-modal-handlers.js';

const svg = document.getElementById('flowchart');
const addNodeBtn = document.getElementById('add-node-btn');
const removeNodeBtn = document.getElementById('remove-node-btn');
const settingsBtn = document.getElementById('settings-btn');

// Modal Elements
const addNodeModal = document.getElementById('add-node-modal');
const addNodeClose = document.getElementById('add-node-close');
const addNodeCancel = document.getElementById('add-node-cancel');
const addNodeForm = document.getElementById('add-node-form');

const removeNodeModal = document.getElementById('remove-node-modal');
const removeNodeClose = document.getElementById('remove-node-close');
const removeNodeCancel = document.getElementById('remove-node-cancel');
const confirmRemoveBtn = document.getElementById('confirm-remove-btn');

const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');
const settingsCancel = document.getElementById('settings-cancel');
const settingsForm = document.getElementById('settings-form');
const connectorShapeSelect = document.getElementById('connector-shape');

let nodeCounter = 4; // To generate unique node IDs
let selectedNode = null; // Track the currently selected node

// Global setting for connector shape
let currentConnectorShape = 'elbow'; // Default shape

// Modify selectNode to update the local selectedNode
function updateSelectedNode(nodeEl) {
    selectedNode = nodeEl;
    selectNode(nodeEl, removeNodeBtn);
}

// Event listener for adding a new node
addNodeBtn.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node to connect the new node.');
        return;
    }
    // Open the Add Node Modal
    addNodeModal.style.display = 'block';
    addNodeForm.reset();
});

// Event listener for removing the selected node
removeNodeBtn.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node to remove.');
        return;
    }
    // Open the Remove Node Modal
    removeNodeModal.style.display = 'block';
});

// Event listener for opening the Settings Modal
settingsBtn.addEventListener('click', () => {
    // Set the current selection in the dropdown
    connectorShapeSelect.value = currentConnectorShape;
    settingsModal.style.display = 'block';
});

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

// Handle Add Node Form Submission
addNodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = handleAddNode(
        selectedNode, 
        svg, 
        nodeCounter, 
        currentConnectorShape, 
        updateSelectedNode
    );

    if (result.success) {
        nodeCounter = result.nodeCounter;
        addNodeModal.style.display = 'none';
    }
});

// Handle Remove Node Confirmation
confirmRemoveBtn.addEventListener('click', () => {
    const success = handleRemoveNode(
        selectedNode, 
        svg, 
        removeNodeBtn, 
        currentConnectorShape
    );

    if (success) {
        updateSelectedNode(null);
        removeNodeModal.style.display = 'none';
    }
});

// Handle Settings Form Submission
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentConnectorShape = handleSettingsChange(
        connectorShapeSelect, 
        currentConnectorShape
    );

    // Update all existing connectors
    updateConnectors(currentConnectorShape);

    // Close the modal
    settingsModal.style.display = 'none';
});

// Event listeners for dragging
svg.addEventListener('mousedown', (e) => {
    const nodeGroup = e.target.closest('.draggable-group');
    if (nodeGroup) {
        updateSelectedNode(nodeGroup);
    }
    onMouseDown(e, svg, removeNodeBtn, currentConnectorShape);
});

// Close modals when clicking outside of the modal content
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

// Initial draw of connectors
updateConnectors(currentConnectorShape);

// Initialize connection points positions for existing nodes
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

// Run initial tests
runTests();
