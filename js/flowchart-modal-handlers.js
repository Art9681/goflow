// flowchart-modal-handlers.js
// Handles adding and removing nodes via modals and applying settings changes.

import { 
    nodes, 
    connectors, 
    updateConnectors 
} from './flowchart-utils.js';

/**
 * Capitalize the first letter of a given string.
 * Special case: if string is 'none', return 'None'.
 * @param {string} string 
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Handle adding a new node from the modal form data.
 * @param {SVGGElement|null} selectedNode - The currently selected node (if any) to connect from.
 * @param {SVGElement} svg - The main SVG element.
 * @param {number} nodeCounter - Current node counter, will be incremented for new nodes.
 * @param {string} currentConnectorShape - Current connector shape.
 * @param {function} updateSelectedNode - Function to update the currently selected node reference.
 * @param {number} x - The x-coordinate where the new node will be placed.
 * @param {number} y - The y-coordinate where the new node will be placed.
 * @returns {{success: boolean, nodeCounter: number}}
 */
export function handleAddNode(
    selectedNode, 
    svg, 
    nodeCounter, 
    currentConnectorShape, 
    updateSelectedNode,
    x,
    y
) {
    const nodeLabel = document.getElementById('node-label').value.trim();
    const connectorType = document.getElementById('connector-type').value;

    const inputType = document.getElementById('input-type').value;
    const outputType = document.getElementById('output-type').value;

    if (nodeLabel === '') {
        alert('Node label cannot be empty.');
        return { success: false, nodeCounter };
    }

    // Require at least one of input or output type
    if (inputType === 'none' && outputType === 'none') {
        alert('At least one of Input or Output type must be selected.');
        return { success: false, nodeCounter };
    }

    const newNodeId = `N${nodeCounter}`;
    nodeCounter++;

    const defaultX = x;
    const defaultY = y;

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

    // Create type labels
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

    // Append all created elements to the node group
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

    // If there's a selected node, create a connector from it to the new node
    if (selectedNode) {
        const connectorId = `connector-${selectedNode.getAttribute('data-node-id')}-${newNodeId}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', connectorId);
        path.setAttribute('class', connectorType === 'solid' ? 'connector-solid' : 'connector-dashed');
        svg.insertBefore(path, svg.querySelector('.draggable-group'));

        connectors.push({
            id: connectorId,
            from: selectedNode.getAttribute('data-node-id'),
            to: newNodeId,
            el: path,
            type: connectorType
        });

        updateConnectors(currentConnectorShape);
    }

    return { 
        success: true, 
        nodeCounter 
    };
}

/**
 * Handle removing a node.
 * @param {SVGGElement|null} selectedNode - The currently selected node to remove.
 * @param {SVGElement} svg - The main SVG element.
 * @param {HTMLButtonElement} removeNodeBtn - The remove node button reference.
 * @param {string} currentConnectorShape - Current connector shape.
 * @returns {boolean}
 */
export function handleRemoveNode(
    selectedNode, 
    svg, 
    removeNodeBtn, 
    currentConnectorShape
) {
    if (!selectedNode) {
        alert('No node selected.');
        return false;
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

    // Update remaining connectors
    updateConnectors(currentConnectorShape);

    return true;
}

/**
 * Handle settings changes to connector shape.
 * @param {HTMLSelectElement} connectorShapeSelect - The select element for connector shapes.
 * @param {string} currentConnectorShape - Current shape before change.
 * @returns {string} - New connector shape.
 */
export function handleSettingsChange(
    connectorShapeSelect, 
    currentConnectorShape
) {
    const selectedShape = connectorShapeSelect.value;
    return selectedShape;
}
