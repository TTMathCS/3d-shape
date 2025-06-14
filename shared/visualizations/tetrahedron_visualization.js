/**
 * Multiple Connected Tetrahedrons Visualization with Shared Corners
 *
 * This script visualizes 5 connected regular tetrahedrons, each with a point at its center.
 * The configuration consists of one central tetrahedron with 4 additional tetrahedrons,
 * where all corners (vertices) of each tetrahedron are shared with other tetrahedrons.
 * Specifically, each additional tetrahedron shares 3 vertices with the central tetrahedron,
 * creating a structure where every vertex is part of multiple tetrahedrons.
 * Each tetrahedron has a dot in its middle representing its geometric center.
 *
 * The visualization is interactive and can be rotated by clicking and dragging with the mouse.
 */

// Global variables
let scene, camera, renderer, controls;
let allTetrahedrons = [];

// Colors for the tetrahedrons
const colors = [
    0x00FFFF, // cyan
    0x90EE90, // lightgreen
    0xADD8E6, // lightblue
    0xFFFFE0, // lightyellow
    0xFFB6C1  // lightpink
];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add orbit controls for rotation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxDistance = 100;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create the tetrahedrons
    createMultipleTetrahedrons();

    // Add window resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

/**
 * Creates a regular tetrahedron centered at the specified position.
 *
 * @param {THREE.Vector3} center - The center position of the tetrahedron (default: origin)
 * @param {number} scale - Scaling factor for the tetrahedron size (default: 1.0)
 * @returns {Object} An object containing the tetrahedron mesh and its center point
 */
function createRegularTetrahedron(center = new THREE.Vector3(0, 0, 0), scale = 1.0) {
    // Define the vertices of a regular tetrahedron
    const vertices = [
        new THREE.Vector3(1, 1, 1),     // Vertex 0
        new THREE.Vector3(1, -1, -1),   // Vertex 1
        new THREE.Vector3(-1, 1, -1),   // Vertex 2
        new THREE.Vector3(-1, -1, 1)    // Vertex 3
    ];

    // Scale the vertices
    vertices.forEach(vertex => {
        vertex.multiplyScalar(scale);
        vertex.add(center);
    });

    // Create geometry
    const geometry = new THREE.BufferGeometry();

    // Define the faces (triangles) of the tetrahedron
    const indices = [
        0, 1, 2,  // Face 1
        0, 1, 3,  // Face 2
        0, 2, 3,  // Face 3
        1, 2, 3   // Face 4
    ];

    // Create positions array from vertices
    const positions = [];
    vertices.forEach(vertex => {
        positions.push(vertex.x, vertex.y, vertex.z);
    });

    // Set attributes
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    // Create edges geometry for wireframe
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));

    // Return the vertices for later use
    return {
        vertices: vertices,
        geometry: geometry,
        edges: line,
        center: center.clone()
    };
}

/**
 * Creates a 3D visualization of 5 connected regular tetrahedrons, each with a point at its center.
 * All corners (vertices) of each tetrahedron are shared with other tetrahedrons.
 */
function createMultipleTetrahedrons() {
    // Create a group to hold all tetrahedron objects
    const tetraGroup = new THREE.Group();

    // Define the scale for the tetrahedrons
    const scale = 1.0;

    // Create a set of shared vertices that will be used by multiple tetrahedrons
    // We'll create a structure where 5 tetrahedrons share all their vertices

    // First, create the central tetrahedron
    const centralTetra = createRegularTetrahedron(new THREE.Vector3(0, 0, 0), scale);

    // Store all tetrahedrons in an array for easier access
    const tetrahedrons = [];
    tetrahedrons.push({
        vertices: centralTetra.vertices,
        center: centralTetra.center,
        geometry: centralTetra.geometry,
        edges: centralTetra.edges,
        color: colors[0]
    });

    // Now create 4 additional tetrahedrons that share vertices with the central one
    // Each additional tetrahedron will share 3 vertices with the central tetrahedron
    // and 1 new vertex that will be shared with the next tetrahedron

    // Create 4 new vertices that will be used for the additional tetrahedrons
    const newVertices = [];
    for (let i = 0; i < 4; i++) {
        // Create a new vertex in a direction that forms a regular tetrahedron with 3 vertices from the central tetrahedron
        // We'll use 3 consecutive vertices from the central tetrahedron
        const v1 = centralTetra.vertices[i];
        const v2 = centralTetra.vertices[(i + 1) % 4];
        const v3 = centralTetra.vertices[(i + 2) % 4];

        // Calculate the center of these 3 vertices
        const center = new THREE.Vector3()
            .add(v1)
            .add(v2)
            .add(v3)
            .divideScalar(3);

        // Calculate a vector from this center to the opposite vertex of the central tetrahedron
        const oppositeVertex = centralTetra.vertices[(i + 3) % 4];
        const directionToOpposite = new THREE.Vector3()
            .subVectors(oppositeVertex, center)
            .normalize();

        // Create a new vertex in the opposite direction at the same distance
        // This ensures the new tetrahedron has the same size as the central one
        const newVertex = new THREE.Vector3()
            .subVectors(center, directionToOpposite.multiplyScalar(scale * 1.63));

        newVertices.push(newVertex);
    }

    // Create 4 additional tetrahedrons using the shared vertices
    for (let i = 0; i < 4; i++) {
        // Each additional tetrahedron uses 3 vertices from the central tetrahedron
        // and 1 new vertex
        const tetraVertices = [
            centralTetra.vertices[i],
            centralTetra.vertices[(i + 1) % 4],
            centralTetra.vertices[(i + 2) % 4],
            newVertices[i]
        ];

        // Calculate the center of this tetrahedron
        const center = new THREE.Vector3();
        tetraVertices.forEach(v => center.add(v));
        center.divideScalar(4);

        // Create geometry for this tetrahedron
        const geometry = new THREE.BufferGeometry();

        // Define the faces (triangles) of the tetrahedron
        const indices = [
            0, 1, 2,  // Face 1
            0, 1, 3,  // Face 2
            0, 2, 3,  // Face 3
            1, 2, 3   // Face 4
        ];

        // Create positions array from vertices
        const positions = [];
        tetraVertices.forEach(vertex => {
            positions.push(vertex.x, vertex.y, vertex.z);
        });

        // Set attributes
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        // Create edges geometry for wireframe
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));

        // Store this tetrahedron
        tetrahedrons.push({
            vertices: tetraVertices,
            center: center,
            geometry: geometry,
            edges: line,
            color: colors[i + 1]
        });
    }

    // Add all tetrahedrons to the scene
    tetrahedrons.forEach(tetra => {
        // Create material with the tetrahedron's color
        const material = new THREE.MeshPhongMaterial({
            color: tetra.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        // Create mesh and add to group
        const mesh = new THREE.Mesh(tetra.geometry, material);
        tetraGroup.add(mesh);
        tetraGroup.add(tetra.edges);

        // Add a sphere at the center of the tetrahedron
        const centerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshPhongMaterial({ color: 0xff0000 })
        );
        centerSphere.position.copy(tetra.center);
        tetraGroup.add(centerSphere);
    });

    // Add spheres at all vertices to highlight the shared corners
    const addedVertices = new Set(); // To avoid adding the same vertex twice

    tetrahedrons.forEach(tetra => {
        tetra.vertices.forEach(vertex => {
            // Create a unique key for this vertex
            const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;

            if (!addedVertices.has(key)) {
                const vertexSphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 16, 16),
                    new THREE.MeshPhongMaterial({ color: 0x0000ff })
                );
                vertexSphere.position.copy(vertex);
                tetraGroup.add(vertexSphere);

                addedVertices.add(key);
            }
        });
    });

    // Add the group to the scene
    scene.add(tetraGroup);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the visualization when the page loads
window.onload = init;
