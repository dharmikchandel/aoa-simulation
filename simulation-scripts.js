document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const runAlgorithmButton = document.getElementById('runAlgorithm');
    const startStepByStepButton = document.getElementById('startStepByStep');
    const nextStepButton = document.getElementById('nextStep');
    const resetButton = document.getElementById('resetVisualization');
    const setNodesButton = document.getElementById('setNodes');
    const addEdgeButton = document.getElementById('addEdge');
    const clearEdgesButton = document.getElementById('clearEdges');
    const loadExampleButton = document.getElementById('loadExample');
    const stepsContainer = document.getElementById('steps');
    const resultContainer = document.getElementById('result');
    const resultDetails = document.getElementById('resultDetails');
    const totalWeightElement = document.getElementById('totalWeight');

    let numNodes = parseInt(document.getElementById('numNodes').value);
    let nodes = [];
    let edges = [];
    let sortedEdges = [];
    let mst = [];
    let currentStep = 0;
    let disjointSet = [];
    let stepByStepMode = false;

    function resetGraphState() {
        initializeNodes();
        disjointSet = Array.from({ length: numNodes }, (_, i) => i);
        mst = [];
        sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        currentStep = 0;
        stepsContainer.innerHTML = '';
        resultContainer.style.display = 'none';
        resultDetails.innerHTML = '';
        totalWeightElement.textContent = '';
    }

    // Initialize nodes positions with the same styling as original code
    function initializeNodes() {
        nodes = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4 - 30;
        
        for (let i = 0; i < numNodes; i++) {
            const angle = (i * 2 * Math.PI / numNodes) - Math.PI/2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            nodes.push({ id: i, x, y });
        }
    }

    function find(u) {
        if (disjointSet[u] !== u) {
            disjointSet[u] = find(disjointSet[u]);
        }
        return disjointSet[u];
    }

    function union(u, v) {
        const uRoot = find(u);
        const vRoot = find(v);
        if (uRoot !== vRoot) {
            disjointSet[vRoot] = uRoot;
        }
    }

    function kruskalStep() {
        if (currentStep >= sortedEdges.length) return;

        const edge = sortedEdges[currentStep];
        const uRoot = find(edge.source);
        const vRoot = find(edge.destination);

        const stepElement = document.createElement('div');
        stepElement.className = 'step highlighted';

        if (uRoot !== vRoot) {
            mst.push(edge);
            union(uRoot, vRoot);
            stepElement.innerHTML = `
                Consider edge (${edge.source},${edge.destination}) with weight ${edge.weight}: 
                <span style="color:green">Added</span> to MST (no cycle formed)
            `;
        } else {
            stepElement.innerHTML = `
                Consider edge (${edge.source},${edge.destination}) with weight ${edge.weight}: 
                <span style="color:red">Rejected</span> (would form a cycle)
            `;
        }

        stepsContainer.appendChild(stepElement);
        stepElement.scrollIntoView({ behavior: "smooth" });
        
        currentStep++;
        
        // Remove highlighting from previous step
        setTimeout(() => {
            stepElement.className = 'step';
        }, 1500);

        if (currentStep >= sortedEdges.length) {
            displayResult();
            nextStepButton.disabled = true;
        }
    }

    function runKruskal(stepByStep) {
        resetGraphState();
        stepByStepMode = stepByStep;

        stepsContainer.innerHTML = `<h3>Algorithm Steps:</h3>`;
        stepsContainer.innerHTML += `<div class="step">Sorted edges by weight: ${sortedEdges.map(e => `(${e.source},${e.destination},${e.weight})`).join(', ')}</div>`;

        if (!stepByStepMode) {
            for (let edge of sortedEdges) {
                const uRoot = find(edge.source);
                const vRoot = find(edge.destination);

                if (uRoot !== vRoot) {
                    mst.push(edge);
                    union(uRoot, vRoot);
                    
                    // Add step to UI with original styling
                    stepsContainer.innerHTML += `
                        <div class="step">
                            Consider edge (${edge.source},${edge.destination}) with weight ${edge.weight}: 
                            <span style="color:green">Added</span> to MST (no cycle formed)
                        </div>
                    `;
                } else {
                    stepsContainer.innerHTML += `
                        <div class="step">
                            Consider edge (${edge.source},${edge.destination}) with weight ${edge.weight}: 
                            <span style="color:red">Rejected</span> (would form a cycle)
                        </div>
                    `;
                }
            }

            displayResult();
        }
    }

    function displayResult() {
        resultContainer.style.display = 'block';
        
        let totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);
        
        resultDetails.innerHTML = `
            <p>Edges in MST: ${mst.map(e => `(${e.source},${e.destination}) with weight ${e.weight}`).join(', ')}</p>
        `;
        totalWeightElement.textContent = `Total MST Weight: ${totalWeight}`;
    }

    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw edges with original styling
        edges.forEach(edge => {
            const sourceNode = nodes[edge.source];
            const destNode = nodes[edge.destination];
            
            // Check if this edge is in MST
            const inMST = mst.some(e => 
                (e.source === edge.source && e.destination === edge.destination) ||
                (e.source === edge.destination && e.destination === edge.source)
            );
            
            // Check if this is the current edge being considered in step by step mode
            const isCurrent = stepByStepMode && currentStep > 0 && currentStep <= sortedEdges.length && 
                edge.source === sortedEdges[currentStep-1].source && 
                edge.destination === sortedEdges[currentStep-1].destination;
            
            // Set line style based on edge status
            ctx.lineWidth = inMST ? 3 : 1;
            ctx.strokeStyle = inMST ? '#4CAF50' : (isCurrent ? '#FFC107' : '#999');
            
            // Draw edge
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(destNode.x, destNode.y);
            ctx.stroke();
            
            // Draw weight with original styling
            const midX = (sourceNode.x + destNode.x) / 2;
            const midY = (sourceNode.y + destNode.y) / 2;
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = inMST ? '#4CAF50' : (isCurrent ? '#FFC107' : '#333');
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(edge.weight, midX, midY);
        });
        
        // Draw nodes with original styling
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#2a5885';
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, node.x, node.y);
        });
    }

    function resetVisualization() {
        mst = [];
        sortedEdges = [];
        currentStep = 0;
        disjointSet = [];
        stepByStepMode = false;
        stepsContainer.innerHTML = '<p>Steps will appear here after running the algorithm.</p>';
        resultContainer.style.display = 'none';
        nextStepButton.disabled = true;
        resetButton.disabled = true;
        resetGraphState();
        drawGraph();
    }

    // 🔘 BUTTON EVENTS

    setNodesButton.addEventListener('click', function () {
        numNodes = parseInt(document.getElementById('numNodes').value);
        
        // Add input validation from original code
        if (numNodes < 2) {
            alert("Number of nodes must be at least 2");
            document.getElementById('numNodes').value = 2;
            numNodes = 2;
        } else if (numNodes > 15) {
            alert("For clarity, maximum number of nodes is limited to 15");
            document.getElementById('numNodes').value = 15;
            numNodes = 15;
        }
        
        // Update max values for source and destination inputs
        document.getElementById('source').max = numNodes - 1;
        document.getElementById('destination').max = numNodes - 1;
        
        // Reset edges if they reference nodes that no longer exist
        edges = edges.filter(edge => 
            edge.source < numNodes && edge.destination < numNodes);
            
        resetGraphState();
        drawGraph();
    });

    addEdgeButton.addEventListener('click', function () {
        const source = parseInt(document.getElementById('source').value);
        const destination = parseInt(document.getElementById('destination').value);
        const weight = parseInt(document.getElementById('weight').value);

        if (isNaN(source) || isNaN(destination) || isNaN(weight)) {
            alert("Please fill all fields with valid numbers.");
            return;
        }
        
        if (source < 0 || source >= numNodes || destination < 0 || destination >= numNodes) {
            alert(`Node IDs must be between 0 and ${numNodes - 1}`);
            return;
        }
        
        if (source === destination) {
            alert("Self-loops are not allowed in a minimum spanning tree");
            return;
        }
        
        if (weight <= 0) {
            alert("Weight must be a positive number");
            return;
        }
        
        // Check if edge already exists
        const edgeExists = edges.some(edge => 
            (edge.source === source && edge.destination === destination) || 
            (edge.source === destination && edge.destination === source)
        );
        
        if (edgeExists) {
            alert("This edge already exists. Edit or remove it first.");
            return;
        }

        edges.push({ source, destination, weight });
        
        // Clear inputs like in original code
        document.getElementById('source').value = '';
        document.getElementById('destination').value = '';
        document.getElementById('weight').value = '';
        
        drawGraph();
    });

    clearEdgesButton.addEventListener('click', function () {
        edges = [];
        drawGraph();
        resetVisualization();
    });

    loadExampleButton.addEventListener('click', function () {
        numNodes = 5;
        document.getElementById('numNodes').value = 5;
        document.getElementById('source').max = 4;
        document.getElementById('destination').max = 4;
        
        edges = [
            { source: 0, destination: 1, weight: 2 },
            { source: 0, destination: 3, weight: 6 },
            { source: 1, destination: 2, weight: 3 },
            { source: 1, destination: 3, weight: 8 },
            { source: 1, destination: 4, weight: 5 },
            { source: 2, destination: 4, weight: 7 },
            { source: 3, destination: 4, weight: 9 }
        ];
        
        resetGraphState();
        drawGraph();
        resetVisualization();
    });

    runAlgorithmButton.addEventListener('click', function () {
        if (edges.length === 0) {
            alert("Please add some edges first");
            return;
        }
        
        resetVisualization();
        runKruskal(false);
        drawGraph();
        resetButton.disabled = false;
    });

    startStepByStepButton.addEventListener('click', function () {
        if (edges.length === 0) {
            alert("Please add some edges first.");
            return;
        }
        resetVisualization();
        runKruskal(true);
        drawGraph();
        nextStepButton.disabled = false;
        resetButton.disabled = false;
    });

    nextStepButton.addEventListener('click', function () {
        kruskalStep();
        drawGraph();
    });

    resetButton.addEventListener('click', function () {
        resetVisualization();
    });

    // Initial draw
    initializeNodes();
    drawGraph();
});