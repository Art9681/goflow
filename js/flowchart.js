import DiagramEngine from '../src/diagram/DiagramEngine.js';
import convertJsonToDiagramData from '../src/importers/jsonImporter.js';
import convertK8sToDiagramData from '../src/importers/k8sImporter.js';
import ModalsController from '../src/ui/modalsController.js';
import EventController from '../src/events/EventController.js';

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('flowchart');
    const zoomPanGroup = svg.querySelector('#zoom-pan-group');
    const connectorsLayer = document.getElementById('connectors-layer');
    const nodesLayer = document.getElementById('nodes-layer');
    const settingsBtn = document.getElementById('settings-btn');

    const modalsController = new ModalsController();
    const diagramEngine = new DiagramEngine(svg);
    const eventController = new EventController(svg, diagramEngine);

    const addNodeForm = document.getElementById('add-node-form');
    const confirmRemoveBtn = document.getElementById('confirm-remove-btn');
    const settingsForm = document.getElementById('settings-form');
    const connectorShapeSelect = document.getElementById('connector-shape');

    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');

    const importK8sBtn = document.getElementById('import-k8s-btn');
    const importK8sFile = document.getElementById('import-k8s-file');
    const confirmImportK8sBtn = document.getElementById('confirm-import-k8s-btn');

    const importFile = document.getElementById('import-file');
    const triggerExport = document.getElementById('trigger-export');
    const exportTextarea = document.getElementById('export-textarea');
    const exportLink = document.getElementById('export-link');

    const contextMenu = document.getElementById('context-menu');
    const contextAddNode = document.getElementById('context-add-node');
    const contextRemoveNode = document.getElementById('context-remove-node');
    const contextConnectorSolid = document.getElementById('context-connector-solid');
    const contextConnectorDashed = document.getElementById('context-connector-dashed');

    const contextNodeRoundedRect = document.getElementById('context-node-rounded-rect');
    const contextNodeRect = document.getElementById('context-node-rect');
    const contextNodeCircle = document.getElementById('context-node-circle');
    const contextNodeDiamond = document.getElementById('context-node-diamond');
    const contextNodeHexagon = document.getElementById('context-node-hexagon');

    let nodeCounter = 1; 
    let selectedNode = null; 
    let currentConnectorShape = 'elbow';

    let rightClickX = 0;
    let rightClickY = 0;
    let rightClickedNode = null;
    let selectedConnector = null; 

    let currentScale = 1.0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;

    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;

    function updateSelectedNode(nodeEl) {
        selectedNode = nodeEl;
        eventController.selectNode(nodeEl, {disabled: true});
    }

    const initialData = {
        "nodes": [
            { "id": "A", "x": 150, "y": 100, "width": 100, "height": 50, "label": "Node A", "inputType": "string", "outputType": "int", "shape": "rounded-rect" },
            { "id": "B", "x": 350, "y": 200, "width": 100, "height": 50, "label": "Node B", "inputType": "int", "outputType": "float", "shape": "rect" },
            { "id": "C", "x": 550, "y": 100, "width": 100, "height": 50, "label": "Node C", "inputType": "float", "outputType": "string", "shape": "circle" }
        ],
        "connectors": [
            { "id": "connector-A-B", "from": "A", "to": "B", "type": "solid" },
            { "id": "connector-B-C", "from": "B", "to": "C", "type": "dashed" }
        ]
    };

    function attachConnectorContextMenu(connectorEl) {
        connectorEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectedConnector = diagramEngine.connectors.find(conn => conn.el === e.target);
            if (selectedConnector) {
                contextAddNode.style.display = 'none';
                contextRemoveNode.style.display = 'none';
                document.querySelectorAll('.node-shape-option').forEach(item => item.style.display = 'none');
                contextConnectorSolid.style.display = 'block';
                contextConnectorDashed.style.display = 'block';

                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.style.display = 'block';
            }
        });
    }

    function initializeDiagramFromJSON(data) {
        diagramEngine.clear();

        data.nodes.forEach(n => {
            const node = {
                id: n.id,
                x: n.x,
                y: n.y,
                width: n.width,
                height: n.height,
                label: n.label,
                inputType: n.inputType,
                outputType: n.outputType,
                shape: n.shape
            };
            diagramEngine.addNode(node);

            const numericPart = parseInt(n.id.replace(/\D+/g,''), 10);
            if (!isNaN(numericPart) && numericPart >= nodeCounter) {
                nodeCounter = numericPart + 1;
            }
        });

        data.connectors.forEach(c => {
            const connector = {
                id: c.id,
                from: c.from,
                to: c.to,
                type: c.type
            };
            diagramEngine.addConnector(connector);
            attachConnectorContextMenu(connector.el);
        });

        diagramEngine.updateConnectors(currentConnectorShape);
    }

    function importDiagramFromJSON(jsonString) {
        const trimmed = jsonString.trim();
        if (!trimmed) {
            alert('No JSON provided.');
            return;
        }

        let data;
        try {
            data = JSON.parse(trimmed);
        } catch (e) {
            console.error('JSON parse error:', e);
            alert('Invalid JSON string. Please check the console for details.');
            return;
        }

        if (!data.nodes || !data.connectors || !Array.isArray(data.nodes) || !Array.isArray(data.connectors)) {
            alert('Invalid JSON format. Must contain "nodes" and "connectors" arrays.');
            return;
        }

        initializeDiagramFromJSON(data);
    }

    function changeNodeShape(shape) {
        if (!rightClickedNode) return;
        const nodeData = diagramEngine.nodes.find(n => n.el === rightClickedNode);
        if (!nodeData) return;

        const oldShapeEl = rightClickedNode.querySelector('.node');
        if (oldShapeEl) {
            rightClickedNode.removeChild(oldShapeEl);
        }

        const width = parseFloat(rightClickedNode.dataset.width);
        const height = parseFloat(rightClickedNode.dataset.height);
        const x = parseFloat(rightClickedNode.dataset.x);
        const y = parseFloat(rightClickedNode.dataset.y);

        const newShapeEl = diagramEngine.createNodeShape(x, y, width, height, shape);
        rightClickedNode.insertBefore(newShapeEl, rightClickedNode.firstChild);
        rightClickedNode.setAttribute('data-node-shape', shape);

        diagramEngine.updateConnectors(currentConnectorShape);
    }

    modalsController.setupModalCloseListeners();
    modalsController.setupWindowClickHandler();

    svg.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const nodeGroup = e.target.closest('.draggable-group');
        const connectorPath = e.target.closest('path');

        if (!nodeGroup && !connectorPath) {
            rightClickedNode = null;
            selectedConnector = null;
            contextAddNode.style.display = 'block';
            contextRemoveNode.style.display = 'none';
            contextConnectorSolid.style.display = 'none';
            contextConnectorDashed.style.display = 'none';
            document.querySelectorAll('.node-shape-option').forEach(item => item.style.display = 'none');

            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.display = 'block';
        } else if (nodeGroup) {
            rightClickedNode = nodeGroup;
            updateSelectedNode(rightClickedNode);
            selectedConnector = null;

            contextAddNode.style.display = 'block';
            contextRemoveNode.style.display = 'block';
            contextConnectorSolid.style.display = 'none';
            contextConnectorDashed.style.display = 'none';
            document.querySelectorAll('.node-shape-option').forEach(item => item.style.display = 'block');

            const svgRect = svg.getBoundingClientRect();
            rightClickX = e.clientX - svgRect.left;
            rightClickY = e.clientY - svgRect.top;

            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.display = 'block';
        }
    });

    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });

    contextAddNode.addEventListener('click', () => {
        modalsController.openModal('addNodeModal');
        addNodeForm.reset();
    });

    contextRemoveNode.addEventListener('click', () => {
        if (!selectedNode) {
            alert('Please select a node to remove.');
            return;
        }
        modalsController.openModal('removeNodeModal');
    });

    contextConnectorSolid.addEventListener('click', () => {
        if (selectedConnector) {
            selectedConnector.type = 'solid';
            selectedConnector.el.setAttribute('class', 'connector-solid');
            diagramEngine.updateConnectors(currentConnectorShape);
        }
    });

    contextConnectorDashed.addEventListener('click', () => {
        if (selectedConnector) {
            selectedConnector.type = 'dashed';
            selectedConnector.el.setAttribute('class', 'connector-dashed');
            diagramEngine.updateConnectors(currentConnectorShape);
        }
    });

    contextNodeRoundedRect.addEventListener('click', () => changeNodeShape('rounded-rect'));
    contextNodeRect.addEventListener('click', () => changeNodeShape('rect'));
    contextNodeCircle.addEventListener('click', () => changeNodeShape('circle'));
    contextNodeDiamond.addEventListener('click', () => changeNodeShape('diamond'));
    contextNodeHexagon.addEventListener('click', () => changeNodeShape('hexagon'));

    addNodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const result = handleAddNode(
            selectedNode, 
            svg, 
            nodeCounter, 
            currentConnectorShape, 
            updateSelectedNode,
            rightClickX,
            rightClickY
        );

        if (result.success) {
            nodeCounter = result.nodeCounter;
            modalsController.closeModal('addNodeModal');
        }
    });

    confirmRemoveBtn.addEventListener('click', () => {
        const success = handleRemoveNode(
            selectedNode, 
            svg, 
            {disabled: true}, 
            currentConnectorShape
        );

        if (success) {
            updateSelectedNode(null);
            modalsController.closeModal('removeNodeModal');
        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentConnectorShape = handleSettingsChange(
            connectorShapeSelect, 
            currentConnectorShape
        );
        diagramEngine.updateConnectors(currentConnectorShape);
        modalsController.closeModal('settingsModal');
    });

    function applyTransformations() {
        zoomPanGroup.setAttribute('transform', `translate(${currentTranslateX}, ${currentTranslateY}) scale(${currentScale})`);
    }

    function getSvgPoint(clientX, clientY) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const globalPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        return globalPoint;
    }

    svg.addEventListener('wheel', (e) => {
        e.preventDefault();

        const zoomFactor = 0.1;
        const s0 = currentScale;
        let s1 = s0 + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
        s1 = Math.max(s1, 0.1);

        const p = getSvgPoint(e.clientX, e.clientY);

        currentTranslateX = p.x - (p.x - currentTranslateX) * (s1 / s0);
        currentTranslateY = p.y - (p.y - currentTranslateY) * (s1 / s0);
        currentScale = s1;

        applyTransformations();
    });

    let mouseDownTarget = null;

    svg.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            const nodeGroup = e.target.closest('.draggable-group');
            const connectorPath = e.target.closest('path');
            mouseDownTarget = nodeGroup || connectorPath;

            if (!nodeGroup && !connectorPath) {
                isPanning = true;
                panStartX = e.clientX - currentTranslateX;
                panStartY = e.clientY - currentTranslateY;
                e.preventDefault();
            } else if (nodeGroup) {
                eventController.onMouseDown(e, {disabled: true}, currentConnectorShape);
            }
        }
    });

    svg.addEventListener('mousemove', (e) => {
        if (isPanning) {
            currentTranslateX = e.clientX - panStartX;
            currentTranslateY = e.clientY - panStartY;
            applyTransformations();
        }
    });

    svg.addEventListener('mouseup', (e) => {
        if (isPanning) {
            isPanning = false;
        }
        mouseDownTarget = null;
    });

    svg.addEventListener('mouseleave', (e) => {
        if (isPanning) {
            isPanning = false;
        }
        mouseDownTarget = null;
    });

    importBtn.addEventListener('click', () => {
        modalsController.openModal('importModal');
    });

    exportBtn.addEventListener('click', () => {
        const jsonData = diagramEngine.exportDiagramToJSON();
        exportTextarea.value = JSON.stringify(jsonData, null, 2);
        modalsController.openModal('exportModal');
    });

    confirmImportBtn.addEventListener('click', () => {
        const fileReaderTextArea = document.getElementById('import-textarea');
        const jsonString = fileReaderTextArea ? fileReaderTextArea.value : '';
        importDiagramFromJSON(jsonString);
        modalsController.closeModal('importModal');
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const jsonString = event.target.result;
            importDiagramFromJSON(jsonString);
            modalsController.closeModal('importModal');
        };

        reader.onerror = (error) => {
            console.error('File reading error:', error);
            alert('Error reading the file.');
            modalsController.closeModal('importModal');
        };

        if (file) {
            reader.readAsText(file);
        }
    });

    triggerExport.addEventListener('click', () => {
        const jsonData = diagramEngine.exportDiagramToJSON();
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        exportLink.href = url;
        exportLink.download = 'flowchart.json';
        exportLink.click();
        URL.revokeObjectURL(url);
        modalsController.closeModal('exportModal');
    });

    document.addEventListener('connectorAdded', (e) => {
        const connectorEl = e.detail.connector;
        attachConnectorContextMenu(connectorEl);
    });

    importK8sBtn.addEventListener('click', () => {
        modalsController.openModal('importK8sModal');
    });

    confirmImportK8sBtn.addEventListener('click', () => {
        if (!importK8sFile.files[0]) {
            alert("No file selected");
            return;
        }
        const file = importK8sFile.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const k8sJson = JSON.parse(event.target.result);
                const topoData = convertK8sToDiagramData(k8sJson);
                initializeDiagramFromJSON(topoData);
            } catch (err) {
                console.error('Error parsing K8s JSON', err);
                alert('Invalid K8s JSON file');
            }
            modalsController.closeModal('importK8sModal');
        };
        reader.readAsText(file);
    });

    initializeDiagramFromJSON(initialData);
});
