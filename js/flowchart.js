// flowchart.js

import { 
    nodes, 
    connectors, 
    updateConnectors, 
    runTests,
    capitalizeFirstLetter,
    exportDiagramToJSON,
    clearDiagram,
    createNodeShape
} from './flowchart-utils.js';

import { 
    selectNode, 
    onMouseDown 
} from './flowchart-drag-handlers.js';

import {
    handleAddNode,
    handleRemoveNode,
    handleSettingsChange
} from './flowchart-modal-handlers.js';

import {
    setupModalCloseListeners,
    setupWindowClickHandler,
    setupSettingsButtonListener,
    initializeConnectionPoints
} from './flowchart-event-handlers.js';

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('flowchart');
    const connectorsLayer = document.getElementById('connectors-layer');
    const nodesLayer = document.getElementById('nodes-layer');
    const settingsBtn = document.getElementById('settings-btn');

    const addNodeModal = document.getElementById('add-node-modal');
    const addNodeClose = document.getElementById('add-node-close');
    const addNodeCancel = document.getElementById('add-node-cancel');
    const addNodeForm = document.getElementById('add-node-form');

    const removeNodeModal = document.getElementById('remove-node-modal');
    const removeNodeClose = document.getElementById('remove-node-close');
    const removeNodeCancel = document.getElementById('remove-node-cancel');
    const confirmRemoveBtn = document.getElementById('confirm-remove-btn');

    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    const settingsCancel = document.getElementById('settings-cancel');
    const settingsForm = document.getElementById('settings-form');
    const connectorShapeSelect = document.getElementById('connector-shape');

    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');

    // NEW: K8s Import elements
    const importK8sBtn = document.getElementById('import-k8s-btn');
    const importK8sModal = document.getElementById('import-k8s-modal');
    const importK8sClose = document.getElementById('import-k8s-close');
    const importK8sCancel = document.getElementById('import-k8s-cancel');
    const importK8sFile = document.getElementById('import-k8s-file');
    const confirmImportK8sBtn = document.getElementById('confirm-import-k8s-btn');

    const importModal = document.getElementById('import-modal');
    const importClose = document.getElementById('import-close');
    const importCancel = document.getElementById('import-cancel');
    const confirmImportBtn = document.getElementById('confirm-import-btn');

    const exportModal = document.getElementById('export-modal');
    const exportClose = document.getElementById('export-close');
    const exportCancel = document.getElementById('export-cancel');
    const exportTextarea = document.getElementById('export-textarea');

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

    const importFile = document.getElementById('import-file');
    const triggerExport = document.getElementById('trigger-export');
    const exportLink = document.getElementById('export-link');

    let nodeCounter = 1; 
    let selectedNode = null; 
    let currentConnectorShape = 'elbow';

    let rightClickX = 0;
    let rightClickY = 0;
    let rightClickedNode = null;
    let selectedConnector = null; 

    function updateSelectedNode(nodeEl) {
        selectedNode = nodeEl;
        selectNode(nodeEl, {disabled: true});
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
            selectedConnector = connectors.find(conn => conn.el === e.target);
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
        clearDiagram(svg);

        data.nodes.forEach(n => {
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.setAttribute('class', 'draggable-group');
            nodeGroup.setAttribute('data-node-id', n.id);
            nodeGroup.setAttribute('data-node-shape', n.shape);
            nodeGroup.dataset.x = n.x;
            nodeGroup.dataset.y = n.y;
            nodeGroup.dataset.width = n.width;
            nodeGroup.dataset.height = n.height;

            const shapeEl = createNodeShape(n.x, n.y, n.width, n.height, n.shape);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'node-text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('alignment-baseline', 'middle');
            text.setAttribute('x', n.x + n.width / 2);
            text.setAttribute('y', n.y + n.height / 2 + 5);
            text.textContent = n.label;

            const inputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            inputPoint.setAttribute('class', 'connection-point input');
            inputPoint.setAttribute('cx', n.x);
            inputPoint.setAttribute('cy', n.y + n.height/2);
            inputPoint.setAttribute('r', '5');

            const outputPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outputPoint.setAttribute('class', 'connection-point output');
            outputPoint.setAttribute('cx', n.x + n.width);
            outputPoint.setAttribute('cy', n.y + n.height/2);
            outputPoint.setAttribute('r', '5');

            const inputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            inputLabel.setAttribute('class', 'type-label');
            inputLabel.setAttribute('x', n.x);
            inputLabel.setAttribute('y', n.y + n.height/2 - 10);
            inputLabel.setAttribute('text-anchor', 'middle');
            inputLabel.textContent = capitalizeFirstLetter(n.inputType);

            const outputLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            outputLabel.setAttribute('class', 'type-label');
            outputLabel.setAttribute('x', n.x + n.width);
            outputLabel.setAttribute('y', n.y + n.height/2 - 10);
            outputLabel.setAttribute('text-anchor', 'middle');
            outputLabel.textContent = capitalizeFirstLetter(n.outputType);

            nodeGroup.appendChild(shapeEl);
            nodeGroup.appendChild(text);
            nodeGroup.appendChild(inputPoint);
            nodeGroup.appendChild(outputPoint);
            nodeGroup.appendChild(inputLabel);
            nodeGroup.appendChild(outputLabel);

            nodesLayer.appendChild(nodeGroup);
            nodes.push({ id: n.id, el: nodeGroup });

            const numericPart = parseInt(n.id.replace(/\D+/g,''), 10);
            if (!isNaN(numericPart) && numericPart >= nodeCounter) {
                nodeCounter = numericPart + 1;
            }
        });

        data.connectors.forEach(c => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('id', c.id);
            path.setAttribute('class', c.type === 'solid' ? 'connector-solid' : 'connector-dashed');
            connectorsLayer.appendChild(path);

            connectors.push({
                id: c.id,
                from: c.from,
                to: c.to,
                el: path,
                type: c.type
            });

            // Attach the context menu event to this connector
            attachConnectorContextMenu(path);
        });

        updateConnectors(currentConnectorShape);
        initializeConnectionPoints(nodes);
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

    // NEW: Function to parse K8s JSON and create topology data
    function createTopologyFromK8sResources(k8sJson) {
        // k8sJson is expected to be output from `kubectl get services,deployments,pods -o json`
        // Structure: items: [ {kind: Service/Deployment/Pod, metadata:{}, spec:{}}, ... ]

        const items = k8sJson.items || [];
        const services = items.filter(i => i.kind === 'Service');
        const deployments = items.filter(i => i.kind === 'Deployment');
        const pods = items.filter(i => i.kind === 'Pod');

        // Create a mapping of pods by their labels for quick lookup
        // Actually we just need to find pods matching selectors
        // We'll create arrays of nodes first
        let nodeIdCounter = 1;
        const nodeData = [];
        const connectorData = [];

        // Helper: create node
        function createNode(id, x, y, label, shape, inputType='none', outputType='none') {
            return {
                id,
                x, y, width:100, height:50, label, inputType, outputType, shape
            };
        }

        // We'll do a simple layout: Services at top row, Deployments at middle row, Pods at bottom row
        // Just to differentiate them visually in the demo.
        // x spacing: 200px apart
        // services start at (100,100)
        // deployments start at (100,300)
        // pods start at (100,500)
        
        let sx = 100;
        let dx = 100;
        let px = 100;
        const xIncrement = 200;

        // Create service nodes
        const serviceNodes = {};
        for (const svc of services) {
            const id = `S${nodeIdCounter++}`;
            const label = svc.metadata.name;
            serviceNodes[svc.metadata.name] = id;
            nodeData.push(createNode(id, sx, 100, label, 'circle')); // circle replaced by pill
            sx += xIncrement;
        }

        // Create deployment nodes
        const deploymentNodes = {};
        for (const dep of deployments) {
            const id = `D${nodeIdCounter++}`;
            const label = dep.metadata.name;
            deploymentNodes[dep.metadata.name] = {
                id,
                matchLabels: dep.spec.selector?.matchLabels || {}
            };
            nodeData.push(createNode(id, dx, 300, label, 'diamond'));
            dx += xIncrement;
        }

        // Create pod nodes
        const podNodes = {};
        for (const pod of pods) {
            const id = `P${nodeIdCounter++}`;
            const label = pod.metadata.name;
            podNodes[pod.metadata.name] = {
                id,
                labels: pod.metadata.labels || {}
            };
            nodeData.push(createNode(id, px, 500, label, 'rect'));
            px += xIncrement;
        }

        // Now create connectors:
        // 1. Services → Pods (match svc.spec.selector with pod.metadata.labels)
        for (const svc of services) {
            const svcNodeId = serviceNodes[svc.metadata.name];
            const svcSelector = svc.spec.selector || {};
            // Find pods that match this selector
            for (const [podName, pObj] of Object.entries(podNodes)) {
                if (labelsMatch(svcSelector, pObj.labels)) {
                    const connId = `connector-${svcNodeId}-${pObj.id}`;
                    connectorData.push({
                        id: connId,
                        from: svcNodeId,
                        to: pObj.id,
                        type: 'solid'
                    });
                }
            }
        }

        // 2. Deployments → Pods (match dep.spec.selector.matchLabels with pod.metadata.labels)
        for (const dep of deployments) {
            const depNodeId = deploymentNodes[dep.metadata.name].id;
            const depSelector = deploymentNodes[dep.metadata.name].matchLabels;
            for (const [podName, pObj] of Object.entries(podNodes)) {
                if (labelsMatch(depSelector, pObj.labels)) {
                    const connId = `connector-${depNodeId}-${pObj.id}`;
                    connectorData.push({
                        id: connId,
                        from: depNodeId,
                        to: pObj.id,
                        type: 'dashed'
                    });
                }
            }
        }

        // Utility function to check if all selector keys match in labels
        function labelsMatch(selector, labels) {
            for (const [k,v] of Object.entries(selector)) {
                if (labels[k] !== v) return false;
            }
            return true;
        }

        return { nodes: nodeData, connectors: connectorData };
    }

    setupModalCloseListeners(
        addNodeModal, 
        addNodeClose, 
        addNodeCancel,
        removeNodeModal, 
        removeNodeClose, 
        removeNodeCancel,
        settingsModal, 
        settingsClose, 
        settingsCancel,
        importModal,
        importClose,
        importCancel,
        exportModal,
        exportClose,
        exportCancel
    );

    setupWindowClickHandler(
        addNodeModal, 
        removeNodeModal, 
        settingsModal,
        importModal,
        exportModal
    );

    setupSettingsButtonListener(settingsBtn, settingsModal);

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
        addNodeModal.style.display = 'block';
        addNodeForm.reset();
    });

    contextRemoveNode.addEventListener('click', () => {
        if (!selectedNode) {
            alert('Please select a node to remove.');
            return;
        }
        removeNodeModal.style.display = 'block';
    });

    contextConnectorSolid.addEventListener('click', () => {
        if (selectedConnector) {
            selectedConnector.type = 'solid';
            selectedConnector.el.setAttribute('class', 'connector-solid');
            updateConnectors(currentConnectorShape);
        }
    });

    contextConnectorDashed.addEventListener('click', () => {
        if (selectedConnector) {
            selectedConnector.type = 'dashed';
            selectedConnector.el.setAttribute('class', 'connector-dashed');
            updateConnectors(currentConnectorShape);
        }
    });

    function changeNodeShape(shape) {
        if (!rightClickedNode) return;
        const nodeData = nodes.find(n => n.el === rightClickedNode);
        if (!nodeData) return;

        const oldShapeEl = rightClickedNode.querySelector('.node');
        if (oldShapeEl) {
            rightClickedNode.removeChild(oldShapeEl);
        }

        const width = parseFloat(rightClickedNode.dataset.width);
        const height = parseFloat(rightClickedNode.dataset.height);
        const x = parseFloat(rightClickedNode.dataset.x);
        const y = parseFloat(rightClickedNode.dataset.y);

        const newShapeEl = createNodeShape(x, y, width, height, shape);
        rightClickedNode.insertBefore(newShapeEl, rightClickedNode.firstChild);
        rightClickedNode.setAttribute('data-node-shape', shape);

        updateConnectors(currentConnectorShape);
    }

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
            addNodeModal.style.display = 'none';
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
            removeNodeModal.style.display = 'none';
        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentConnectorShape = handleSettingsChange(
            connectorShapeSelect, 
            currentConnectorShape
        );
        updateConnectors(currentConnectorShape);
        settingsModal.style.display = 'none';
    });

    svg.addEventListener('mousedown', (e) => {
        const nodeGroup = e.target.closest('.draggable-group');
        if (nodeGroup) {
            updateSelectedNode(nodeGroup);
        }
        onMouseDown(e, svg, {disabled: true}, currentConnectorShape);
    });

    importBtn.addEventListener('click', () => {
        importModal.style.display = 'block';
    });

    exportBtn.addEventListener('click', () => {
        const jsonData = exportDiagramToJSON();
        exportTextarea.value = JSON.stringify(jsonData, null, 2);
        exportModal.style.display = 'block';
    });

    confirmImportBtn.addEventListener('click', () => {
        const fileReaderTextArea = document.getElementById('import-textarea');
        const jsonString = fileReaderTextArea ? fileReaderTextArea.value : '';
        importDiagramFromJSON(jsonString);
        importModal.style.display = 'none';
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const jsonString = event.target.result;
            importDiagramFromJSON(jsonString);
            importModal.style.display = 'none';
        };

        reader.onerror = (error) => {
            console.error('File reading error:', error);
            alert('Error reading the file.');
            importModal.style.display = 'none';
        };

        if (file) {
            reader.readAsText(file);
        }
    });

    triggerExport.addEventListener('click', () => {
        const jsonData = exportDiagramToJSON();
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        exportLink.href = url;
        exportLink.download = 'flowchart.json';
        exportLink.click();
        URL.revokeObjectURL(url);
        exportModal.style.display = 'none';
    });

    // Listen for newly created connectors
    document.addEventListener('connectorAdded', (e) => {
        const connectorEl = e.detail.connector;
        attachConnectorContextMenu(connectorEl);
    });

    // NEW: Setup Import K8s workflow
    importK8sBtn.addEventListener('click', () => {
        importK8sModal.style.display = 'block';
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
                const topoData = createTopologyFromK8sResources(k8sJson);
                initializeDiagramFromJSON(topoData);
            } catch (err) {
                console.error('Error parsing K8s JSON', err);
                alert('Invalid K8s JSON file');
            }
            importK8sModal.style.display = 'none';
        };
        reader.readAsText(file);
    });

    importK8sClose.onclick = () => {
        importK8sModal.style.display = 'none';
    };
    importK8sCancel.onclick = () => {
        importK8sModal.style.display = 'none';
    };

    initializeDiagramFromJSON(initialData);
    runTests();
});