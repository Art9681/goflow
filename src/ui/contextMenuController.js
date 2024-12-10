class ContextMenuController {
  constructor() {
    this.contextMenu = document.getElementById('context-menu');
    this.contextAddNode = document.getElementById('context-add-node');
    this.contextRemoveNode = document.getElementById('context-remove-node');
    this.contextConnectorSolid = document.getElementById('context-connector-solid');
    this.contextConnectorDashed = document.getElementById('context-connector-dashed');
    this.contextNodeRoundedRect = document.getElementById('context-node-rounded-rect');
    this.contextNodeRect = document.getElementById('context-node-rect');
    this.contextNodeCircle = document.getElementById('context-node-circle');
    this.contextNodeDiamond = document.getElementById('context-node-diamond');
    this.contextNodeHexagon = document.getElementById('context-node-hexagon');

    this.rightClickX = 0;
    this.rightClickY = 0;
    this.rightClickedNode = null;
    this.selectedConnector = null;

    this.setupContextMenuListeners();
  }

  setupContextMenuListeners() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const nodeGroup = e.target.closest('.draggable-group');
      const connectorPath = e.target.closest('path');

      if (!nodeGroup && !connectorPath) {
        this.rightClickedNode = null;
        this.selectedConnector = null;
        this.contextAddNode.style.display = 'block';
        this.contextRemoveNode.style.display = 'none';
        this.contextConnectorSolid.style.display = 'none';
        this.contextConnectorDashed.style.display = 'none';
        document.querySelectorAll('.node-shape-option').forEach(item => item.style.display = 'none');

        this.contextMenu.style.left = `${e.clientX}px`;
        this.contextMenu.style.top = `${e.clientY}px`;
        this.contextMenu.style.display = 'block';
      } else if (nodeGroup) {
        this.rightClickedNode = nodeGroup;
        this.selectedConnector = null;

        this.contextAddNode.style.display = 'block';
        this.contextRemoveNode.style.display = 'block';
        this.contextConnectorSolid.style.display = 'none';
        this.contextConnectorDashed.style.display = 'none';
        document.querySelectorAll('.node-shape-option').forEach(item => item.style.display = 'block');

        const svgRect = document.getElementById('flowchart').getBoundingClientRect();
        this.rightClickX = e.clientX - svgRect.left;
        this.rightClickY = e.clientY - svgRect.top;

        this.contextMenu.style.left = `${e.clientX}px`;
        this.contextMenu.style.top = `${e.clientY}px`;
        this.contextMenu.style.display = 'block';
      }
    });

    document.addEventListener('click', () => {
      this.contextMenu.style.display = 'none';
    });

    this.contextAddNode.addEventListener('click', () => {
      document.getElementById('add-node-modal').style.display = 'block';
      document.getElementById('add-node-form').reset();
    });

    this.contextRemoveNode.addEventListener('click', () => {
      if (!this.rightClickedNode) {
        alert('Please select a node to remove.');
        return;
      }
      document.getElementById('remove-node-modal').style.display = 'block';
    });

    this.contextConnectorSolid.addEventListener('click', () => {
      if (this.selectedConnector) {
        this.selectedConnector.type = 'solid';
        this.selectedConnector.el.setAttribute('class', 'connector-solid');
        this.updateConnectors();
      }
    });

    this.contextConnectorDashed.addEventListener('click', () => {
      if (this.selectedConnector) {
        this.selectedConnector.type = 'dashed';
        this.selectedConnector.el.setAttribute('class', 'connector-dashed');
        this.updateConnectors();
      }
    });

    this.contextNodeRoundedRect.addEventListener('click', () => this.changeNodeShape('rounded-rect'));
    this.contextNodeRect.addEventListener('click', () => this.changeNodeShape('rect'));
    this.contextNodeCircle.addEventListener('click', () => this.changeNodeShape('circle'));
    this.contextNodeDiamond.addEventListener('click', () => this.changeNodeShape('diamond'));
    this.contextNodeHexagon.addEventListener('click', () => this.changeNodeShape('hexagon'));
  }

  changeNodeShape(shape) {
    if (!this.rightClickedNode) return;
    const nodeData = nodes.find(n => n.el === this.rightClickedNode);
    if (!nodeData) return;

    const oldShapeEl = this.rightClickedNode.querySelector('.node');
    if (oldShapeEl) {
      this.rightClickedNode.removeChild(oldShapeEl);
    }

    const width = parseFloat(this.rightClickedNode.dataset.width);
    const height = parseFloat(this.rightClickedNode.dataset.height);
    const x = parseFloat(this.rightClickedNode.dataset.x);
    const y = parseFloat(this.rightClickedNode.dataset.y);

    const newShapeEl = createNodeShape(x, y, width, height, shape);
    this.rightClickedNode.insertBefore(newShapeEl, this.rightClickedNode.firstChild);
    this.rightClickedNode.setAttribute('data-node-shape', shape);

    this.updateConnectors();
  }

  updateConnectors() {
    connectors.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const start = getConnectionPoint(fromNode.el, 'output');
      const end = getConnectionPoint(toNode.el, 'input');

      const d = getConnectorPath(start, end, conn.shape);
      conn.el.setAttribute('d', d);
    });
  }
}

export default ContextMenuController;
