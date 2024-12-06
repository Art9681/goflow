// Drag Handlers for Flowchart Nodes

import { 
    nodes, 
    updateConnectors 
} from './flowchart-utils.js';

let selectedNode = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Function to select a node
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

// Event handlers for dragging
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

        // Add event listeners
        document.addEventListener('mousemove', (e) => onMouseMove(e, svg, currentConnectorShape));
        document.addEventListener('mouseup', onMouseUp);
    } else {
        selectNode(null, removeNodeBtn);
    }
}

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

    // Find all type labels within the node group
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

    updateConnectors(currentConnectorShape);
}

export function onMouseUp() {
    // Reset dragging state
    isDragging = false;

    // Remove event listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
