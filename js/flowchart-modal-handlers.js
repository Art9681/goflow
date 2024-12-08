// flowchart-modal-handlers.js
// Now stores node position and size in dataset attributes when adding nodes.

import { 
    nodes, 
    connectors, 
    updateConnectors,
    createNodeShape
} from './flowchart-utils.js';

export function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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
    const nodeShape = document.getElementById('node-shape').value;

    if (nodeLabel === '') {
        alert('Node label cannot be empty.');
        return { success: false, nodeCounter };
    }

    if (inputType === 'none' && outputType === 'none') {
        alert('At least one of Input or Output type must be selected.');
        return { success: false, nodeCounter };
    }

    const newNodeId = `N${nodeCounter}`;
    nodeCounter++;

    const defaultX = x;
    const defaultY = y;
    const width = 100;
    const height = 50;

    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'draggable-group');
    nodeGroup.setAttribute('data-node-id', newNodeId);
    nodeGroup.setAttribute('data-node-shape', nodeShape);
    // Store position and size in dataset
    nodeGroup.dataset.x = defaultX;
    nodeGroup.dataset.y = defaultY;
    nodeGroup.dataset.width = width;
    nodeGroup.dataset.height = height;

    const shapeEl = createNodeShape(defaultX, defaultY, width, height, nodeShape);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-text');
    text.setAttribute('x', defaultX + width/2);
    text.setAttribute('y', defaultY + height/2 + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('alignment-baseline', 'middle');
    text.textContent = nodeLabel;

    const inputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inputPoint.setAttribute('class', 'connection-point input');
    inputPoint.setAttribute('cx', defaultX);
    inputPoint.setAttribute('cy', defaultY + height/2);
    inputPoint.setAttribute('r', '5');

    const outputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outputPoint.setAttribute('class', 'connection-point output');
    outputPoint.setAttribute('cx', defaultX + width);
    outputPoint.setAttribute('cy', defaultY + height/2);
    outputPoint.setAttribute('r', '5');

    const inputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    inputLabel.setAttribute('class', 'type-label');
    inputLabel.setAttribute('x', defaultX);
    inputLabel.setAttribute('y', defaultY + height/2 - 10);
    inputLabel.setAttribute('text-anchor', 'middle');
    inputLabel.textContent = capitalizeFirstLetter(inputType);

    const outputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    outputLabel.setAttribute('class', 'type-label');
    outputLabel.setAttribute('x', defaultX + width);
    outputLabel.setAttribute('y', defaultY + height/2 - 10);
    outputLabel.setAttribute('text-anchor', 'middle');
    outputLabel.textContent = capitalizeFirstLetter(outputType);

    nodeGroup.appendChild(shapeEl);
    nodeGroup.appendChild(text);
    nodeGroup.appendChild(inputPoint);
    nodeGroup.appendChild(outputPoint);
    nodeGroup.appendChild(inputLabel);
    nodeGroup.appendChild(outputLabel);

    svg.querySelector('#nodes-layer').appendChild(nodeGroup);

    nodes.push({ id: newNodeId, el: nodeGroup });

    if (selectedNode) {
        const connectorId = `connector-${selectedNode.getAttribute('data-node-id')}-${newNodeId}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', connectorId);
        path.setAttribute('class', connectorType === 'solid' ? 'connector-solid' : 'connector-dashed');
        svg.querySelector('#connectors-layer').appendChild(path);

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
    const nodesLayer = svg.querySelector('#nodes-layer');
    const connectorsLayer = svg.querySelector('#connectors-layer');

    if (nodesLayer.contains(selectedNode)) {
        nodesLayer.removeChild(selectedNode);
    }

    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
        nodes.splice(nodeIndex, 1);
    }

    const connectorsToRemove = connectors.filter(conn => conn.from === nodeId || conn.to === nodeId);
    connectorsToRemove.forEach(conn => {
        if (connectorsLayer.contains(conn.el)) {
            connectorsLayer.removeChild(conn.el);
        }
        const index = connectors.findIndex(c => c.id === conn.id);
        if (index !== -1) connectors.splice(index, 1);
    });

    updateConnectors(currentConnectorShape);

    return true;
}

export function handleSettingsChange(
    connectorShapeSelect, 
    currentConnectorShape
) {
    const selectedShape = connectorShapeSelect.value;
    return selectedShape;
}
