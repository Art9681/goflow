// Enhanced Flowchart with typed inputs/outputs, Modals, and Settings
import { 
    nodes, 
    connectors, 
    getConnectionPoint, 
    updateConnectors, 
    runTests 
} from './flowchart-utils.js';

import { 
    selectNode, 
    onMouseDown, 
    onMouseMove, 
    onMouseUp 
} from './flowchart-drag-handlers.js';

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

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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
    const nodeLabel = document.getElementById('node-label').value.trim();
    const connectorType = document.getElementById('connector-type').value;

    const inputType = document.getElementById('input-type').value;
    const outputType = document.getElementById('output-type').value;

    if (nodeLabel === '') {
        alert('Node label cannot be empty.');
        return;
    }

    // Require at least one of input or output type to be something other than 'none'
    if (inputType === 'none' && outputType === 'none') {
        alert('At least one of Input or Output type must be selected.');
        return;
    }

    const newNodeId = `N${nodeCounter}`;
    nodeCounter++;

    // Use selectedNode directly
    const selectedCenter = getConnectionPoint(selectedNode, 'output');
    const defaultOffset = 150; // Distance from selected node's output
    const defaultX = selectedCenter.x + defaultOffset;
    const defaultY = selectedCenter.y - 25; // Adjust position

    // Create node group
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'draggable-group');
    nodeGroup.setAttribute('data-node-id', newNodeId);

    // Create rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'node');
    rect.setAttribute('x', defaultX);
    rect.setAttribute('y', defaultY);
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '50');

    // Create text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-text');
    text.setAttribute('x', defaultX + 50);
    text.setAttribute('y', defaultY + 30);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('alignment-baseline', 'middle');
    text.textContent = nodeLabel;

    // Create connection points
    const inputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inputPoint.setAttribute('class', 'connection-point input');
    inputPoint.setAttribute('cx', defaultX);
    inputPoint.setAttribute('cy', defaultY + 25);
    inputPoint.setAttribute('r', '5');

    const outputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outputPoint.setAttribute('class', 'connection-point output');
    outputPoint.setAttribute('cx', defaultX + 100);
    outputPoint.setAttribute('cy', defaultY + 25);
    outputPoint.setAttribute('r', '5');

    // Create type labels for input and output
    const inputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    inputLabel.setAttribute('class', 'type-label');
    inputLabel.setAttribute('x', defaultX);
    inputLabel.setAttribute('y', defaultY + 20);
    inputLabel.setAttribute('text-anchor', 'middle');
    inputLabel.textContent = capitalizeFirstLetter(inputType);

    const outputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    outputLabel.setAttribute('class', 'type-label');
    outputLabel.setAttribute('x', defaultX + 100);
    outputLabel.setAttribute('y', defaultY + 20);
    outputLabel.setAttribute('text-anchor', 'middle');
    outputLabel.textContent = capitalizeFirstLetter(outputType);

    // Append node elements
    nodeGroup.appendChild(rect);
    nodeGroup.appendChild(text);
    nodeGroup.appendChild(inputPoint);
    nodeGroup.appendChild(outputPoint);
    nodeGroup.appendChild(inputLabel);
    nodeGroup.appendChild(outputLabel);

    // Append node group to SVG
    svg.appendChild(nodeGroup);

    // Add to nodes array
    nodes.push({ id: newNodeId, el: nodeGroup });

    // Create connector from selected node to new node
    const connectorId = `connector-${selectedNode.getAttribute('data-node-id')}-${newNodeId}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', connectorId);
    path.setAttribute('class', connectorType === 'solid' ? 'connector-solid' : 'connector-dashed');
    svg.insertBefore(path, svg.querySelector('.draggable-group')); // Insert before the first node group

    connectors.push({
        id: connectorId,
        from: selectedNode.getAttribute('data-node-id'),
        to: newNodeId,
        el: path,
        type: connectorType
    });

    updateConnectors(currentConnectorShape);

    // Close the modal
    addNodeModal.style.display = 'none';
});

// Handle Remove Node Confirmation
confirmRemoveBtn.addEventListener('click', () => {
    if (!selectedNode) {
        alert('No node selected.');
        removeNodeModal.style.display = 'none';
        return;
    }

    const nodeId = selectedNode.getAttribute('data-node-id');

    // Remove from SVG
    svg.removeChild(selectedNode);

    // Remove from nodes array
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
        nodes.splice(nodeIndex, 1);
    }

    // Remove associated connectors
    const connectorsToRemove = connectors.filter(conn => conn.from === nodeId || conn.to === nodeId);
    connectorsToRemove.forEach(conn => {
        svg.removeChild(conn.el);
        const index = connectors.findIndex(c => c.id === conn.id);
        if (index !== -1) connectors.splice(index, 1);
    });

    // Deselect node
    updateSelectedNode(null);

    // Update remaining connectors
    updateConnectors(currentConnectorShape);

    // Close the modal
    removeNodeModal.style.display = 'none';
});

// Handle Settings Form Submission
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedShape = connectorShapeSelect.value;

    // Update the global connector shape
    currentConnectorShape = selectedShape;

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
