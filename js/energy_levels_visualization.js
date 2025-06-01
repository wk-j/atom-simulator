import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

let scene, camera, renderer, labelRenderer, controls;
const energyLevels = [];

// Define energy levels (example for Hydrogen, arbitrary units for visualization)
// E_n = -13.6 eV / n^2. We'll use n and scale for visualization.
const levelsData = [
    { n: 1, energy: -13.6, label: "n=1 (Ground State)", color: 0xff0000 },
    { n: 2, energy: -3.4, label: "n=2", color: 0x00ff00 },
    { n: 3, energy: -1.51, label: "n=3", color: 0x0000ff },
    { n: 4, energy: -0.85, label: "n=4", color: 0xffff00 },
    { n: 5, energy: -0.54, label: "n=5", color: 0xff00ff },
    // Add more levels if desired
];

const LEVEL_SPACING = 5; // Vertical spacing between levels in the scene
const LEVEL_RADIUS = 10;
const LEVEL_THICKNESS = 0.2;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15); // Adjusted for better initial view
    camera.lookAt(0, (levelsData.length * LEVEL_SPACING) / 3, 0); // Look towards center of levels

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // CSS2D Renderer for labels
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Allow orbit controls to work through labels
    document.body.appendChild(labelRenderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement); // Use renderer.domElement for controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, (levelsData.length * LEVEL_SPACING) / 3, 0); // Set control target

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create Energy Levels
    createEnergyLevels();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createEnergyLevels() {
    levelsData.forEach((levelData, index) => {
        const yPosition = index * LEVEL_SPACING;

        // Level Geometry (Disc or Plane)
        const levelGeometry = new THREE.CylinderGeometry(LEVEL_RADIUS, LEVEL_RADIUS, LEVEL_THICKNESS, 64);
        const levelMaterial = new THREE.MeshPhongMaterial({
            color: levelData.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const levelMesh = new THREE.Mesh(levelGeometry, levelMaterial);
        levelMesh.position.y = yPosition;
        levelMesh.rotation.x = Math.PI / 2; // Lay it flat
        scene.add(levelMesh);
        energyLevels.push(levelMesh);

        // Label for the level
        const levelDiv = document.createElement('div');
        levelDiv.className = 'label';
        levelDiv.textContent = `${levelData.label} (${levelData.energy.toFixed(2)} eV)`;
        levelDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
        levelDiv.style.padding = '2px 5px';
        levelDiv.style.color = 'white';
        levelDiv.style.borderRadius = '3px';
        levelDiv.style.fontSize = '12px';


        const levelLabel = new CSS2DObject(levelDiv);
        levelLabel.position.set(LEVEL_RADIUS * 0.7, yPosition + LEVEL_THICKNESS, 0); // Position label next to the disc
        scene.add(levelLabel);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

init();
