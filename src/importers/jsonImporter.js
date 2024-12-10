import NodeModel from '../models/NodeModel.js';
import ConnectorModel from '../models/ConnectorModel.js';

function convertJsonToDiagramData(json) {
  const nodes = json.nodes.map(node => new NodeModel(
    node.id,
    node.x,
    node.y,
    node.width,
    node.height,
    node.label,
    node.inputType,
    node.outputType,
    node.shape
  ));

  const connectors = json.connectors.map(connector => new ConnectorModel(
    connector.id,
    connector.from,
    connector.to,
    connector.type
  ));

  return { nodes, connectors };
}

export default convertJsonToDiagramData;
