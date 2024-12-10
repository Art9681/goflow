class DiagramEngine {
  constructor(svg) {
    this.svg = svg;
    this.nodes = [];
    this.connectors = [];
  }

  addNode(node) {
    this.nodes.push(node);
    this.renderNode(node);
  }

  removeNode(nodeId) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.render();
  }

  updateNode(node) {
    const index = this.nodes.findIndex(n => n.id === node.id);
    if (index !== -1) {
      this.nodes[index] = node;
      this.render();
    }
  }

  addConnector(connector) {
    this.connectors.push(connector);
    this.renderConnector(connector);
  }

  removeConnector(connectorId) {
    this.connectors = this.connectors.filter(connector => connector.id !== connectorId);
    this.render();
  }

  updateConnector(connector) {
    const index = this.connectors.findIndex(c => c.id === connector.id);
    if (index !== -1) {
      this.connectors[index] = connector;
      this.render();
    }
  }

  render() {
    this.clear();
    this.nodes.forEach(node => this.renderNode(node));
    this.connectors.forEach(connector => this.renderConnector(connector));
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  renderNode(node) {
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'draggable-group');
    nodeGroup.setAttribute('data-node-id', node.id);
    nodeGroup.setAttribute('data-node-shape', node.shape);
    nodeGroup.dataset.x = node.x;
    nodeGroup.dataset.y = node.y;
    nodeGroup.dataset.width = node.width;
    nodeGroup.dataset.height = node.height;

    const shapeEl = this.createNodeShape(node.x, node.y, node.width, node.height, node.shape);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('alignment-baseline', 'middle');
    text.setAttribute('x', node.x + node.width / 2);
    text.setAttribute('y', node.y + node.height / 2 + 5);
    text.textContent = node.label;

    const inputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inputPoint.setAttribute('class', 'connection-point input');
    inputPoint.setAttribute('cx', node.x);
    inputPoint.setAttribute('cy', node.y + node.height / 2);
    inputPoint.setAttribute('r', '5');

    const outputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outputPoint.setAttribute('class', 'connection-point output');
    outputPoint.setAttribute('cx', node.x + node.width);
    outputPoint.setAttribute('cy', node.y + node.height / 2);
    outputPoint.setAttribute('r', '5');

    const inputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    inputLabel.setAttribute('class', 'type-label');
    inputLabel.setAttribute('x', node.x);
    inputLabel.setAttribute('y', node.y + node.height / 2 - 10);
    inputLabel.setAttribute('text-anchor', 'middle');
    inputLabel.textContent = this.capitalizeFirstLetter(node.inputType);

    const outputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    outputLabel.setAttribute('class', 'type-label');
    outputLabel.setAttribute('x', node.x + node.width);
    outputLabel.setAttribute('y', node.y + node.height / 2 - 10);
    outputLabel.setAttribute('text-anchor', 'middle');
    outputLabel.textContent = this.capitalizeFirstLetter(node.outputType);

    nodeGroup.appendChild(shapeEl);
    nodeGroup.appendChild(text);
    nodeGroup.appendChild(inputPoint);
    nodeGroup.appendChild(outputPoint);
    nodeGroup.appendChild(inputLabel);
    nodeGroup.appendChild(outputLabel);

    this.svg.appendChild(nodeGroup);
  }

  renderConnector(connector) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', connector.id);
    path.setAttribute('class', connector.type === 'solid' ? 'connector-solid' : 'connector-dashed');
    this.svg.appendChild(path);

    this.updateConnectorPath(connector);
  }

  updateConnectorPath(connector) {
    const fromNode = this.nodes.find(n => n.id === connector.from);
    const toNode = this.nodes.find(n => n.id === connector.to);
    if (!fromNode || !toNode) return;

    const start = this.getConnectionPoint(fromNode, 'output');
    const end = this.getConnectionPoint(toNode, 'input');

    const d = this.getConnectorPath(start, end, connector.shape);
    connector.el.setAttribute('d', d);
  }

  getConnectionPoint(node, type) {
    const rectOrShape = node.el.querySelector('.node');
    const text = node.el.querySelector('text.node-text');
    const cx = parseFloat(text.getAttribute('x'));
    const cy = parseFloat(text.getAttribute('y')) - 5;
    const width = 100;
    const height = 50;
    const x = cx - width / 2;
    const y = cy - height / 2 - 5;

    if (type === 'input') {
      return { x: x, y: y + height / 2 };
    } else if (type === 'output') {
      return { x: x + width, y: y + height / 2 };
    }
    return { x: x + width / 2, y: y + height / 2 };
  }

  getConnectorPath(start, end, shape) {
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

    const midDefaultX = (start.x + end.x) / 2;
    return `M ${start.x},${start.y} L ${midDefaultX},${start.y} L ${midDefaultX},${end.y} L ${end.x},${end.y}`;
  }

  capitalizeFirstLetter(string) {
    if (string === 'none') return 'None';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  createNodeShape(x, y, width, height, shapeType) {
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
      shapeEl = document.createElementNS(ns, 'rect');
      shapeEl.setAttribute('x', x);
      shapeEl.setAttribute('y', y);
      shapeEl.setAttribute('width', width);
      shapeEl.setAttribute('height', height);
      const r = Math.min(width, height) / 2;
      shapeEl.setAttribute('rx', r.toString());
      shapeEl.setAttribute('ry', r.toString());
      shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'diamond') {
      shapeEl = document.createElementNS(ns, 'polygon');
      const p1 = `${x + width / 2},${y}`;
      const p2 = `${x + width},${y + height / 2}`;
      const p3 = `${x + width / 2},${y + height}`;
      const p4 = `${x},${y + height / 2}`;
      shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
      shapeEl.setAttribute('class', 'node');
    } else if (shapeType === 'hexagon') {
      shapeEl = document.createElementNS(ns, 'polygon');
      const p1 = `${x + width * 0.25},${y}`;
      const p2 = `${x + width * 0.75},${y}`;
      const p3 = `${x + width},${y + height / 2}`;
      const p4 = `${x + width * 0.75},${y + height}`;
      const p5 = `${x + width * 0.25},${y + height}`;
      const p6 = `${x},${y + height / 2}`;
      shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`);
      shapeEl.setAttribute('class', 'node');
    } else {
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
}

export default DiagramEngine;
