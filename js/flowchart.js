import { 
    nodes, 
    connectors, 
    updateConnectors, 
    runTests,
    capitalizeFirstLetter
} from './flowchart-utils.js';

import { 
    selectNode, 
    onMouseDown, 
    onMouseMove, 
    onMouseUp 
} from './flowchart-drag-handlers.js';

import {
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
const connectorsLayer = document.getElementById('connectors-layer');
const nodesLayer = document.getElementById('nodes-layer');
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

let nodeCounter = 1; // will increment as we add nodes
let selectedNode = null; 
let currentConnectorShape = 'elbow';

// Track right-click info
let rightClickX = 0;
let rightClickY = 0;
let rightClickedNode = null;

// A JSON definition of initial nodes and connectors
const initialData = {
    "nodes": [
       { "id": "A", "x": 150, "y": 100, "width": 100, "height": 50, "label": "Node A", "inputType": "string", "outputType": "int" },
       { "id": "B", "x": 350, "y": 200, "width": 100, "height": 50, "label": "Node B", "inputType": "int", "outputType": "float" },
       { "id": "C", "x": 550, "y": 100, "width": 100, "height": 50, "label": "Node C", "inputType": "float", "outputType": "string" }
    ],
    "connectors": [
       { "id": "connector-A-B", "from": "A", "to": "B", "type": "solid" },
       { "id": "connector-B-C", "from": "B", "to": "C", "type": "dashed" }
    ]
};

// A function to initialize the diagram from JSON data
function initializeDiagramFromJSON(data) {
    // Create nodes
    data.nodes.forEach(n => {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'draggable-group');
        nodeGroup.setAttribute('data-node-id', n.id);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'node');
        rect.setAttribute('x', n.x);
        rect.setAttribute('y', n.y);
        rect.setAttribute('width', n.width);
        rect.setAttribute('height', n.height);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-text');
        text.setAttribute('x', n.x + n.width / 2);
        text.setAttribute('y', n.y + n.height / 2 + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.textContent = n.label;

        // Input/Output points
        const inputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        inputPoint.setAttribute('class', 'connection-point input');
        inputPoint.setAttribute('cx', n.x);
        inputPoint.setAttribute('cy', n.y + n.height/2);
        inputPoint.setAttribute('r', '5');

        const outputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outputPoint.setAttribute('class', 'connection-point output');
        outputPoint.setAttribute('cx', n.x + n.width);
        outputPoint.setAttribute('cy', n.y + n.height/2);
        outputPoint.setAttribute('r', '5');

        // Type labels
        const inputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        inputLabel.setAttribute('class', 'type-label');
        inputLabel.setAttribute('x', n.x);
        inputLabel.setAttribute('y', n.y + n.height/2 - 10);
        inputLabel.setAttribute('text-anchor', 'middle');
        inputLabel.textContent = capitalizeFirstLetter(n.inputType);

        const outputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        outputLabel.setAttribute('class', 'type-label');
        outputLabel.setAttribute('x', n.x + n.width);
        outputLabel.setAttribute('y', n.y + n.height/2 - 10);
        outputLabel.setAttribute('text-anchor', 'middle');
        outputLabel.textContent = capitalizeFirstLetter(n.outputType);

        nodeGroup.appendChild(rect);
        nodeGroup.appendChild(text);
        nodeGroup.appendChild(inputPoint);
        nodeGroup.appendChild(outputPoint);
        nodeGroup.appendChild(inputLabel);
        nodeGroup.appendChild(outputLabel);

        nodesLayer.appendChild(nodeGroup);
        nodes.push({ id: n.id, el: nodeGroup });

        // Update nodeCounter to ensure unique IDs for newly added nodes
        const numericPart = parseInt(n.id.replace(/\D+/g,''), 10);
        if (!isNaN(numericPart) && numericPart >= nodeCounter) {
            nodeCounter = numericPart + 1;
        }
    });

    // Create connectors
    data.connectors.forEach(c => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', c.id);
        path.setAttribute('class', c.type === 'solid' ? 'connector-solid' : 'connector-dashed');
        connectorsLayer.appendChild(path);

        connectors.push({
            id: c.id,
            from: c.from,
            to: c.to,
            el: path,
            type: c.type
        });
    });

    // Update all connectors
    updateConnectors(currentConnectorShape);

    // Initialize connection points
    initializeConnectionPoints(nodes);
}

// Set up modal and event handlers as before
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

setupWindowClickHandler(
    addNodeModal, 
    removeNodeModal, 
    settingsModal
);

setupSettingsButtonListener(settingsBtn, settingsModal);

// Right-click menu logic remains the same
svg.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const nodeGroup = e.target.closest('.draggable-group');
    rightClickedNode = nodeGroup || null;
    updateSelectedNode(rightClickedNode);

    const svgRect = svg.getBoundingClientRect();
    rightClickX = e.clientX - svgRect.left;
    rightClickY = e.clientY - svgRect.top;

    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;

    if (rightClickedNode) {
        contextRemoveNode.style.display = 'block';
    } else {
        contextRemoveNode.style.display = 'none';
    }

    contextMenu.style.display = 'block';
});

document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

contextAddNode.addEventListener('click', () => {
    addNodeModal.style.display = 'block';
    addNodeForm.reset();
});

contextRemoveNode.addEventListener('click', () => {
    if (!selectedNode) {
        alert('Please select a node to remove.');
        return;
    }
    removeNodeModal.style.display = 'block';
});

addNodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = handleAddNode(
        selectedNode, 
        svg, 
        nodeCounter, 
        currentConnectorShape, 
        updateSelectedNode,
        rightClickX,
        rightClickY
    );

    if (result.success) {
        nodeCounter = result.nodeCounter;
        addNodeModal.style.display = 'none';
    }
});

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

settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentConnectorShape = handleSettingsChange(
        connectorShapeSelect, 
        currentConnectorShape
    );
    updateConnectors(currentConnectorShape);
    settingsModal.style.display = 'none';
});

svg.addEventListener('mousedown', (e) => {
    const nodeGroup = e.target.closest('.draggable-group');
    if (nodeGroup) {
        updateSelectedNode(nodeGroup);
    }
    onMouseDown(e, svg, {disabled: true}, currentConnectorShape);
});

// Initialize the diagram from JSON when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDiagramFromJSON(initialData);
    // Run initial tests after everything is loaded
    runTests();
});

// Function to update local selectedNode reference
function updateSelectedNode(nodeEl) {
    selectedNode = nodeEl;
    selectNode(nodeEl, {disabled: true});
}