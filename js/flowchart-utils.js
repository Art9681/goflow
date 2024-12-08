// flowchart-utils.js
// Provides utility functions and data structures for managing nodes and connectors.

// Arrays storing nodes and connectors in the diagram
// Each node: {id: string, el: SVGElement}
// Each connector: {id: string, from: string, to: string, el: SVGPathElement, type: string}
const nodes = [];
const connectors = [];

/**
 * Get the connection point coordinates for a node.
 * @param {SVGGElement} node - The node's group element.
 * @param {string} type - "input" or "output" to determine which connection point.
 * @returns {{x: number, y: number}}
 */
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

/**
 * Get the path data string for connectors based on the chosen shape.
 * @param {{x: number, y: number}} start 
 * @param {{x: number, y: number}} end 
 * @param {string} shape - 'straight', 'elbow', or 'curved'.
 * @returns {string} SVG path data
 */
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
    const midDefaultX = (start.x + end.x) / 2;
    return `M ${start.x},${start.y} L ${midDefaultX},${start.y} L ${midDefaultX},${end.y} L ${end.x},${end.y}`;
}

/**
 * Capitalize the first letter of a string, with special handling for 'none'.
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Update all connectors based on the current connector shape and node positions.
 * @param {string} currentConnectorShape
 */
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

/**
 * Initial unit tests to verify basic setup.
 */
function runTests() {
    // The tests here assume that after initialization, we have 3 nodes and 2 connectors.
    console.assert(nodes.length === 3, 'Should have 3 nodes initially');
    console.assert(connectors.length === 2, 'Should have 2 connectors initially');
    console.assert(document.querySelector('[data-node-id="A"]'), 'Node A should exist');
    console.assert(document.querySelector('[data-node-id="B"]'), 'Node B should exist');
    console.assert(document.querySelector('[data-node-id="C"]'), 'Node C should exist');
    console.assert(document.getElementById('connector-A-B'), 'Connector A-B should exist');
    console.assert(document.getElementById('connector-B-C'), 'Connector B-C should exist');
    console.log('All basic checks passed!');
}

export { 
    nodes, 
    connectors, 
    getConnectionPoint, 
    getConnectorPath, 
    capitalizeFirstLetter, 
    updateConnectors, 
    runTests 
};
