/**
 * Diamond Crystal Structure Visualization
 *
 * This script visualizes the diamond cubic crystal structure, which is the crystal structure
 * of diamond, a solid form of carbon. The diamond cubic structure consists of two interpenetrating
 * face-centered cubic (FCC) lattices, offset by 1/4 of the body diagonal.
 *
 * Each carbon atom in the diamond structure is covalently bonded to four other carbon atoms
 * in a tetrahedral arrangement. This tetrahedral bonding is what gives diamond its exceptional
 * hardness and thermal conductivity.
 *
 * Features:
 * - Realistic representation of the diamond cubic crystal structure
 * - Carbon atoms represented as spheres
 * - Covalent bonds represented as cylinders
 * - Interactive rotation and zoom
 * - Enhanced lighting for better 3D perception
 * 
 * The visualization is interactive and can be rotated by clicking and dragging with the mouse.
 */

// Global variables
let scene, camera, renderer, controls;
let diamondGroup;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

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
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    // Secondary directional light from opposite direction
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Create the diamond structure
    createDiamondStructure();

    // Add window resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

/**
 * Creates a visualization of the diamond cubic crystal structure.
 * The diamond structure consists of carbon atoms arranged in a specific pattern
 * with tetrahedral bonding.
 */
function createDiamondStructure() {
    // Create a group to hold all diamond structure objects
    diamondGroup = new THREE.Group();

    // Define the unit cell size
    const unitCellSize = 3.57; // Approximate diamond lattice constant in Angstroms

    // Define the number of unit cells in each direction
    const cellsX = 2;
    const cellsY = 2;
    const cellsZ = 2;

    // Define carbon atom properties
    const carbonRadius = 0.4; // Size of carbon atom spheres
    const carbonColor = 0x444444; // Gray color for carbon

    // Add some visual enhancement for a diamond-like appearance
    const diamondShine = 0xAAAAAA; // Specular highlight color

    // Define bond properties
    const bondRadius = 0.15; // Radius of bond cylinders
    const bondColor = 0xCCCCCC; // Light gray color for bonds

    // Create carbon atom geometry (sphere)
    const carbonGeometry = new THREE.SphereGeometry(carbonRadius, 32, 32);
    const carbonMaterial = new THREE.MeshPhongMaterial({
        color: carbonColor,
        shininess: 120,
        specular: diamondShine,
        transparent: true,
        opacity: 0.9
    });

    // Create bond material
    const bondMaterial = new THREE.MeshPhongMaterial({
        color: bondColor,
        shininess: 50,
        specular: diamondShine,
        transparent: true,
        opacity: 0.7
    });

    // Array to store all atom positions for bond creation
    const atomPositions = [];

    // Create the diamond cubic structure
    // The diamond cubic structure consists of two interpenetrating FCC lattices
    // offset by (1/4, 1/4, 1/4) of the unit cell diagonal

    // Loop through each unit cell
    for (let x = 0; x < cellsX; x++) {
        for (let y = 0; y < cellsY; y++) {
            for (let z = 0; z < cellsZ; z++) {
                // Base position for this unit cell
                const baseX = (x - cellsX/2) * unitCellSize;
                const baseY = (y - cellsY/2) * unitCellSize;
                const baseZ = (z - cellsZ/2) * unitCellSize;

                // Create atoms for the first FCC lattice
                // FCC lattice has atoms at:
                // (0,0,0), (0,1/2,1/2), (1/2,0,1/2), (1/2,1/2,0)
                const fccPositions = [
                    [0, 0, 0],
                    [0, 0.5, 0.5],
                    [0.5, 0, 0.5],
                    [0.5, 0.5, 0]
                ];

                fccPositions.forEach(pos => {
                    // Calculate the actual position
                    const atomX = baseX + pos[0] * unitCellSize;
                    const atomY = baseY + pos[1] * unitCellSize;
                    const atomZ = baseZ + pos[2] * unitCellSize;

                    // Create and position the atom
                    createAtom(atomX, atomY, atomZ, carbonGeometry, carbonMaterial);

                    // Store the position for bond creation
                    atomPositions.push(new THREE.Vector3(atomX, atomY, atomZ));

                    // Create atoms for the second FCC lattice (offset by 1/4,1/4,1/4)
                    const offsetX = atomX + 0.25 * unitCellSize;
                    const offsetY = atomY + 0.25 * unitCellSize;
                    const offsetZ = atomZ + 0.25 * unitCellSize;

                    createAtom(offsetX, offsetY, offsetZ, carbonGeometry, carbonMaterial);
                    atomPositions.push(new THREE.Vector3(offsetX, offsetY, offsetZ));
                });
            }
        }
    }

    // Create bonds between atoms
    // In diamond, each carbon atom forms tetrahedral bonds with its four nearest neighbors
    createBonds(atomPositions, bondRadius, bondMaterial, unitCellSize);

    // Add the diamond group to the scene
    scene.add(diamondGroup);
}

/**
 * Creates a carbon atom at the specified position.
 */
function createAtom(x, y, z, geometry, material) {
    const atom = new THREE.Mesh(geometry, material);
    atom.position.set(x, y, z);
    diamondGroup.add(atom);
}

/**
 * Creates bonds between carbon atoms.
 * In the diamond structure, each carbon atom is bonded to four other carbon atoms
 * in a tetrahedral arrangement.
 */
function createBonds(atomPositions, bondRadius, bondMaterial, unitCellSize) {
    // The maximum distance for a bond between two carbon atoms
    // In diamond, the C-C bond length is approximately 1.54 Angstroms
    const maxBondDistance = 1.8; // Slightly larger than actual bond length to account for positioning

    // Check each pair of atoms
    for (let i = 0; i < atomPositions.length; i++) {
        for (let j = i + 1; j < atomPositions.length; j++) {
            const atom1 = atomPositions[i];
            const atom2 = atomPositions[j];

            // Calculate distance between atoms
            const distance = atom1.distanceTo(atom2);

            // If atoms are close enough, create a bond
            if (distance < maxBondDistance) {
                createBond(atom1, atom2, bondRadius, bondMaterial);
            }
        }
    }
}

/**
 * Creates a bond (cylinder) between two atoms.
 */
function createBond(atom1, atom2, bondRadius, bondMaterial) {
    // Calculate the midpoint between the two atoms
    const midpoint = new THREE.Vector3().addVectors(atom1, atom2).multiplyScalar(0.5);

    // Calculate the direction vector from atom1 to atom2
    const direction = new THREE.Vector3().subVectors(atom2, atom1);

    // Calculate the length of the bond
    const bondLength = direction.length();

    // Create a cylinder geometry for the bond
    const bondGeometry = new THREE.CylinderGeometry(
        bondRadius, bondRadius, bondLength, 8, 1
    );

    // Rotate the cylinder to align with the direction vector
    // By default, the cylinder's axis is along the Y-axis
    const bond = new THREE.Mesh(bondGeometry, bondMaterial);

    // Position the bond at the midpoint
    bond.position.copy(midpoint);

    // Orient the bond to point from atom1 to atom2
    // First, create a vector representing the default orientation (along Y-axis)
    const defaultOrientation = new THREE.Vector3(0, 1, 0);

    // Normalize the direction vector
    direction.normalize();

    // Calculate the quaternion that rotates from the default orientation to the desired direction
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultOrientation, direction);

    // Apply the rotation to the bond
    bond.setRotationFromQuaternion(quaternion);

    // Add the bond to the diamond group
    diamondGroup.add(bond);
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

    // Add a subtle rotation to the diamond structure
    if (diamondGroup) {
        diamondGroup.rotation.y += 0.002;
        diamondGroup.rotation.x += 0.001;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Initialize the visualization when the page loads
window.onload = init;
