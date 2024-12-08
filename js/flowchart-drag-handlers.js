// flowchart-drag-handlers.js
// Handles dragging of flowchart nodes and connectors.

import {
    nodes,
    connectors,
    updateConnectors,
    getConnectionPoint,
    getConnectorPath
} from './flowchart-utils.js';

let selectedNode = null;
let isDraggingNode = false;
let isDraggingConnector = false;
let draggedConnector = null;
let targetNode = null;
let draggingLine = null;

let offsetX = 0;
let offsetY = 0;

/** 
 * Event handler references for mousemove and mouseup to properly remove them later.
 */
let mouseMoveHandler = null;
let mouseUpHandler = null;

/**
 * Select a node visually and update state.
 * @param {SVGGElement|null} nodeEl - The node group element to select.
 * @param {HTMLButtonElement} removeNodeBtn - Button to remove a node, enabled/disabled based on selection.
 */
export function selectNode(nodeEl, removeNodeBtn) {
    if (selectedNode) {
        selectedNode.querySelector('.node').classList.remove('selected');
    }
    selectedNode = nodeEl;
    if (selectedNode) {
        selectedNode.querySelector('.node').classList.add('selected');
        removeNodeBtn.disabled = false;
    } else {
        removeNodeBtn.disabled = true;
    }
}

/**
 * Handle mousedown event on the SVG to initiate node dragging or connector dragging.
 * @param {MouseEvent} e - The mousedown event.
 * @param {SVGElement} svg - The main SVG element.
 * @param {HTMLButtonElement} removeNodeBtn - The remove node button reference.
 * @param {string} currentConnectorShape - The current shape of the connectors (e.g. 'elbow').
 */
export function onMouseDown(e, svg, removeNodeBtn, currentConnectorShape) {
    const connectionPoint = e.target.closest('.connection-point');
    const nodeGroup = e.target.closest('.draggable-group');

    if (connectionPoint) {
        isDraggingConnector = true;
        draggedConnector = {
            type: connectionPoint.classList.contains('input') ? 'input' : 'output',
            nodeId: connectionPoint.closest('.draggable-group').getAttribute('data-node-id')
        };

        // Create temporary dragging line
        draggingLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        draggingLine.setAttribute('class', 'connector-dragging');
        const connectorsLayer = svg.querySelector('#connectors-layer');
        connectorsLayer.appendChild(draggingLine);

        mouseMoveHandler = (event) => onMouseMoveConnector(event, svg, currentConnectorShape);
    } else if (nodeGroup) {
        selectNode(nodeGroup, removeNodeBtn);
        const rect = nodeGroup.querySelector('rect');
        const startX = parseFloat(rect.getAttribute('x'));
        const startY = parseFloat(rect.getAttribute('y'));
        const svgRect = svg.getBoundingClientRect();
        offsetX = e.clientX - svgRect.left - startX;
        offsetY = e.clientY - svgRect.top - startY;

        isDraggingNode = true;
        mouseMoveHandler = (event) => onMouseMoveNode(event, svg, currentConnectorShape);
    }

    mouseUpHandler = () => onMouseUp(svg, currentConnectorShape);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

/**
 * Handle mousemove event during node dragging.
 * Updates node positions and connector paths.
 * @param {MouseEvent} e - The mousemove event.
 * @param {SVGElement} svg - The main SVG element.
 * @param {string} currentConnectorShape - Current connector shape.
 */
function onMouseMoveNode(e, svg, currentConnectorShape) {
    if (!isDraggingNode || !selectedNode) return;

    const rect = selectedNode.querySelector('rect');
    const text = selectedNode.querySelector('text');
    const width = parseFloat(rect.getAttribute('width'));
    const height = parseFloat(rect.getAttribute('height'));

    const svgRect = svg.getBoundingClientRect();
    let newX = e.clientX - svgRect.left - offsetX;
    let newY = e.clientY - svgRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, svg.clientWidth - width));
    newY = Math.max(0, Math.min(newY, svg.clientHeight - height));

    rect.setAttribute('x', newX);
    rect.setAttribute('y', newY);
    text.setAttribute('x', newX + width / 2);
    text.setAttribute('y', newY + height / 2 + 5);

    const inputPoint = selectedNode.querySelector('.connection-point.input');
    const outputPoint = selectedNode.querySelector('.connection-point.output');
    inputPoint.setAttribute('cx', newX);
    inputPoint.setAttribute('cy', newY + height / 2);
    outputPoint.setAttribute('cx', newX + width);
    outputPoint.setAttribute('cy', newY + height / 2);

    const typeLabels = selectedNode.querySelectorAll('.type-label');
    typeLabels.forEach((label, index) => {
        if (index === 0) {
            label.setAttribute('x', newX - 10);
            label.setAttribute('y', newY + height / 2 - 10);
        } else {
            label.setAttribute('x', newX + width + 10);
            label.setAttribute('y', newY + height / 2 - 10);
        }
    });

    updateConnectors(currentConnectorShape);
}

/**
 * Handle mousemove event during connector dragging.
 * @param {MouseEvent} e - The mousemove event.
 * @param {SVGElement} svg - The main SVG element.
 * @param {string} currentConnectorShape - The current shape of connectors.
 */
function onMouseMoveConnector(e, svg, currentConnectorShape) {
    if (!isDraggingConnector || !draggingLine) return;

    const svgRect = svg.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    // Get the source node and its connection point
    const sourceNode = nodes.find(n => n.id === draggedConnector.nodeId);
    if (!sourceNode) return;

    const start = getConnectionPoint(sourceNode.el, draggedConnector.type);
    let end = { x: mouseX, y: mouseY };

    // Clear previous valid-target highlights
    svg.querySelectorAll('.connection-point').forEach(cp => {
        cp.classList.remove('valid-target');
    });

    // Find potential target connection point
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    const hoveredNode = hoveredElement?.closest('.draggable-group');
    
    if (hoveredNode && hoveredNode.getAttribute('data-node-id') !== draggedConnector.nodeId) {
        const targetType = draggedConnector.type === 'output' ? 'input' : 'output';
        const connectionPoint = hoveredNode.querySelector(`.connection-point.${targetType}`);
        
        if (connectionPoint) {
            // Get the exact coordinates of the target connection point
            const cx = parseFloat(connectionPoint.getAttribute('cx'));
            const cy = parseFloat(connectionPoint.getAttribute('cy'));
            
            // If mouse is close to the connection point, snap to it
            const distance = Math.hypot(mouseX - cx, mouseY - cy);
            if (distance < 30) { // 30px snap distance
                end = { x: cx, y: cy };
                connectionPoint.classList.add('valid-target');
                targetNode = hoveredNode;
            } else {
                targetNode = null;
            }
        }
    } else {
        targetNode = null;
    }

    // Update the temporary line
    const pathData = getConnectorPath(start, end, currentConnectorShape);
    draggingLine.setAttribute('d', pathData);
}

/**
 * Handle mouseup event to finalize dragging.
 * @param {SVGElement} svg - The main SVG element.
 * @param {string} currentConnectorShape - The current shape of connectors.
 */
function onMouseUp(svg, currentConnectorShape) {
    if (isDraggingNode) {
        isDraggingNode = false;
    }

    if (isDraggingConnector) {
        isDraggingConnector = false;

        // Clear any remaining valid-target highlights
        svg.querySelectorAll('.connection-point').forEach(cp => {
            cp.classList.remove('valid-target');
        });

        if (targetNode) {
            const targetNodeId = targetNode.getAttribute('data-node-id');
            if (draggedConnector.nodeId !== targetNodeId) {
                const newConnector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                newConnector.setAttribute('class', 'connector-solid');
                const connectorsLayer = svg.querySelector('#connectors-layer');
                connectorsLayer.appendChild(newConnector);

                connectors.push({
                    id: `connector-${draggedConnector.nodeId}-${targetNodeId}`,
                    from: draggedConnector.type === 'output' ? draggedConnector.nodeId : targetNodeId,
                    to: draggedConnector.type === 'input' ? draggedConnector.nodeId : targetNodeId,
                    el: newConnector,
                    type: 'solid'
                });
                updateConnectors(currentConnectorShape);
            }
        }

        // Remove the temporary dragging line
        if (draggingLine && draggingLine.parentNode) {
            draggingLine.parentNode.removeChild(draggingLine);
        }
        draggingLine = null;
    }

    draggedConnector = null;
    targetNode = null;

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}