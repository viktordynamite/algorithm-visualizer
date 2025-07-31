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

    function addEdge(node1, node2, weight = 1) {  
        const existingEdge = graph.edges.find ( edge => 
            (edge.from === node1.id && edge.to === node2.id) ||
            (!graph.isDirected && edge.from === node2.id && edge.to === node1.id)
        );

        if (existingEdge) {
            showToolTip('Edge already exists!', 'red');
            return;
        }

        const edge = {
            from: node1.id,
            to: node2.id,
            weight: weight
        };

        graph.edges.push(edge);
        graph.adjacencyList[node1.id].push({ node: node2.id, weoght });
        
        if (!graph.isDirected) {
            graph.adjacencyList[node2.id].push({ node: node1.id, weight });
        }

        renderGraph();
    }

    function deleteNode(nodeId) {
        // remove node
        graph.nodes = graph.nodes.filter(node => node.id !== nodeId);
        
        // removes connected edges to node
        graph.edges = graph.edges.filter(edges => edge.from !== nodeId && edge.to !== nodeId);

        // updating adjacency list
        delete graph.adjacencyList[nodeId];
        for (const key in graph.adjacencyList) {
            graph.adjacencyList[key] = graph.adjacencyList[key].filter(neighbor => neighbor.node !== nodeId);
        }

        // remove from dropdowns
        const options = startNodeSelect.querySelectorAll('option[value="${nodeId}"]');
        options.forEach(option => option.remove());

        renderGraph();
    }

    function deleteEdge(from, to) {
        graph.edges = graph.edges.filter(edge => !(edge.from === from && edge.to === to));

        graph.adjacencyList[from] = graph.adjacencyList[from].filter(neighbor => neighbor.node !== to)
        if (!graph.isDirected) {
            graph.adjacencyList[to] = graph.adjacencyList[to].filter(neighbor => neighbor.node !== from);
        }

        renderGraph();
    }

    function renderGraph() {
        graphContainer.innerHTML = '';
        
        graph.edges.forEach(edge => {
            const fromNode = graph.nodes.find(n => n.id === edge.from);
            const toNode = graaph.nodes.find(n => n.id === edge.to);

            if (!fromNode || !toNode) return;

            // Calc edge position and angle
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // create egde line 
            const edgeElement = document.createElement('div');
            edgeElement.className = 'edge';
            edgeElement.style.left = '${fromNode.x}px';
            edgeElement.style.right = '${fromNode.y}px';
            edgeElement.style.width = '${length}px';
            egdeElement.style.transform = 'rotate(${angle}rad)';

            // Create arrow for directed graph
            if (graph.isDirected) {
                const arrow = document.createElement('div');
                arrow.className = 'edge-arrow';
                arrow.style.left = '${toNode.x - 12}px';
                arrow.style.top = '${toNode.y}px';
                arrow.style.transform = 'rotate(${angle}rad)';
                graphContainer.appendChild(arrow);
            }

            }
            
            // add weight if label is enabled
            if (graph.showWeights) {
                const weightLabel = document.createElement('div');
                weightLabel.textContent = edge.weight;
                weightLabel.style.position = 'absolute';
                weightLabel.style.left = '${fromNode.x + dx/2 - 10}px';
                weightLabel.style.top = '${fromNode.y + dy/2 - 10}px';
                weightLabel.style.backgroundColor = 'white';
                weightLabel.style.padding = '2px 5px';
                weightLabel.style.norderRadius = '4px';
                weightLabel.style.fontSize = '12px';
                weightLabel.style.border = '1px solid #ccc';
                weightLabel.style.zIndex = '5';
                graphContainer.appendChild(weightLabel);
            }      

            graphContainer.appendChild(edgeElement);
        )
    }

    // Sample nodes
    addNode(150, 150);
});
