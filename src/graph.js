document.addEventListener('DOMContentLoaded', function() {
    // Graph data structure
    const graph = {
        nodes: [],
        edges: [],
        adjacencyList: {},
        nextNodeId: 1,
        mode: 'add-node', // 'add-node', 'add-edge', 'move-node', 'delete'
        edgeStartNode: null,
        isDirected: false,
        showWeights: false
    };
    
    // DOM elements
    const graphContainer = document.getElementById('graph-container');
    const traversalSteps = document.getElementById('traversal-steps');
    const startNodeSelect = document.getElementById('start-node');
    const endNodeSelect = document.getElementById('end-node');
    const tooltip = document.getElementById('tooltip');
    
    // mode buttons
    document.getElementById('add-node').addEventListener('click', () => setMode('add-node'));
    document.getElementById('add-edge').addEventListener('click', () => setMode('add-edge'));
    document.getElementById('move-node').addEventListener('click', () => setMode('move-node'));
    document.getElementById('delete-mode').addEventListener('click', () => setMode('delete'));
    
    // traversal buttons
    document.getElementById('bfs').addEventListener('click', () => traverseGraph('bfs'));
    document.getElementById('dfs').addEventListener('click', () => traverseGraph('dfs'));
    document.getElementById('reset').addEventListener('click', resetTraversal);
    
    // checkboxes
    document.getElementById('directed-graph').addEventListener('change', function() {
        graph.isDirected = this.checked;
        renderGraph();
    });
    
    document.getElementById('show-weights').addEventListener('change', function() {
        graph.showWeights = this.checked;
        renderGraph();
    });
    
    // graph container events
    graphContainer.addEventListener('click', handleGraphClick);
    graphContainer.addEventListener('mousemove', handleMouseMove);
    
    // sets initial mode
    setMode('add-node');
    
    function setMode(mode) {
        graph.mode = mode;
        graph.edgeStartNode = null;
        
        // updates button styles
        document.querySelectorAll('#add-node, #add-edge, #move-node, #delete-mode').forEach(btn => {
            btn.classList.remove('bg-indigo-800', 'ring-2', 'ring-indigo-300');
            btn.classList.add('bg-indigo-600');
        });
        
        const activeBtn = document.getElementById(mode === 'delete' ? 'delete-mode' : mode);
        if (activeBtn) {
            activeBtn.classList.remove('bg-indigo-600');
            activeBtn.classList.add('bg-indigo-800', 'ring-2', 'ring-indigo-300');
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
            if (graph.mode === 'add-node') {
                addNode(e.offsetX, e.offsetY);
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
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        
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
        
        const option = document.createElement('option');
        option.value = nodeId;
        option.textContent = `Node ${nodeId}`;
        
        const option2 = option.cloneNode(true);
        startNodeSelect.appendChild(option);
        endNodeSelect.appendChild(option2);
        
        renderGraph();
    }
    
    function addEdge(node1, node2, weight = 1) {
        const existingEdge = graph.edges.find(edge => 
            (edge.from === node1.id && edge.to === node2.id) || 
            (!graph.isDirected && edge.from === node2.id && edge.to === node1.id)
        );
        
        if (existingEdge) {
            showTooltip('Edge already exists!', 'red');
            return;
        }
        
        const edge = {
            from: node1.id,
            to: node2.id,
            weight: weight
        };
        
        graph.edges.push(edge);
        graph.adjacencyList[node1.id].push({ node: node2.id, weight });
        
        if (!graph.isDirected) {
            graph.adjacencyList[node2.id].push({ node: node1.id, weight });
        }
        
        renderGraph();
    }
    
    function deleteNode(nodeId) {
        graph.nodes = graph.nodes.filter(node => node.id !== nodeId);
        
        graph.edges = graph.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
        
        delete graph.adjacencyList[nodeId];
        for (const key in graph.adjacencyList) {
            graph.adjacencyList[key] = graph.adjacencyList[key].filter(neighbor => neighbor.node !== nodeId);
        }
        
        const options = startNodeSelect.querySelectorAll(`option[value="${nodeId}"]`);
        options.forEach(option => option.remove());
        
        renderGraph();
    }
    
    function deleteEdge(from, to) {
        graph.edges = graph.edges.filter(edge => !(edge.from === from && edge.to === to));
        
        graph.adjacencyList[from] = graph.adjacencyList[from].filter(neighbor => neighbor.node !== to);
        if (!graph.isDirected) {
            graph.adjacencyList[to] = graph.adjacencyList[to].filter(neighbor => neighbor.node !== from);
        }
        
        renderGraph();
    }
    
    function renderGraph() {
        graphContainer.innerHTML = '';
        
        graph.edges.forEach(edge => {
            const fromNode = graph.nodes.find(n => n.id === edge.from);
            const toNode = graph.nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return;
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const edgeElement = document.createElement('div');
            edgeElement.className = 'edge';
            edgeElement.style.left = `${fromNode.x}px`;
            edgeElement.style.top = `${fromNode.y}px`;
            edgeElement.style.width = `${length}px`;
            edgeElement.style.transform = `rotate(${angle}rad)`;
            
            if (graph.isDirected) {
                const arrow = document.createElement('div');
                arrow.className = 'edge-arrow';
                arrow.style.left = `${toNode.x - 12}px`;
                arrow.style.top = `${toNode.y}px`;
                arrow.style.transform = `rotate(${angle}rad)`;
                graphContainer.appendChild(arrow);
            }
            
            if (graph.showWeights) {
                const weightLabel = document.createElement('div');
                weightLabel.textContent = edge.weight;
                weightLabel.style.position = 'absolute';
                weightLabel.style.left = `${fromNode.x + dx/2 - 10}px`;
                weightLabel.style.top = `${fromNode.y + dy/2 - 10}px`;
                weightLabel.style.backgroundColor = 'white';
                weightLabel.style.padding = '2px 5px';
                weightLabel.style.borderRadius = '4px';
                weightLabel.style.fontSize = '12px';
                weightLabel.style.border = '1px solid #ccc';
                weightLabel.style.zIndex = '5';
                graphContainer.appendChild(weightLabel);
            }
            
            graphContainer.appendChild(edgeElement);
            
            if (graph.mode === 'delete') {
                edgeElement.style.cursor = 'pointer';
                edgeElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteEdge(edge.from, edge.to);
                });
            }
        });
        
        // render nodes
        graph.nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            nodeElement.textContent = node.label;
            nodeElement.style.left = `${node.x - 25}px`;
            nodeElement.style.top = `${node.y - 25}px`;
            nodeElement.style.backgroundColor = '#3b82f6';
            nodeElement.dataset.id = node.id;
            
            if (graph.mode === 'move-node') {
                makeNodeDraggable(nodeElement, node);
            }
            
            nodeElement.addEventListener('mouseenter', () => {
                tooltip.textContent = `Node ${node.id}`;
                tooltip.style.opacity = '1';
            });
            
            nodeElement.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
            
            graphContainer.appendChild(nodeElement);
        });
    }
    
    function handleNodeClickForEdge(node) {
        if (!graph.edgeStartNode) {
            graph.edgeStartNode = node;
            showTooltip(`Selected node ${node.id}. Click another node to connect.`, 'green');
        } else if (graph.edgeStartNode.id === node.id) {
            showTooltip('Cannot connect a node to itself!', 'red');
            graph.edgeStartNode = null;
        } else {
            const weight = prompt('Enter edge weight (default: 1)', '1');
            if (weight !== null) {
                const numWeight = parseInt(weight) || 1;
                addEdge(graph.edgeStartNode, node, numWeight);
            }
            graph.edgeStartNode = null;
        }
    }
    
    function makeNodeDraggable(nodeElement, nodeData) {
        let isDragging = false;
        let offsetX, offsetY;
        
        nodeElement.style.cursor = 'grab';
        
        nodeElement.addEventListener('mousedown', (e) => {
            if (graph.mode !== 'move-node') return;
            
            isDragging = true;
            offsetX = e.clientX - nodeData.x;
            offsetY = e.clientY - nodeData.y;
            nodeElement.style.cursor = 'grabbing';
            e.preventDefault(); 
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || graph.mode !== 'move-node') return;
            
            nodeData.x = e.clientX - offsetX;
            nodeData.y = e.clientY - offsetY;
            
            nodeElement.style.left = `${nodeData.x - 25}px`;
            nodeElement.style.top = `${nodeData.y - 25}px`;
            
            renderGraph();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                nodeElement.style.cursor = 'grab';
            }
        });
    }
    
    function traverseGraph(algorithm) {
        const startNodeId = parseInt(startNodeSelect.value);
        const endNodeId = parseInt(endNodeSelect.value);
        
        if (!startNodeId) {
            showTooltip('Please select a start node!', 'red');
            return;
        }
        
        resetTraversal(false);
        
        if (algorithm === 'bfs') {
            bfs(startNodeId, endNodeId);
        } else if (algorithm === 'dfs') {
            dfs(startNodeId, endNodeId);
        }
    }
    
    function bfs(startNodeId, endNodeId = null) {
        const visited = new Set();
        const queue = [{ node: startNodeId, path: [startNodeId] }];
        const traversalOrder = [];
        let found = false;
        
        addStep(`Starting BFS from node ${startNodeId}...`);
        
        const interval = setInterval(() => {
            if (queue.length === 0 || found) {
                clearInterval(interval);
                
                if (endNodeId && !found) {
                    addStep(`Node ${endNodeId} not reachable from ${startNodeId}.`);
                } else if (!endNodeId) {
                    addStep('BFS completed!');
                }
                return;
            }
            
            const current = queue.shift();
            const currentNode = current.node;
            
            if (visited.has(currentNode)) return;
            
            visited.add(currentNode);
            traversalOrder.push(currentNode);
            
            // visualize visited node
            const nodeElement = document.querySelector(`.node[data-id="${currentNode}"]`);
            if (nodeElement) {
                nodeElement.classList.add('visited');
            }
            
            if (currentNode === endNodeId) {
                addStep(`Found target node ${endNodeId}!`);
                
                // highlighting path
                for (let i = 0; i < current.path.length; i++) {
                    setTimeout(() => {
                        const pathNode = document.querySelector(`.node[data-id="${current.path[i]}"]`);
                        if (pathNode) {
                            pathNode.classList.add('path');
                        }
                        
                        if (i > 0) {
                            // highlight edge between path [i - 1] and path [i]
                            const from = current.path[i-1];
                            const to = current.path[i];
                            const edgeElements = document.querySelectorAll('.edge');
                            edgeElements.forEach(edge => {
                                const fromAttr = parseInt(edge.parentElement?.querySelector('.node')?.dataset.id);
                                const toAttr = parseInt(edge.nextElementSibling?.dataset.id);
                                if ((fromAttr === from && toAttr === to) || (!graph.isDirected && fromAttr === to && toAttr === from)) {
                                    edge.classList.add('path');
                                }
                            });
                        }
                        
                        if (i === current.path.length - 1) {
                            addStep(`Shortest path: ${current.path.join(' → ')}`);
                        }
                    }, i * 500);
                }
                
                found = true;
                return;
            }
            
            addStep(`Visiting node ${currentNode}`);
            
            const neighbors = graph.adjacencyList[currentNode] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.node)) {
                    queue.push({
                        node: neighbor.node,
                        path: [...current.path, neighbor.node]
                    });
                    addStep(`Adding node ${neighbor.node} to queue`, 'ml-4 text-gray-600');
                }
            }
            
        }, 1000);
    }
    
    function dfs(startNodeId, endNodeId = null) {
        const visited = new Set();
        const stack = [{ node: startNodeId, path: [startNodeId] }];
        const traversalOrder = [];
        let found = false;
        
        addStep(`Starting DFS from node ${startNodeId}...`);
        
        const interval = setInterval(() => {
            if (stack.length === 0 || found) {
                clearInterval(interval);
                
                if (endNodeId && !found) {
                    addStep(`Node ${endNodeId} not reachable from ${startNodeId}.`);
                } else if (!endNodeId) {
                    addStep('DFS completed!');
                }
                return;
            }
            
            const current = stack.pop();
            const currentNode = current.node;
            
            if (visited.has(currentNode)) return;
            
            visited.add(currentNode);
            traversalOrder.push(currentNode);
            
            // visualize visited node
            const nodeElement = document.querySelector(`.node[data-id="${currentNode}"]`);
            if (nodeElement) {
                nodeElement.classList.add('visited');
            }
            
            if (currentNode === endNodeId) {
                addStep(`Found target node ${endNodeId}!`);
                
                // highlighting path
                for (let i = 0; i < current.path.length; i++) {
                    setTimeout(() => {
                        const pathNode = document.querySelector(`.node[data-id="${current.path[i]}"]`);
                        if (pathNode) {
                            pathNode.classList.add('path');
                        }
                        
                        if (i > 0) {
                            // highlight edge between path [i - 1] and path [i]
                            const from = current.path[i-1];
                            const to = current.path[i];
                            const edgeElements = document.querySelectorAll('.edge');
                            edgeElements.forEach(edge => {
                                const fromAttr = parseInt(edge.parentElement?.querySelector('.node')?.dataset.id);
                                const toAttr = parseInt(edge.nextElementSibling?.dataset.id);
                                if ((fromAttr === from && toAttr === to) || (!graph.isDirected && fromAttr === to && toAttr === from)) {
                                    edge.classList.add('path');
                                }
                            });
                        }
                        
                        if (i === current.path.length - 1) {
                            addStep(`Path found: ${current.path.join(' → ')}`);
                        }
                    }, i * 500);
                }
                
                found = true;
                return;
            }
            
            addStep(`Visiting node ${currentNode}`);
            
            // push neighbors to stack (in reverse order to visit left-to-right)
            const neighbors = graph.adjacencyList[currentNode] || [];
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighbor = neighbors[i];
                if (!visited.has(neighbor.node)) {
                    stack.push({
                        node: neighbor.node,
                        path: [...current.path, neighbor.node]
                    });
                    addStep(`Adding node ${neighbor.node} to stack`, 'ml-4 text-gray-600');
                }
            }
            
        }, 1000);
    }
    
    function resetTraversal(clearSteps = true) {
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('visited', 'path');
        });
        
        document.querySelectorAll('.edge').forEach(edge => {
            edge.classList.remove('path');
        });
        
        if (clearSteps) {
            traversalSteps.innerHTML = '<p class="text-gray-500 italic">Traversal steps will appear here...</p>';
        }
    }
    
    function addStep(text, className = '') {
        const step = document.createElement('div');
        step.className = `mb-1 ${className}`;
        step.textContent = text;
        
        if (traversalSteps.firstChild?.classList?.contains('italic')) {
            traversalSteps.removeChild(traversalSteps.firstChild);
        }
        
        traversalSteps.appendChild(step);
        traversalSteps.scrollTop = traversalSteps.scrollHeight;
    }
    
    function showTooltip(message, color = 'black') {
        tooltip.textContent = message;
        tooltip.style.color = 'white';
        tooltip.style.backgroundColor = color === 'red' ? '#ef4444' : '#10b981';
        tooltip.style.opacity = '1';
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
        }, 2000);
    }
    
    // some sample nodes
    addNode(150, 150);
    addNode(350, 150);
    addNode(250, 300);
    addNode(450, 300);
    addNode(150, 400);
    
    // some sample edges
    setTimeout(() => {
        const nodes = graph.nodes;
        if (nodes.length >= 5) {
            addEdge(nodes[0], nodes[1]);
            addEdge(nodes[1], nodes[2]);
            addEdge(nodes[1], nodes[3]);
            addEdge(nodes[2], nodes[4]);
            addEdge(nodes[3], nodes[4]);
        }
    }, 100);
});