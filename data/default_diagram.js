{
  "nodes": [
    { "id": "A", "x": 150, "y": 100, "width": 100, "height": 50, "label": "Node A", "inputType": "string", "outputType": "int" },
    { "id": "B", "x": 350, "y": 200, "width": 100, "height": 50, "label": "Node B", "inputType": "int", "outputType": "float" },
    { "id": "C", "x": 550, "y": 100, "width": 100, "height": 50, "label": "Node C", "inputType": "float", "outputType": "string" }
  ],
  "connectors": [
    { "id": "connector-A-B", "from": "A", "to": "B", "type": "solid" },
    { "id": "connector-B-C", "from": "B", "to": "C", "type": "dashed" }
  ]
}
