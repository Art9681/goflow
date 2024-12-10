import NodeModel from '../models/NodeModel.js';
import ConnectorModel from '../models/ConnectorModel.js';

function convertK8sToDiagramData(k8sJson) {
  const items = k8sJson.items || [];
  const services = items.filter(i => i.kind === 'Service');
  const deployments = items.filter(i => i.kind === 'Deployment');
  const pods = items.filter(i => i.kind === 'Pod');

  let nodeIdCounter = 1;
  const nodes = [];
  const connectors = [];

  function createNode(id, x, y, label, shape, inputType='none', outputType='none') {
    return new NodeModel(id, x, y, 100, 50, label, inputType, outputType, shape);
  }

  let sx = 100;
  let dx = 100;
  let px = 100;
  const xIncrement = 200;

  const serviceNodes = {};
  for (const svc of services) {
    const id = `S${nodeIdCounter++}`;
    const label = svc.metadata.name;
    serviceNodes[svc.metadata.name] = id;
    nodes.push(createNode(id, sx, 100, label, 'circle'));
    sx += xIncrement;
  }

  const deploymentNodes = {};
  for (const dep of deployments) {
    const id = `D${nodeIdCounter++}`;
    const label = dep.metadata.name;
    deploymentNodes[dep.metadata.name] = {
      id,
      matchLabels: dep.spec.selector?.matchLabels || {}
    };
    nodes.push(createNode(id, dx, 300, label, 'diamond'));
    dx += xIncrement;
  }

  const podNodes = {};
  for (const pod of pods) {
    const id = `P${nodeIdCounter++}`;
    const label = pod.metadata.name;
    podNodes[pod.metadata.name] = {
      id,
      labels: pod.metadata.labels || {}
    };
    nodes.push(createNode(id, px, 500, label, 'rect'));
    px += xIncrement;
  }

  function labelsMatch(selector, labels) {
    for (const [k,v] of Object.entries(selector)) {
      if (labels[k] !== v) return false;
    }
    return true;
  }

  for (const svc of services) {
    const svcNodeId = serviceNodes[svc.metadata.name];
    const svcSelector = svc.spec.selector || {};
    for (const [podName, pObj] of Object.entries(podNodes)) {
      if (labelsMatch(svcSelector, pObj.labels)) {
        const connId = `connector-${svcNodeId}-${pObj.id}`;
        connectors.push(new ConnectorModel(connId, svcNodeId, pObj.id, 'solid'));
      }
    }
  }

  for (const dep of deployments) {
    const depNodeId = deploymentNodes[dep.metadata.name].id;
    const depSelector = deploymentNodes[dep.metadata.name].matchLabels;
    for (const [podName, pObj] of Object.entries(podNodes)) {
      if (labelsMatch(depSelector, pObj.labels)) {
        const connId = `connector-${depNodeId}-${pObj.id}`;
        connectors.push(new ConnectorModel(connId, depNodeId, pObj.id, 'dashed'));
      }
    }
  }

  return { nodes, connectors };
}

export default convertK8sToDiagramData;
