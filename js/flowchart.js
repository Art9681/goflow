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

import {
    setupModalCloseListeners,
    setupWindowClickHandler,
    setupSettingsButtonListener,
    initializeConnectionPoints
} from './flowchart-event-handlers.js';

const svg = document.getElementById('flowchart');
// const addNodeBtn = document.getElementById('add-node-btn'); // remove or comment out
// const removeNodeBtn = document.getElementById('remove-node-btn'); // remove or comment out
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

// Context menu elements
const contextMenu = document.getElementById('context-menu');
const contextAddNode = document.getElementById('context-add-node');
const contextRemoveNode = document.getElementById('context-remove-node');

let nodeCounter = 4; // To generate unique node IDs
let selectedNode = null; // Track the currently selected node

// Global setting for connector shape
let currentConnectorShape = 'elbow'; // Default shape

// Keep track of right-click position and what was clicked
let rightClickX = 0;
let rightClickY = 0;
let rightClickedNode = null; // The node that was right-clicked (if any)

// Modify selectNode to update the local selectedNode
function updateSelectedNode(nodeEl) {
    selectedNode = nodeEl;
    selectNode(nodeEl, {disabled: true}); // Pass a dummy object since removeNodeBtn no longer used
}

// Set up modal close listeners
setupModalCloseListeners(
    addNodeModal, 
    addNodeClose, 
    addNodeCancel,
    removeNodeModal, 
    removeNodeClose, 
    removeNodeCancel,
    settingsModal, 
    settingsClose, 
    settingsCancel
);

// Set up window click handler for closing modals
setupWindowClickHandler(
    addNodeModal, 
    removeNodeModal, 
    settingsModal
);

// Set up settings button listener
setupSettingsButtonListener(settingsBtn, settingsModal);

// Handle right-click (contextmenu) event on the SVG
svg.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // Determine if we right-clicked on a node
    const nodeGroup = e.target.closest('.draggable-group');
    rightClickedNode = nodeGroup || null;
    updateSelectedNode(rightClickedNode);

    // Get mouse position relative to the SVG container
    const svgRect = svg.getBoundingClientRect();
    rightClickX = e.clientX - svgRect.left;
    rightClickY = e.clientY - svgRect.top;

    // Position the context menu
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;

    // Show/hide "Remove Node" based on whether a node is selected
    if (rightClickedNode) {
        contextRemoveNode.style.display = 'block';
    } else {
        contextRemoveNode.style.display = 'none';
    }

    // Display the context menu
    contextMenu.style.display = 'block';
});

// Hide context menu on click anywhere else
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// "Add Node" context menu item click handler
contextAddNode.addEventListener('click', () => {
    // Show Add Node modal
    addNodeModal.style.display = 'block';
    addNodeForm.reset();
});

// "Remove Node" context menu item click handler
contextRemoveNode.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node to remove.');
        return;
    }
    // Open the Remove Node Modal
    removeNodeModal.style.display = 'block';
});

// Handle Add Node Form Submission
addNodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = handleAddNode(
        selectedNode, 
        svg, 
        nodeCounter, 
        currentConnectorShape, 
        updateSelectedNode,
        rightClickX,   // pass in stored right-click coordinates
        rightClickY
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
        {disabled: true}, 
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
    onMouseDown(e, svg, {disabled: true}, currentConnectorShape);
});

// Initial draw of connectors
updateConnectors(currentConnectorShape);

// Initialize connection points positions for existing nodes
initializeConnectionPoints(nodes);

// Run initial tests
runTests();
