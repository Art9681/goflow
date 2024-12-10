class NodeModel {
  constructor(id, x, y, width, height, label, inputType, outputType, shape) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
    this.inputType = inputType;
    this.outputType = outputType;
    this.shape = shape;
  }
}

export default NodeModel;
