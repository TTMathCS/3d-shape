/**
 * Rectangular Prism Visualization
 *
 * This script visualizes a rectangular prism with dimensions 2×5×11,
 * cut into 110 individual cubes with spaces between each cube.
 *
 * Features:
 * - 110 individual cubes arranged in a 2×5×11 grid
 * - Spaces between each cube for better visibility
 * - Interactive rotation and zooming
 * - Enhanced lighting for better 3D perception
 * 
 * The visualization is interactive and can be rotated by clicking and dragging with the mouse.
 */

// Global variables
let scene, camera, renderer, controls;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 10;
    camera.position.x = 10;

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

    // Add enhanced lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    // Secondary directional light from opposite direction
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Create the rectangular prism cut into cubes
    createRectangularPrismWithCubes();

    // Add window resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

/**
 * Creates a rectangular prism with dimensions 2×5×11, cut into 110 individual cubes with spaces.
 * Cubes are colored differently based on their exposure:
 * - Cubes with 3 faces exposed: bright blue
 * - Cubes with 2 faces exposed: green
 * - Cubes with 1 face exposed: yellow
 * - Interior cubes (0 faces exposed): red
 */
function createRectangularPrismWithCubes() {
    // Define the dimensions of the rectangular prism
    const width = 2;
    const height = 5;
    const depth = 11;

    // Define the space between cubes
    const spacing = 0.2;

    // Calculate the size of each cube (accounting for spacing)
    const cubeSize = 1;

    // Create a group to hold all cubes
    const prismGroup = new THREE.Group();

    // Create a geometry for the cubes
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Define materials for different types of cubes
    const threeFacesExposedMaterial = new THREE.MeshPhongMaterial({
        color: 0x0088FF,  // Bright blue
        transparent: true,
        opacity: 0.8,
        specular: 0x111111,
        shininess: 30
    });

    const twoFacesExposedMaterial = new THREE.MeshPhongMaterial({
        color: 0x00CC44,  // Green
        transparent: true,
        opacity: 0.8,
        specular: 0x111111,
        shininess: 30
    });

    const oneFaceExposedMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFCC00,  // Yellow
        transparent: true,
        opacity: 0.8,
        specular: 0x111111,
        shininess: 30
    });

    const interiorCubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xFF4444,  // Red
        transparent: true,
        opacity: 0.8,
        specular: 0x111111,
        shininess: 30
    });

    // Create 110 cubes arranged in a 2×5×11 grid with spacing
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                // Determine how many faces are exposed
                let exposedFaces = 0;

                // Check if the cube is on any of the outer faces of the prism
                if (x === 0 || x === width - 1) exposedFaces++;
                if (y === 0 || y === height - 1) exposedFaces++;
                if (z === 0 || z === depth - 1) exposedFaces++;

                // Select the appropriate material based on exposure
                let material;
                if (exposedFaces === 3) {
                    material = threeFacesExposedMaterial;
                } else if (exposedFaces === 2) {
                    material = twoFacesExposedMaterial;
                } else if (exposedFaces === 1) {
                    material = oneFaceExposedMaterial;
                } else {
                    material = interiorCubeMaterial;
                }

                const cube = new THREE.Mesh(cubeGeometry, material);

                // Position the cube with spacing
                cube.position.x = x * (cubeSize + spacing) - (width * (cubeSize + spacing) / 2) + (cubeSize + spacing) / 2;
                cube.position.y = y * (cubeSize + spacing) - (height * (cubeSize + spacing) / 2) + (cubeSize + spacing) / 2;
                cube.position.z = z * (cubeSize + spacing) - (depth * (cubeSize + spacing) / 2) + (cubeSize + spacing) / 2;

                // Add edges to the cube for better visibility
                const edges = new THREE.EdgesGeometry(cubeGeometry);
                const line = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({ color: 0x000000 })
                );
                cube.add(line);

                // Add the cube to the group
                prismGroup.add(cube);
            }
        }
    }

    // Add the group to the scene
    scene.add(prismGroup);
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
