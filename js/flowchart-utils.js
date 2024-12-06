// Utility Functions and Data Structures for Flowchart

// Data structures to manage nodes and connectors
const nodes = [
    { id: 'A', el: document.querySelector('[data-node-id="A"]') },
    { id: 'B', el: document.querySelector('[data-node-id="B"]') },
    { id: 'C', el: document.querySelector('[data-node-id="C"]') }
];

const connectors = [
    { id: 'connector-A-B', from: 'A', to: 'B', el: document.getElementById('connector-A-B'), type: 'solid' },
    { id: 'connector-B-C', from: 'B', to: 'C', el: document.getElementById('connector-B-C'), type: 'dashed' }
];

// Utility function to get connection point position
function getConnectionPoint(node, type) {
    const rect = node.querySelector('rect');
    const x = parseFloat(rect.getAttribute('x'));
    const y = parseFloat(rect.getAttribute('y'));
    const width = parseFloat(rect.getAttribute('width'));
    const height = parseFloat(rect.getAttribute('height'));

    if (type === 'input') {
        return { x: x, y: y + height / 2 };
    } else if (type === 'output') {
        return { x: x + width, y: y + height / 2 };
    }
    return { x: x + width / 2, y: y + height / 2 };
}

// Function to get connector path based on shape
function getConnectorPath(start, end, shape) {
    if (shape === 'straight') {
        return `M ${start.x},${start.y} L ${end.x},${end.y}`;
    } else if (shape === 'elbow') {
        const midX = (start.x + end.x) / 2;
        return `M ${start.x},${start.y} L ${midX},${start.y} L ${midX},${end.y} L ${end.x},${end.y}`;
    } else if (shape === 'curved') {
        const control1 = { x: start.x + (end.x - start.x) / 4, y: start.y };
        const control2 = { x: end.x - (end.x - start.x) / 4, y: end.y };
        return `M ${start.x},${start.y} C ${control1.x},${control1.y} ${control2.x},${control2.y} ${end.x},${end.y}`;
    }
    // Default to elbow if shape is unrecognized
    const midX = (start.x + end.x) / 2;
    return `M ${start.x},${start.y} L ${midX},${start.y} L ${midX},${end.y} L ${end.x},${end.y}`;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to update all connectors
function updateConnectors(currentConnectorShape) {
    connectors.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const start = getConnectionPoint(fromNode.el, 'output');
        const end = getConnectionPoint(toNode.el, 'input');

        const d = getConnectorPath(start, end, currentConnectorShape);
        conn.el.setAttribute('d', d);
    });
}

// Initial Unit Tests
function runTests() {
    console.assert(nodes.length === 3, 'Should have 3 nodes initially');
    console.assert(connectors.length === 2, 'Should have 2 connectors initially');
    console.assert(document.querySelector('[data-node-id="A"]'), 'Node A should exist');
    console.assert(document.querySelector('[data-node-id="B"]'), 'Node B should exist');
    console.assert(document.querySelector('[data-node-id="C"]'), 'Node C should exist');
    console.assert(document.getElementById('connector-A-B'), 'Connector A-B should exist');
    console.assert(document.getElementById('connector-B-C'), 'Connector B-C should exist');
    console.log('All basic checks passed!');
}

// Export functions and data structures for use in other files
export { 
    nodes, 
    connectors, 
    getConnectionPoint, 
    getConnectorPath, 
    capitalizeFirstLetter, 
    updateConnectors, 
    runTests 
};
