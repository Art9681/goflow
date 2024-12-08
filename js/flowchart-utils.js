// flowchart-utils.js
// Provides utility functions including node shape creation, export, etc.

const nodes = [];
const connectors = [];

function getConnectionPoint(node, type) {
    const rectOrShape = node.querySelector('.node');
    // For shapes, we rely on x,y,width,height from text or connection points.
    // Let's find the input point position or from the first line
    // We'll assume nodes always have text with known x,y to find center.

    // We'll find center from text:
    const text = node.querySelector('text.node-text');
    const cx = parseFloat(text.getAttribute('x'));
    const cy = parseFloat(text.getAttribute('y')) - 5; // since we added 5 earlier
    const width = 100;
    const height = 50;
    const x = cx - width/2;
    const y = cy - height/2 - 5; 

    if (type === 'input') {
        return { x: x, y: y + height/2 };
    } else if (type === 'output') {
        return { x: x + width, y: y + height/2 };
    }
    return { x: x + width / 2, y: y + height / 2 };
}

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

    // default elbow
    const midDefaultX = (start.x + end.x) / 2;
    return `M ${start.x},${start.y} L ${midDefaultX},${start.y} L ${midDefaultX},${end.y} L ${end.x},${end.y}`;
}

function capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

function exportDiagramToJSON() {
    const nodeData = nodes.map(n => {
        const text = n.el.querySelector('.node-text');
        const inputLabel = n.el.querySelectorAll('.type-label')[0];
        const outputLabel = n.el.querySelectorAll('.type-label')[1];

        const inputType = inputLabel ? inputLabel.textContent.toLowerCase() : 'none';
        const outputType = outputLabel ? outputLabel.textContent.toLowerCase() : 'none';

        // Recalculate x,y from text since shape might vary
        const cx = parseFloat(text.getAttribute('x'));
        const cy = parseFloat(text.getAttribute('y')) - 5;
        const width = 100;
        const height = 50;
        const x = cx - width/2;
        const y = cy - height/2 - 5;

        const shape = n.el.getAttribute('data-node-shape') || 'rounded-rect';

        return {
            id: n.id,
            x: x,
            y: y,
            width: width,
            height: height,
            label: text.textContent,
            inputType: inputType,
            outputType: outputType,
            shape: shape
        };
    });

    const connectorData = connectors.map(c => ({
        id: c.id,
        from: c.from,
        to: c.to,
        type: c.type
    }));

    return {
        nodes: nodeData,
        connectors: connectorData
    };
}

function clearDiagram(svg) {
    const nodesLayer = svg.querySelector('#nodes-layer');
    const connectorsLayer = svg.querySelector('#connectors-layer');

    nodes.forEach(n => {
        if (nodesLayer.contains(n.el)) {
            nodesLayer.removeChild(n.el);
        }
    });
    nodes.length = 0;

    connectors.forEach(c => {
        if (connectorsLayer.contains(c.el)) {
            connectorsLayer.removeChild(c.el);
        }
    });
    connectors.length = 0;
}

function runTests() {
    console.assert(nodes.length === 3, 'Should have 3 nodes initially', nodes.length);
    console.assert(connectors.length === 2, 'Should have 2 connectors initially');
    console.assert(document.querySelector('[data-node-id="A"]'), 'Node A should exist');
    console.assert(document.querySelector('[data-node-id="B"]'), 'Node B should exist');
    console.assert(document.querySelector('[data-node-id="C"]'), 'Node C should exist');
    console.assert(document.getElementById('connector-A-B'), 'Connector A-B should exist');
    console.assert(document.getElementById('connector-B-C'), 'Connector B-C should exist');
    console.log('All basic checks passed!');
}

function isValidConnection(fromType, toType) {
    return (fromType === 'output' && toType === 'input') || (fromType === 'input' && toType === 'output');
}

/**
 * Create a node shape element based on given shape type.
 * Supported shapes: rounded-rect, rect, circle, diamond, hexagon
 */
function createNodeShape(x, y, width, height, shapeType) {
    let shapeEl;
    const ns = "http://www.w3.org/2000/svg";

    if (shapeType === 'rounded-rect') {
        shapeEl = document.createElementNS(ns, 'rect');
        shapeEl.setAttribute('x', x);
        shapeEl.setAttribute('y', y);
        shapeEl.setAttribute('width', width);
        shapeEl.setAttribute('height', height);
        shapeEl.setAttribute('rx', '10');
        shapeEl.setAttribute('ry', '10');
        shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'rect') {
        shapeEl = document.createElementNS(ns, 'rect');
        shapeEl.setAttribute('x', x);
        shapeEl.setAttribute('y', y);
        shapeEl.setAttribute('width', width);
        shapeEl.setAttribute('height', height);
        shapeEl.setAttribute('rx', '0');
        shapeEl.setAttribute('ry', '0');
        shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'circle') {
        shapeEl = document.createElementNS(ns, 'circle');
        // center circle in rect
        const cx = x + width/2;
        const cy = y + height/2;
        const r = Math.min(width, height)/2;
        shapeEl.setAttribute('cx', cx);
        shapeEl.setAttribute('cy', cy);
        shapeEl.setAttribute('r', r);
        shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'diamond') {
        shapeEl = document.createElementNS(ns, 'polygon');
        // diamond points: top, right, bottom, left
        const p1 = `${x+width/2},${y}`;
        const p2 = `${x+width},${y+height/2}`;
        const p3 = `${x+width/2},${y+height}`;
        const p4 = `${x},${y+height/2}`;
        shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
        shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'hexagon') {
        shapeEl = document.createElementNS(ns, 'polygon');
        // hexagon points (flat topped):
        // Let's do a wide hex: top-left, top-right, mid-right, bottom-right, bottom-left, mid-left
        const p1 = `${x+width*0.25},${y}`;
        const p2 = `${x+width*0.75},${y}`;
        const p3 = `${x+width},${y+height/2}`;
        const p4 = `${x+width*0.75},${y+height}`;
        const p5 = `${x+width*0.25},${y+height}`;
        const p6 = `${x},${y+height/2}`;
        shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`);
        shapeEl.setAttribute('class', 'node');
    } else {
        // default to rounded rect if something unexpected
        shapeEl = document.createElementNS(ns, 'rect');
        shapeEl.setAttribute('x', x);
        shapeEl.setAttribute('y', y);
        shapeEl.setAttribute('width', width);
        shapeEl.setAttribute('height', height);
        shapeEl.setAttribute('rx', '10');
        shapeEl.setAttribute('ry', '10');
        shapeEl.setAttribute('class', 'node');
    }

    return shapeEl;
}

export { 
    nodes, 
    connectors, 
    getConnectionPoint, 
    getConnectorPath, 
    capitalizeFirstLetter, 
    updateConnectors, 
    isValidConnection,
    runTests,
    exportDiagramToJSON,
    clearDiagram,
    createNodeShape
};
