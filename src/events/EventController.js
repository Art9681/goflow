class EventController {
  constructor(svg, diagramEngine) {
    this.svg = svg;
    this.diagramEngine = diagramEngine;
    this.isDraggingNode = false;
    this.isDraggingConnector = false;
    this.draggedConnector = null;
    this.targetNode = null;
    this.draggingLine = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }

  selectNode(nodeEl, removeNodeBtn) {
    if (this.selectedNode) {
      const oldShape = this.selectedNode.querySelector('.node');
      if (oldShape) oldShape.classList.remove('selected');
    }
    this.selectedNode = nodeEl;
    if (this.selectedNode) {
      const shape = this.selectedNode.querySelector('.node');
      if (shape) shape.classList.add('selected');
      removeNodeBtn.disabled = false;
    } else {
      removeNodeBtn.disabled = true;
    }
  }

  onMouseDown(e, removeNodeBtn, currentConnectorShape) {
    const connectionPoint = e.target.closest('.connection-point');
    const nodeGroup = e.target.closest('.draggable-group');

    if (connectionPoint) {
      this.isDraggingConnector = true;
      this.draggedConnector = {
        type: connectionPoint.classList.contains('input') ? 'input' : 'output',
        nodeId: connectionPoint.closest('.draggable-group').getAttribute('data-node-id')
      };

      this.draggingLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.draggingLine.setAttribute('class', 'connector-dragging');
      const connectorsLayer = this.svg.querySelector('#connectors-layer');
      connectorsLayer.appendChild(this.draggingLine);

      this.mouseMoveHandler = (event) => this.onMouseMoveConnector(event, currentConnectorShape);
    } else if (nodeGroup) {
      this.selectNode(nodeGroup, removeNodeBtn);

      const startX = parseFloat(nodeGroup.dataset.x);
      const startY = parseFloat(nodeGroup.dataset.y);

      const svgRect = this.svg.getBoundingClientRect();
      this.offsetX = (e.clientX - svgRect.left) - startX;
      this.offsetY = (e.clientY - svgRect.top) - startY;

      this.isDraggingNode = true;
      this.mouseMoveHandler = (event) => this.onMouseMoveNode(event, currentConnectorShape);
    }

    this.mouseUpHandler = () => this.onMouseUp(currentConnectorShape);
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  }

  onMouseMoveNode(e, currentConnectorShape) {
    if (!this.isDraggingNode || !this.selectedNode) return;

    const svgRect = this.svg.getBoundingClientRect();

    const width = parseFloat(this.selectedNode.dataset.width);
    const height = parseFloat(this.selectedNode.dataset.height);

    let newX = (e.clientX - svgRect.left) - this.offsetX;
    let newY = (e.clientY - svgRect.top) - this.offsetY;

    newX = Math.max(0, Math.min(newX, this.svg.clientWidth - width));
    newY = Math.max(0, Math.min(newY, this.svg.clientHeight - height));

    this.selectedNode.dataset.x = newX;
    this.selectedNode.dataset.y = newY;

    const shape = this.selectedNode.querySelector('.node');
    if (shape.tagName === 'rect') {
      shape.setAttribute('x', newX);
      shape.setAttribute('y', newY);
    } else if (shape.tagName === 'circle') {
      const cx = newX + width / 2;
      const cy = newY + height / 2;
      shape.setAttribute('cx', cx);
      shape.setAttribute('cy', cy);
    } else if (shape.tagName === 'polygon') {
      const shapeType = this.selectedNode.dataset.nodeShape;
      this.updatePolygonShape(shape, shapeType, newX, newY, width, height);
    }

    const text = this.selectedNode.querySelector('.node-text');
    text.setAttribute('x', newX + width / 2);
    text.setAttribute('y', newY + height / 2 + 5);

    const inputPoint = this.selectedNode.querySelector('.connection-point.input');
    const outputPoint = this.selectedNode.querySelector('.connection-point.output');
    inputPoint.setAttribute('cx', newX);
    inputPoint.setAttribute('cy', newY + height / 2);
    outputPoint.setAttribute('cx', newX + width);
    outputPoint.setAttribute('cy', newY + height / 2);

    const typeLabels = this.selectedNode.querySelectorAll('.type-label');
    if (typeLabels.length > 0) {
      typeLabels[0].setAttribute('x', newX);
      typeLabels[0].setAttribute('y', newY + height / 2 - 10);
    }
    if (typeLabels.length > 1) {
      typeLabels[1].setAttribute('x', newX + width);
      typeLabels[1].setAttribute('y', newY + height / 2 - 10);
    }

    this.diagramEngine.updateConnectors(currentConnectorShape);
  }

  onMouseMoveConnector(e, currentConnectorShape) {
    if (!this.isDraggingConnector || !this.draggingLine) return;

    const svgRect = this.svg.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const sourceNode = this.diagramEngine.nodes.find(n => n.id === this.draggedConnector.nodeId);
    if (!sourceNode) return;

    const start = this.diagramEngine.getConnectionPoint(sourceNode.el, this.draggedConnector.type);
    let end = { x: mouseX, y: mouseY };

    this.svg.querySelectorAll('.connection-point').forEach(cp => {
      cp.classList.remove('valid-target');
    });

    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    const hoveredNode = hoveredElement?.closest('.draggable-group');

    if (hoveredNode && hoveredNode.getAttribute('data-node-id') !== this.draggedConnector.nodeId) {
      const targetType = this.draggedConnector.type === 'output' ? 'input' : 'output';
      const connectionPoint = hoveredNode.querySelector(`.connection-point.${targetType}`);

      if (connectionPoint) {
        const cx = parseFloat(connectionPoint.getAttribute('cx'));
        const cy = parseFloat(connectionPoint.getAttribute('cy'));
        const distance = Math.hypot(mouseX - cx, mouseY - cy);
        if (distance < 30) {
          end = { x: cx, y: cy };
          connectionPoint.classList.add('valid-target');
          this.targetNode = hoveredNode;
        } else {
          this.targetNode = null;
        }
      }
    } else {
      this.targetNode = null;
    }

    const pathData = this.diagramEngine.getConnectorPath(start, end, currentConnectorShape);
    this.draggingLine.setAttribute('d', pathData);
  }

  onMouseUp(currentConnectorShape) {
    if (this.isDraggingNode) {
      this.isDraggingNode = false;
    }

    if (this.isDraggingConnector) {
      this.isDraggingConnector = false;
      this.svg.querySelectorAll('.connection-point').forEach(cp => {
        cp.classList.remove('valid-target');
      });

      if (this.targetNode) {
        const targetNodeId = this.targetNode.getAttribute('data-node-id');
        if (this.draggedConnector.nodeId !== targetNodeId) {
          const newConnector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          newConnector.setAttribute('class', 'connector-solid');
          const connectorsLayer = this.svg.querySelector('#connectors-layer');
          connectorsLayer.appendChild(newConnector);

          this.diagramEngine.addConnector({
            id: `connector-${this.draggedConnector.nodeId}-${targetNodeId}`,
            from: this.draggedConnector.type === 'output' ? this.draggedConnector.nodeId : targetNodeId,
            to: this.draggedConnector.type === 'input' ? this.draggedConnector.nodeId : targetNodeId,
            el: newConnector,
            type: 'solid'
          });

          this.diagramEngine.updateConnectors(currentConnectorShape);

          const event = new CustomEvent('connectorAdded', { detail: { connector: newConnector } });
          document.dispatchEvent(event);
        }
      }

      if (this.draggingLine && this.draggingLine.parentNode) {
        this.draggingLine.parentNode.removeChild(this.draggingLine);
      }
      this.draggingLine = null;
    }

    this.draggedConnector = null;
    this.targetNode = null;

    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  }

  updatePolygonShape(shape, shapeType, x, y, width, height) {
    if (shapeType === 'diamond') {
      const p1 = `${x + width / 2},${y}`;
      const p2 = `${x + width},${y + height / 2}`;
      const p3 = `${x + width / 2},${y + height}`;
      const p4 = `${x},${y + height / 2}`;
      shape.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
    } else if (shapeType === 'hexagon') {
      const p1 = `${x + width * 0.25},${y}`;
      const p2 = `${x + width * 0.75},${y}`;
      const p3 = `${x + width},${y + height / 2}`;
      const p4 = `${x + width * 0.75},${y + height}`;
      const p5 = `${x + width * 0.25},${y + height}`;
      const p6 = `${x},${y + height / 2}`;
      shape.setAttribute('points', `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`);
    }
  }
}

export default EventController;
