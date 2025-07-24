document.addEventListener('DOMContentLoaded', function() {
    
    // Graph data structure
    const graph = {
        nodes: [],
        edges: [],
        adjacencyList: {},
        nextNodeId: 1,
        mode: 'addNode', // 'addEdge', 'remove', 'move-node', 'delete'
        edgeStartNode: null,
        isDirected: false,
        showWeights: false,
    };

    // DOM elements
    const graphContainer = document.getElementById('graph-container');
    const traversalSteps = document.getElementById('traversal-steps');
    const startNodeSelect = document.getElementById('start-node');
    const endNodeSelect = document.getElementById('end-node');
    const tooltip = document.getElementById('tooltip');

    // Mode buttons
    document.getElementById('add-node').addEventListener('click', () => setMode('add-node'));
    document.getElementById('add-edge').addEventListener('click', () => setMode('add-edge'));
    document.getElementById('move-node').addEventListener('click', () => setMode('move-node'));
    document.getElementById('delete-mode').addEventListener('click', () => setMode('delete-mode'));

    // Traversal buttons
    document.getElementById('bfs').addEventListener('click', () => traverseGraph('bfs'));
    document.getElementById('dfs').addEventListener('click', () => traverseGraph('dfs'));
    document.getElementById('reset').addEventListener('click', resetTraversal);

    // Checkboxes
    document.getElementById('directed-graph').addEventListener('change', function() {
        graph.isDirected = this.checked;
        renderGraph();
    });

    document.getElementById('show-weights').addEventListener('change', function() {
        graph.showWeights = this.checked;
        renderGraph();
    });

    // Graph container events
    graphContainer.addEventListener('click', handleGraphClick);
    graphContainer.addEventListener('mousemove', handleMouseMove);

    setMode('add-node');

    function setMode(mode) {
        graph.mode = mode;
        graph.edgeStarNode = null;

        // updating button styles
        document.querySelectorAll('#add-node, #add-edge, #move-node, #delete-mode').forEach(btn => {
            btn.classList.remove('bg-indigo-800', 'ring-2', 'ring-indigo-300');
            btn.classList.add('bg-indigo-600');
        });

        const activeButton = document.getElementById(mode === 'delete' ? 'delete-mode' : mode);
        if (activeButton) {
            activeButton.classList.remove('bg-indigo-600');
            activeButton.classList.add('bg-indigo-800', 'ring-2', 'ring-indigo-300');
        }

        updateCursor();
    }

    function updateCursor() {
        switch(graph.mode) {
            case 'add-node':
                graphContainer.style.cursor = 'crosshair';
                break;
            case 'add-edge':
                graphContainer.style.cursor = 'pointer';
                break;
            case 'move-node':
                graphContainer.style.cursor = 'grab';
                break;
            case 'delete':
                graphContainer.style.cursor = 'not-allowed';
                break;
            default:
                graphContainer.style.cursor = 'default';
        }
    }

    function handleGraphClick(e) {
        if (e.target === graphContainer) {
            // click on empty space
            if (graph.mode === 'add-node') {
                addNode(e.clientX, e.clientY);
            }
            graph.edgeStartNode = null;
        } else if (e.target.classList.contains('node')) {
            const nodeId = parseInt(e.target.dataset.id);
            const node = graph.nodes.find(n => n.id === nodeId);

            if (graph.mode === 'add-edge') {
                handleNodeClickForEdge(node);
            } else if (graph.mode === 'delete') {
                deleteNode(nodeId);
            }
        }
    }

    function handleMouseMove(e) {
        // Update tooltip position
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;

        // hide tooltip if not over node
        if (!e.target.classList.contains('node')) {
            tooltip.style.opacity = '0';
        }
    }

    function addNode(x, y) {
        const nodeId = graph.nextNodeId++;
        const node = {
            id: nodeId,
            x: x,
            y: y,
            label: nodeId
        };

        graph.nodes.push(node);
        graph.adjacencyList[nodeId] = [];

        // add to dropdowns
        const option = document.createElement('option');
        option.value = nodeId;
        option.textContent = `Node ${nodeId}`;

        const option2 = option.cloneNode(true);
        startNodeSelect.appendChild(option);
        endNodeSelect.appendChild(option2);

        renderGraph();
    }

    // Sample nodes
    addNode(150, 150);
});