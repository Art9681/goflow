// flowchart-drag-handlers.js
// Now uses node dataset attributes for x,y,width,height instead of rect attributes.

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

let mouseMoveHandler = null;
let mouseUpHandler = null;

export function selectNode(nodeEl, removeNodeBtn) {
    if (selectedNode) {
        const oldShape = selectedNode.querySelector('.node');
        if (oldShape) oldShape.classList.remove('selected');
    }
    selectedNode = nodeEl;
    if (selectedNode) {
        const shape = selectedNode.querySelector('.node');
        if (shape) shape.classList.add('selected');
        removeNodeBtn.disabled = false;
    } else {
        removeNodeBtn.disabled = true;
    }
}

export function onMouseDown(e, svg, removeNodeBtn, currentConnectorShape) {
    const connectionPoint = e.target.closest('.connection-point');
    const nodeGroup = e.target.closest('.draggable-group');

    if (connectionPoint) {
        // Dragging a connector
        isDraggingConnector = true;
        draggedConnector = {
            type: connectionPoint.classList.contains('input') ? 'input' : 'output',
            nodeId: connectionPoint.closest('.draggable-group').getAttribute('data-node-id')
        };

        draggingLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        draggingLine.setAttribute('class', 'connector-dragging');
        const connectorsLayer = svg.querySelector('#connectors-layer');
        connectorsLayer.appendChild(draggingLine);

        mouseMoveHandler = (event) => onMouseMoveConnector(event, svg, currentConnectorShape);
    } else if (nodeGroup) {
        // Dragging a node
        selectNode(nodeGroup, removeNodeBtn);

        // Read x,y,width,height from dataset
        const startX = parseFloat(nodeGroup.dataset.x);
        const startY = parseFloat(nodeGroup.dataset.y);

        const svgRect = svg.getBoundingClientRect();
        offsetX = (e.clientX - svgRect.left) - startX;
        offsetY = (e.clientY - svgRect.top) - startY;

        isDraggingNode = true;
        mouseMoveHandler = (event) => onMouseMoveNode(event, svg, currentConnectorShape);
    }

    mouseUpHandler = () => onMouseUp(svg, currentConnectorShape);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

function onMouseMoveNode(e, svg, currentConnectorShape) {
    if (!isDraggingNode || !selectedNode) return;

    const svgRect = svg.getBoundingClientRect();

    const width = parseFloat(selectedNode.dataset.width);
    const height = parseFloat(selectedNode.dataset.height);

    let newX = (e.clientX - svgRect.left) - offsetX;
    let newY = (e.clientY - svgRect.top) - offsetY;

    newX = Math.max(0, Math.min(newX, svg.clientWidth - width));
    newY = Math.max(0, Math.min(newY, svg.clientHeight - height));

    // Update dataset
    selectedNode.dataset.x = newX;
    selectedNode.dataset.y = newY;

    // Update shape
    const shape = selectedNode.querySelector('.node');
    if (shape.tagName === 'rect') {
        shape.setAttribute('x', newX);
        shape.setAttribute('y', newY);
    } else if (shape.tagName === 'circle') {
        const cx = newX + width/2;
        const cy = newY + height/2;
        shape.setAttribute('cx', cx);
        shape.setAttribute('cy', cy);
    } else if (shape.tagName === 'polygon') {
        // Recalculate points for diamond/hexagon
        const shapeType = selectedNode.dataset.nodeShape;
        updatePolygonShape(shape, shapeType, newX, newY, width, height);
    }

    // Update text and connection points
    const text = selectedNode.querySelector('.node-text');
    text.setAttribute('x', newX + width / 2);
    text.setAttribute('y', newY + height / 2 + 5);

    const inputPoint = selectedNode.querySelector('.connection-point.input');
    const outputPoint = selectedNode.querySelector('.connection-point.output');
    inputPoint.setAttribute('cx', newX);
    inputPoint.setAttribute('cy', newY + height / 2);
    outputPoint.setAttribute('cx', newX + width);
    outputPoint.setAttribute('cy', newY + height / 2);

    const typeLabels = selectedNode.querySelectorAll('.type-label');
    if (typeLabels.length > 0) {
        // input label
        typeLabels[0].setAttribute('x', newX);
        typeLabels[0].setAttribute('y', newY + height / 2 - 10);
    }
    if (typeLabels.length > 1) {
        // output label
        typeLabels[1].setAttribute('x', newX + width);
        typeLabels[1].setAttribute('y', newY + height / 2 - 10);
    }

    updateConnectors(currentConnectorShape);
}

function onMouseMoveConnector(e, svg, currentConnectorShape) {
    if (!isDraggingConnector || !draggingLine) return;

    const svgRect = svg.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const sourceNode = nodes.find(n => n.id === draggedConnector.nodeId);
    if (!sourceNode) return;

    const start = getConnectionPoint(sourceNode.el, draggedConnector.type);
    let end = { x: mouseX, y: mouseY };

    svg.querySelectorAll('.connection-point').forEach(cp => {
        cp.classList.remove('valid-target');
    });

    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    const hoveredNode = hoveredElement?.closest('.draggable-group');
    
    if (hoveredNode && hoveredNode.getAttribute('data-node-id') !== draggedConnector.nodeId) {
        const targetType = draggedConnector.type === 'output' ? 'input' : 'output';
        const connectionPoint = hoveredNode.querySelector(`.connection-point.${targetType}`);
        
        if (connectionPoint) {
            const cx = parseFloat(connectionPoint.getAttribute('cx'));
            const cy = parseFloat(connectionPoint.getAttribute('cy'));
            const distance = Math.hypot(mouseX - cx, mouseY - cy);
            if (distance < 30) {
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

    const pathData = getConnectorPath(start, end, currentConnectorShape);
    draggingLine.setAttribute('d', pathData);
}

function onMouseUp(svg, currentConnectorShape) {
    if (isDraggingNode) {
        isDraggingNode = false;
    }

    if (isDraggingConnector) {
        isDraggingConnector = false;
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

                // Dispatch a custom event so flowchart.js can attach context menu
                const event = new CustomEvent('connectorAdded', { detail: { connector: newConnector }});
                document.dispatchEvent(event);
            }
        }

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

/**
 * Update polygon shapes (diamond, hexagon) position based on newX,newY.
 */
function updatePolygonShape(shape, shapeType, x, y, width, height) {
    if (shapeType === 'diamond') {
        const p1 = `${x+width/2},${y}`;
        const p2 = `${x+width},${y+height/2}`;
        const p3 = `${x+width/2},${y+height}`;
        const p4 = `${x},${y+height/2}`;
        shape.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
    } else if (shapeType === 'hexagon') {
        const p1 = `${x+width*0.25},${y}`;
        const p2 = `${x+width*0.75},${y}`;
        const p3 = `${x+width},${y+height/2}`;
        const p4 = `${x+width*0.75},${y+height}`;
        const p5 = `${x+width*0.25},${y+height}`;
        const p6 = `${x},${y+height/2}`;
        shape.setAttribute('points', `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`);
    }
}