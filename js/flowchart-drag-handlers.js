// flowchart-drag-handlers.js
// Handles dragging of flowchart nodes. Includes selecting a node and updating its position.
// Also updates connectors after repositioning nodes.

import {
    nodes,
    updateConnectors
} from './flowchart-utils.js';

let selectedNode = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

/** 
 * @type {function|null}
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
 * Handle mousedown event on the SVG to initiate node dragging if a node is clicked.
 * @param {MouseEvent} e - The mousedown event.
 * @param {SVGElement} svg - The main SVG element.
 * @param {HTMLButtonElement} removeNodeBtn - The remove node button reference.
 * @param {string} currentConnectorShape - The current shape of the connectors (e.g. 'elbow').
 */
export function onMouseDown(e, svg, removeNodeBtn, currentConnectorShape) {
    const nodeGroup = e.target.closest('.draggable-group');
    if (nodeGroup) {
        selectNode(nodeGroup, removeNodeBtn);

        const rect = nodeGroup.querySelector('rect');
        const startX = parseFloat(rect.getAttribute('x'));
        const startY = parseFloat(rect.getAttribute('y'));
        // Calculate offset relative to SVG container
        const svgRect = svg.getBoundingClientRect();
        offsetX = e.clientX - svgRect.left - startX;
        offsetY = e.clientY - svgRect.top - startY;

        // Set dragging flag
        isDragging = true;

        // Define handlers so we can remove them on mouseup
        mouseMoveHandler = (event) => onMouseMove(event, svg, currentConnectorShape);
        mouseUpHandler = () => onMouseUp();

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    } else {
        selectNode(null, removeNodeBtn);
    }
}

/**
 * Handle mousemove event during drag operation.
 * Updates node positions and connector paths.
 * @param {MouseEvent} e - The mousemove event.
 * @param {SVGElement} svg - The main SVG element.
 * @param {string} currentConnectorShape - Current connector shape.
 */
export function onMouseMove(e, svg, currentConnectorShape) {
    if (!isDragging || !selectedNode) return;

    const rect = selectedNode.querySelector('rect');
    const text = selectedNode.querySelector('text');
    const width = parseFloat(rect.getAttribute('width'));
    const height = parseFloat(rect.getAttribute('height'));

    // Calculate new position relative to SVG container
    const svgRect = svg.getBoundingClientRect();
    let newX = e.clientX - svgRect.left - offsetX;
    let newY = e.clientY - svgRect.top - offsetY;

    // Ensure the node stays within the SVG bounds
    newX = Math.max(0, Math.min(newX, svg.clientWidth - width));
    newY = Math.max(0, Math.min(newY, svg.clientHeight - height));

    rect.setAttribute('x', newX);
    rect.setAttribute('y', newY);

    // Update text position accordingly
    text.setAttribute('x', newX + width / 2);
    text.setAttribute('y', newY + height / 2 + 5); // +5 for vertical alignment

    // Update connection points positions
    const inputPoint = selectedNode.querySelector('.connection-point.input');
    const outputPoint = selectedNode.querySelector('.connection-point.output');
    inputPoint.setAttribute('cx', newX);
    inputPoint.setAttribute('cy', newY + height / 2);
    outputPoint.setAttribute('cx', newX + width);
    outputPoint.setAttribute('cy', newY + height / 2);

    // Update type labels positions
    const typeLabels = selectedNode.querySelectorAll('.type-label');
    typeLabels.forEach((label, index) => {
        if (index === 0) { // Input label
            label.setAttribute('x', newX - 10);
            label.setAttribute('y', newY + height / 2 - 10);
        } else { // Output label
            label.setAttribute('x', newX + width + 10);
            label.setAttribute('y', newY + height / 2 - 10);
        }
    });

    // Update connectors that are connected to this node
    updateConnectors(currentConnectorShape);
}

/**
 * Handle mouseup event to finalize dragging.
 */
export function onMouseUp() {
    // Reset dragging state
    isDragging = false;

    // Remove event listeners
    if (mouseMoveHandler) {
        document.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
    }
    if (mouseUpHandler) {
        document.removeEventListener('mouseup', mouseUpHandler);
        mouseUpHandler = null;
    }
}
