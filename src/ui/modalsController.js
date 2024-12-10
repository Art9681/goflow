class ModalsController {
  constructor() {
    this.modals = {
      addNodeModal: document.getElementById('add-node-modal'),
      removeNodeModal: document.getElementById('remove-node-modal'),
      settingsModal: document.getElementById('settings-modal'),
      importModal: document.getElementById('import-modal'),
      importK8sModal: document.getElementById('import-k8s-modal'),
      exportModal: document.getElementById('export-modal')
    };

    this.closeButtons = {
      addNodeClose: document.getElementById('add-node-close'),
      removeNodeClose: document.getElementById('remove-node-close'),
      settingsClose: document.getElementById('settings-close'),
      importClose: document.getElementById('import-close'),
      importK8sClose: document.getElementById('import-k8s-close'),
      exportClose: document.getElementById('export-close')
    };

    this.cancelButtons = {
      addNodeCancel: document.getElementById('add-node-cancel'),
      removeNodeCancel: document.getElementById('remove-node-cancel'),
      settingsCancel: document.getElementById('settings-cancel'),
      importCancel: document.getElementById('import-cancel'),
      importK8sCancel: document.getElementById('import-k8s-cancel'),
      exportCancel: document.getElementById('export-cancel')
    };

    this.setupModalCloseListeners();
    this.setupWindowClickHandler();
  }

  setupModalCloseListeners() {
    Object.keys(this.closeButtons).forEach(key => {
      this.closeButtons[key].onclick = () => {
        this.modals[key.replace('Close', 'Modal')].style.display = 'none';
      };
    });

    Object.keys(this.cancelButtons).forEach(key => {
      this.cancelButtons[key].onclick = () => {
        this.modals[key.replace('Cancel', 'Modal')].style.display = 'none';
      };
    });
  }

  setupWindowClickHandler() {
    window.onclick = (event) => {
      Object.keys(this.modals).forEach(key => {
        if (event.target === this.modals[key]) {
          this.modals[key].style.display = 'none';
        }
      });
    };
  }

  openModal(modalName) {
    this.modals[modalName].style.display = 'block';
  }

  closeModal(modalName) {
    this.modals[modalName].style.display = 'none';
  }
}

export default ModalsController;
