document.addEventListener('DOMContentLoaded', () => {
    // Grid configuration
    const ROWS = 20;
    const COLS = 40;
    const START_NODE_ROW = 10;
    const START_NODE_COL = 5;
    const END_NODE_ROW = 10;
    const END_NODE_COL = 35;
    
    // State variables
    let grid = [];
    let startNode = null;
    let endNode = null;
    let isMouseDown = false;
    let isDrawingWalls = false;
    let isMovingStart = false;
    let isMovingEnd = false;
    let animationSpeed = 50;
    let algorithm = 'astar';
    let heuristic = 'manhattan';
    let weight = 5;
    
    // DOM elements
    const gridElement = document.getElementById('grid');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const speedSelect = document.getElementById('speed-select');
    const algorithmSelect = document.getElementById('algorithm-select');
    const heuristicSelect = document.getElementById('heuristic-select');
    const weightSlider = document.getElementById('weight-slider');
    const clearWallsBtn = document.getElementById('clear-walls-btn');
    const mazeBtn = document.getElementById('maze-btn');
    const statsElement = document.getElementById('stats');
    
    // Initialize the grid
    function initializeGrid() {
        grid = [];
        gridElement.innerHTML = '';
        
        for (let row = 0; row < ROWS; row++) {
            const currentRow = [];
            const rowElement = document.createElement('div');
            rowElement.className = 'flex';
            
            for (let col = 0; col < COLS; col++) {
                const node = {
                    row,
                    col,
                    isStart: row === START_NODE_ROW && col === START_NODE_COL,
                    isEnd: row === END_NODE_ROW && col === END_NODE_COL,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    distance: Infinity,
                    previousNode: null,
                    weight: 1,
                    fScore: Infinity,
                    gScore: Infinity,
                    hScore: Infinity
                };
                
                currentRow.push(node);
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (node.isStart) {
                    cell.classList.add('start');
                    startNode = node;
                } else if (node.isEnd) {
                    cell.classList.add('end');
                    endNode = node;
                }
                
                // Event listeners
                cell.addEventListener('mousedown', () => handleMouseDown(row, col));
                cell.addEventListener('mouseenter', () => handleMouseEnter(row, col));
                cell.addEventListener('mouseup', () => handleMouseUp());
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
                
                rowElement.appendChild(cell);
            }
            
            grid.push(currentRow);
            gridElement.appendChild(rowElement);
        }
    }
    
    // Event handlers
    function handleMouseDown(row, col) {
        isMouseDown = true;
        const node = grid[row][col];
        
        if (node.isStart) {
            isMovingStart = true;
            return;
        }
        
        if (node.isEnd) {
            isMovingEnd = true;
            return;
        }
        
        isDrawingWalls = true;
        toggleWall(row, col);
    }
    
    function handleMouseEnter(row, col) {
        if (!isMouseDown) return;
        
        const node = grid[row][col];
        
        if (isMovingStart) {
            moveStartNode(row, col);
            return;
        }
        
        if (isMovingEnd) {
            moveEndNode(row, col);
            return;
        }
        
        if (isDrawingWalls) {
            toggleWall(row, col);
        }
    }
    
    function handleMouseUp() {
        isMouseDown = false;
        isDrawingWalls = false;
        isMovingStart = false;
        isMovingEnd = false;
    }
    
    function handleRightClick(row, col) {
        const node = grid[row][col];
        if (node.isStart || node.isEnd || node.isWall) return;
        
        node.weight = weight;
        const cell = getCellElement(row, col);
        cell.style.backgroundColor = '#d8b4fe';
        
        const weightText = document.createElement('div');
        weightText.className = 'cell-weight';
        weightText.textContent = weight;
        cell.appendChild(weightText);
    }
    
    // Grid manipulation
    function toggleWall(row, col) {
        const node = grid[row][col];
        if (node.isStart || node.isEnd) return;
        
        node.isWall = !node.isWall;
        const cell = getCellElement(row, col);
        cell.classList.toggle('wall');
        
        // Clear weight if adding wall
        if (node.isWall && node.weight > 1) {
            node.weight = 1;
            const weightElement = cell.querySelector('.cell-weight');
            if (weightElement) weightElement.remove();
        }
    }
    
    function moveStartNode(row, col) {
        const node = grid[row][col];
        if (node.isEnd || node.isWall) return;
        
        // Clear old start node
        const oldStartCell = getCellElement(startNode.row, startNode.col);
        oldStartCell.classList.remove('start');
        startNode.isStart = false;
        
        // Set new start node
        node.isStart = true;
        startNode = node;
        const newStartCell = getCellElement(row, col);
        newStartCell.classList.add('start');
        
        // Clear any weight
        node.weight = 1;
        const weightElement = newStartCell.querySelector('.cell-weight');
        if (weightElement) weightElement.remove();
    }
    
    function moveEndNode(row, col) {
        const node = grid[row][col];
        if (node.isStart || node.isWall) return;
        
        // Clear old end node
        const oldEndCell = getCellElement(endNode.row, endNode.col);
        oldEndCell.classList.remove('end');
        endNode.isEnd = false;
        
        // Set new end node
        node.isEnd = true;
        endNode = node;
        const newEndCell = getCellElement(row, col);
        newEndCell.classList.add('end');
        
        // Clear any weight
        node.weight = 1;
        const weightElement = newEndCell.querySelector('.cell-weight');
        if (weightElement) weightElement.remove();
    }
    
    function clearWalls() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                if (node.isWall) {
                    node.isWall = false;
                    const cell = getCellElement(row, col);
                    cell.classList.remove('wall');
                }
            }
        }
    }
    
    function clearPath() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.isVisited = false;
                node.isPath = false;
                node.distance = Infinity;
                node.previousNode = null;
                node.fScore = Infinity;
                node.gScore = Infinity;
                node.hScore = Infinity;
                
                const cell = getCellElement(row, col);
                cell.classList.remove('visited', 'path');
            }
        }
        
        // Reset start and end nodes
        const startCell = getCellElement(startNode.row, startNode.col);
        startCell.classList.add('start');
        
        const endCell = getCellElement(endNode.row, endNode.col);
        endCell.classList.add('end');
    }
    
    function resetGrid() {
        clearPath();
        clearWalls();
        
        // clear weights
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.weight = 1;
                const cell = getCellElement(row, col);
                const weightElement = cell.querySelector('.cell-weight');
                if (weightElement) weightElement.remove();
            }
        }
    }
    
    function generateMaze() {
        resetGrid();
        
        // simple maze generation using recursive division
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                // Skip start and end nodes
                if ((row === startNode.row && col === startNode.col) || 
                    (row === endNode.row && col === endNode.col)) {
                    continue;
                }
                
                // Add walls with probability
                if (Math.random() < 0.25) {
                    grid[row][col].isWall = true;
                    getCellElement(row, col).classList.add('wall');
                }
            }
        }
    }
    
    // Help functions
    function getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    function getAllNeighbors(node) {
        const neighbors = [];
        const {row, col} = node;
        
        // all 4 directional neighbors
        if (row > 0) neighbors.push(grid[row - 1][col]);
        if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
        if (col > 0) neighbors.push(grid[row][col - 1]);
        if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
        
        return neighbors.filter(neighbor => !neighbor.isWall);
    }
    
    function getWeightedNeighbors(node) {
        const neighbors = getAllNeighbors(node);
        
        // Diagonal neighbors for more complex paths
        if (row > 0 && col > 0) neighbors.push(grid[row - 1][col - 1]);
        if (row > 0 && col < COLS - 1) neighbors.push(grid[row - 1][col + 1]);
        if (row < ROWS - 1 && col > 0) neighbors.push(grid[row + 1][col - 1]);
        if (row < ROWS - 1 && col < COLS - 1) neighbors.push(grid[row + 1][col + 1]);
        
        return neighbors.filter(neighbor => !neighbor.isWall);
    }
    
    function calculateHeuristic(node) {
        const dx = Math.abs(node.col - endNode.col);
        const dy = Math.abs(node.row - endNode.row);
        
        switch (heuristic) {
            case 'manhattan':
                return dx + dy;
            case 'euclidean':
                return Math.sqrt(dx * dx + dy * dy);
            case 'chebyshev':
                return Math.max(dx, dy);
            default:
                return dx + dy;
        }
    }
    
    // Pathfinding algorithms
    async function aStarSearch() {
        const startTime = performance.now();
        let visitedNodes = 0;
        
        // Reset all nodes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.fScore = Infinity;
                node.gScore = Infinity;
                node.hScore = calculateHeuristic(node);
                node.previousNode = null;
                node.isVisited = false;
                node.isPath = false;
            }
        }
        
        // Initialize start node
        startNode.gScore = 0;
        startNode.fScore = startNode.hScore;
        
        const openSet = [startNode];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // Sort openSet by fScore and get node with lowest fScore
            openSet.sort((a, b) => a.fScore - b.fScore);
            const currentNode = openSet.shift();
            
            // If we reach the end, reconstruct path
            if (currentNode === endNode) {
                const pathLength = await reconstructPath(currentNode);
                const endTime = performance.now();
                statsElement.textContent = `Nodes visited: ${visitedNodes} | Path length: ${pathLength} | Time: ${(endTime - startTime).toFixed(2)}ms`;
                return true;
            }
            
            closedSet.add(currentNode);
            visitedNodes++;
            
            // Visualize visited node
            if (!currentNode.isStart) {
                currentNode.isVisited = true;
                const cell = getCellElement(currentNode.row, currentNode.col);
                cell.classList.add('visited');
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
            
            // Check all neighbors
            const neighbors = getAllNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                // Calculate tentative gScore
                const tentativeGScore = currentNode.gScore + neighbor.weight;
                
                if (tentativeGScore < neighbor.gScore) {
                    neighbor.previousNode = currentNode;
                    neighbor.gScore = tentativeGScore;
                    neighbor.fScore = neighbor.gScore + neighbor.hScore;
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        const endTime = performance.now();
        statsElement.textContent = `Nodes visited: ${visitedNodes} | No path found | Time: ${(endTime - startTime).toFixed(2)}ms`;
        return false;
    }
    
    async function dijkstra() {
        const startTime = performance.now();
        let visitedNodes = 0;
        
        // Reset all nodes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.distance = Infinity;
                node.previousNode = null;
                node.isVisited = false;
                node.isPath = false;
            }
        }
        
        // Initialize start node
        startNode.distance = 0;
        const unvisitedNodes = [];
        
        // Add all nodes to unvisited set
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                unvisitedNodes.push(grid[row][col]);
            }
        }
        
        while (unvisitedNodes.length > 0) {
            // Sort nodes by distance and get node with smallest distance
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closestNode = unvisitedNodes.shift();
            
            // Skip walls
            if (closestNode.isWall) continue;
            
            // If the closest node is at infinity, we are trapped
            if (closestNode.distance === Infinity) {
                const endTime = performance.now();
                statsElement.textContent = `Nodes visited: ${visitedNodes} | No path found | Time: ${(endTime - startTime).toFixed(2)}ms`;
                return false;
            }
            
            closestNode.isVisited = true;
            visitedNodes++;
            
            // Visualize visited node
            if (!closestNode.isStart) {
                const cell = getCellElement(closestNode.row, closestNode.col);
                cell.classList.add('visited');
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
            
            // If we reach the end, reconstruct path
            if (closestNode === endNode) {
                const pathLength = await reconstructPath(closestNode);
                const endTime = performance.now();
                statsElement.textContent = `Nodes visited: ${visitedNodes} | Path length: ${pathLength} | Time: ${(endTime - startTime).toFixed(2)}ms`;
                return true;
            }
            
            // Update distances for all neighbors
            const neighbors = getAllNeighbors(closestNode);
            for (const neighbor of neighbors) {
                const newDistance = closestNode.distance + neighbor.weight;
                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.previousNode = closestNode;
                }
            }
        }
        
        return false;
    }
    
    async function hillClimbing() {
        const startTime = performance.now();
        let visitedNodes = 0;
        
        // Reset all nodes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.hScore = calculateHeuristic(node);
                node.previousNode = null;
                node.isVisited = false;
                node.isPath = false;
            }
        }
        
        let currentNode = startNode;
        currentNode.isVisited = true;
        
        while (true) {
            visitedNodes++;
            
            // Visualize visited node
            if (!currentNode.isStart) {
                const cell = getCellElement(currentNode.row, currentNode.col);
                cell.classList.add('visited');
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
            
            // If we reach the end, reconstruct path
            if (currentNode === endNode) {
                const pathLength = await reconstructPath(currentNode);
                const endTime = performance.now();
                statsElement.textContent = `Nodes visited: ${visitedNodes} | Path length: ${pathLength} | Time: ${(endTime - startTime).toFixed(2)}ms`;
                return true;
            }
            
            // Get all neighbors
            const neighbors = getAllNeighbors(currentNode);
            if (neighbors.length === 0) break;
            
            // Find neighbor with best/lowest heuristic
            let bestNeighbor = null;
            let bestScore = Infinity;
            
            for (const neighbor of neighbors) {
                if (neighbor.hScore < bestScore && !neighbor.isVisited) {
                    bestScore = neighbor.hScore;
                    bestNeighbor = neighbor;
                }
            }
            
            // No improvement found
            if (!bestNeighbor || bestNeighbor.hScore >= currentNode.hScore) {
                break;
            }
            
            // Move to best neighbor
            bestNeighbor.previousNode = currentNode;
            bestNeighbor.isVisited = true;
            currentNode = bestNeighbor;
        }
        
        // No path found
        const endTime = performance.now();
        statsElement.textContent = `Nodes visited: ${visitedNodes} | No path found | Time: ${(endTime - startTime).toFixed(2)}ms`;
        return false;
    }

    async function greedyBestFirst() {
        const startTime = performance.now();
        let visitedNodes = 0;
        
        // Reset all nodes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = grid[row][col];
                node.hScore = calculateHeuristic(node);
                node.previousNode = null;
                node.isVisited = false;
                node.isPath = false;
            }
        }
        
        const openSet = [startNode];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // Sort by heuristic and get node with lowest hScore
            openSet.sort((a, b) => a.hScore - b.hScore);
            const currentNode = openSet.shift();
            
            // If we reachthe end, reconstruct path
            if (currentNode === endNode) {
                const pathLength = await reconstructPath(currentNode);
                const endTime = performance.now();
                statsElement.textContent = `Nodes visited: ${visitedNodes} | Path length: ${pathLength} | Time: ${(endTime - startTime).toFixed(2)}ms`;
                return true;
            }
            
            closedSet.add(currentNode);
            visitedNodes++;
            
            // Visualize visited node
            if (!currentNode.isStart) {
                currentNode.isVisited = true;
                const cell = getCellElement(currentNode.row, currentNode.col);
                cell.classList.add('visited');
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
            
            // Check all neighbors
            const neighbors = getAllNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                if (!openSet.includes(neighbor)) {
                    neighbor.previousNode = currentNode;
                    openSet.push(neighbor);
                }
            }
        }
        
        // No path found
        const endTime = performance.now();
        statsElement.textContent = `Nodes visited: ${visitedNodes} | No path found | Time: ${(endTime - startTime).toFixed(2)}ms`;
        return false;
    }
    
    async function reconstructPath(endNode) {
        let pathLength = 0;
        let currentNode = endNode;
        const path = [];
        
        while (currentNode !== null && !currentNode.isStart) {
            path.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        
        // Visualize the path
        for (const node of path) {
            node.isPath = true;
            const cell = getCellElement(node.row, node.col);
            cell.classList.add('path');
            await new Promise(resolve => setTimeout(resolve, animationSpeed * 2));
            pathLength += node.weight;
        }
        
        return pathLength;
    }
    
    async function visualizeAlgorithm() {
        // Disable buttons during visualization
        startBtn.disabled = true;
        resetBtn.disabled = true;
        clearWallsBtn.disabled = true;
        mazeBtn.disabled = true;
        
        // Clear any existing path
        clearPath();
        
        // Run selected algorithm
        let success = false;
        switch (algorithm) {
            case 'astar':
                success = await aStarSearch();
                break;
            case 'dijkstra':
                success = await dijkstra();
                break;
            case 'greedy':
                success = await greedyBestFirst();
                break;
            case 'hillclimb':
                success = await hillClimbing();
                break;
            default:
                success = await aStarSearch();
        }
        
        // Reenable buttons
        startBtn.disabled = false;
        resetBtn.disabled = false;
        clearWallsBtn.disabled = false;
        mazeBtn.disabled = false;
        
        return success;
    }
    
    // Event listeners for controls
    startBtn.addEventListener('click', visualizeAlgorithm);
    resetBtn.addEventListener('click', resetGrid);
    clearWallsBtn.addEventListener('click', clearWalls);
    mazeBtn.addEventListener('click', generateMaze);
    
    speedSelect.addEventListener('change', (e) => {
        animationSpeed = parseInt(e.target.value);
    });
    
    algorithmSelect.addEventListener('change', (e) => {
        algorithm = e.target.value;
    });
    
    heuristicSelect.addEventListener('change', (e) => {
        heuristic = e.target.value;
    });
    
    weightSlider.addEventListener('input', (e) => {
        weight = parseInt(e.target.value);
        document.getElementById('weight-value').textContent = weight;
    });
    
    // Initialize the grid
    initializeGrid();
});