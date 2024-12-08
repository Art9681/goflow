# GoFlow: An Interactive Flowchart Editor

GoFlow is a web-based application for creating and manipulating flowcharts. It allows users to add nodes with customizable labels and input/output types, connect nodes with solid or dashed connectors, and save/load their work. The application features a clean, responsive UI with dark/light theme support.

## Features

- **Drag-and-Drop Node Editing**: Easily create, move, and resize nodes within the flowchart.
- **Connectors**: Connect nodes using customizable solid or dashed lines. Connector shapes (straight, elbow, curved) are configurable.
- **Node Customization**: Each node can have a unique label and specify input and output data types.
- **Context Menu**: Right-click on the flowchart to add new nodes or remove selected nodes.
- **Modals**: User-friendly modals for adding nodes, removing nodes, and configuring settings.
- **Import/Export**: Import and export flowchart data as JSON for easy sharing and persistence.
- **Theme Support**: Switch between light and dark themes to match your preference. The theme is persisted using local storage.
- **Unit Tests**: Basic unit tests are included to verify core functionality.

## Technologies Used

- **HTML**: Structure and layout of the application.
- **CSS**: Styling and theming of the application.
- **JavaScript (ES Modules)**: Handles all interactive elements, drag-and-drop functionality, modal interactions, and data management.
- **SVG**: Used for rendering the flowchart elements.

## Setup and Running

1. Clone the repository: `git clone <repository_url>`
2. Navigate to the directory: `cd goflow`
3. Open `index.html` in your web browser. The application should run directly from your browser. No server-side components are required.

## Project Structure
```
goflow/
├── css/
│   └── styles.css
├── data/
│   └── default_diagram.js
├── index.html
├── js/
│   ├── flowchart-drag-handlers.js
│   ├── flowchart-event-handlers.js
│   ├── flowchart-modal-handlers.js
│   ├── flowchart-utils.js
│   ├── flowchart.js
│   └── theme.js
```

`css/styles.css`: Contains all CSS styles for the application, including light and dark themes.

`data/default_diagram.js`: Defines the initial state of the flowchart (optional).

`index.html`: Main HTML file of the application.

`js/`: Contains all JavaScript modules:

`flowchart-drag-handlers.js`: Handles drag-and-drop interactions for nodes and connectors.

`flowchart-event-handlers.js`: Handles event listeners for modals and other UI elements.

`flowchart-modal-handlers.js`: Handles adding and removing nodes via modals.

`flowchart-utils.js`: Provides utility functions for managing nodes, connectors, and SVG path generation.

`flowchart.js`: Main application logic, initializes the diagram and sets up event listeners.

`theme.js`: Handles theme switching.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request. Before submitting a pull request, please ensure your code is well-formatted and adheres to the existing coding style.

## License

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.