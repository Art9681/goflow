// flowchart.js
// Main entry point that initializes the diagram, sets up event listeners,
// context menu, and handles adding/removing nodes, changing settings,
// and now importing/exporting diagrams as JSON, and connector style changes.

import { 
    nodes, 
    connectors, 
    updateConnectors, 
    runTests,
    capitalizeFirstLetter,
    exportDiagramToJSON,
    clearDiagram
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

    // Modal Elements
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

    // Import/Export Elements
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');

    const importModal = document.getElementById('import-modal');
    const importClose = document.getElementById('import-close');
    const importCancel = document.getElementById('import-cancel');
    const confirmImportBtn = document.getElementById('confirm-import-btn');

    const exportModal = document.getElementById('export-modal');
    const exportClose = document.getElementById('export-close');
    const exportCancel = document.getElementById('export-cancel');
    const exportTextarea = document.getElementById('export-textarea');

    // Context menu elements
    const contextMenu = document.getElementById('context-menu');
    const contextAddNode = document.getElementById('context-add-node');
    const contextRemoveNode = document.getElementById('context-remove-node');
    const contextConnectorSolid = document.getElementById('context-connector-solid');
    const contextConnectorDashed = document.getElementById('context-connector-dashed');

    const importFile = document.getElementById('import-file');
    const triggerExport = document.getElementById('trigger-export');
    const exportLink = document.getElementById('export-link');

    let nodeCounter = 1; // will increment as we add nodes
    let selectedNode = null; 
    let currentConnectorShape = 'elbow';

    // Track right-click info
    let rightClickX = 0;
    let rightClickY = 0;
    let rightClickedNode = null;
    let selectedConnector = null; // Keep track of selected connector

    function updateSelectedNode(nodeEl) {
        selectedNode = nodeEl;
        selectNode(nodeEl, {disabled: true});
    }

    const initialData = {
        "nodes": [
            { "id": "A", "x": 150, "y": 100, "width": 100, "height": 50, "label": "Node A", "inputType": "string", "outputType": "int" },
            { "id": "B", "x": 350, "y": 200, "width": 100, "height": 50, "label": "Node B", "inputType": "int", "outputType": "float" },
            { "id": "C", "x": 550, "y": 100, "width": 100, "height": 50, "label": "Node C", "inputType": "float", "outputType": "string" }
        ],
        "connectors": [
            { "id": "connector-A-B", "from": "A", "to": "B", "type": "solid" },
            { "id": "connector-B-C", "from": "B", "to": "C", "type": "dashed" }
        ]
    };

    function initializeDiagramFromJSON(data) {
        clearDiagram(svg);

        data.nodes.forEach(n => {
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.setAttribute('class', 'draggable-group');
            nodeGroup.setAttribute('data-node-id', n.id);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'node');
            rect.setAttribute('x', n.x);
            rect.setAttribute('y', n.y);
            rect.setAttribute('width', n.width);
            rect.setAttribute('height', n.height);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'node-text');
            text.setAttribute('x', n.x + n.width / 2);
            text.setAttribute('y', n.y + n.height / 2 + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('alignment-baseline', 'middle');
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

            nodeGroup.appendChild(rect);
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

            // Add right-click event to connectors
            path.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                selectedConnector = connectors.find(conn => conn.el === e.target);
                if (selectedConnector) {
                    // Hide node-specific menu items
                    contextAddNode.style.display = 'none';
                    contextRemoveNode.style.display = 'none';

                    // Show connector style items
                    contextConnectorSolid.style.display = 'block';
                    contextConnectorDashed.style.display = 'block';

                    contextMenu.style.left = `${e.clientX}px`;
                    contextMenu.style.top = `${e.clientY}px`;
                    contextMenu.style.display = 'block';
                }
            });
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

        // If we're on blank space
        if (!nodeGroup && !connectorPath) {
            rightClickedNode = null;
            selectedConnector = null;
            // Show node menu items
            contextAddNode.style.display = 'block';
            contextRemoveNode.style.display = 'none';
            // Hide connector items
            contextConnectorSolid.style.display = 'none';
            contextConnectorDashed.style.display = 'none';
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.display = 'block';
        } else if (nodeGroup) {
            // Right click on node
            rightClickedNode = nodeGroup || null;
            updateSelectedNode(rightClickedNode);
            selectedConnector = null;
            // Show node items
            contextAddNode.style.display = 'block';
            contextRemoveNode.style.display = 'block';
            // Hide connector items
            contextConnectorSolid.style.display = 'none';
            contextConnectorDashed.style.display = 'none';

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

    // Connector context menu actions
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

    // Add node form submission
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

    // Confirm remove node
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

    // Settings form submission
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentConnectorShape = handleSettingsChange(
            connectorShapeSelect, 
            currentConnectorShape
        );
        updateConnectors(currentConnectorShape);
        settingsModal.style.display = 'none';
    });

    // Mousedown to potentially drag nodes
    svg.addEventListener('mousedown', (e) => {
        const nodeGroup = e.target.closest('.draggable-group');
        if (nodeGroup) {
            updateSelectedNode(nodeGroup);
        }
        onMouseDown(e, svg, {disabled: true}, currentConnectorShape);
    });

    // Import/Export button handlers
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

    // Initialize the diagram with initial data
    initializeDiagramFromJSON(initialData);

    // Run tests
    runTests();
});
