class ConnectorModel {
  constructor(id, fromNode, toNode, type, validations = []) {
    this.id = id;
    this.fromNode = fromNode;
    this.toNode = toNode;
    this.type = type;
    this.validations = validations;
  }

  validate() {
    for (const validation of this.validations) {
      if (!validation(this)) {
        return false;
      }
    }
    return true;
  }
}

export default ConnectorModel;
