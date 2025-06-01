import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let nucleus;
let s_orbital_particles, p_orbital_particles_x, p_orbital_particles_y, p_orbital_particles_z;
// d_orbital_particles can be added later for more complexity

const PARTICLE_COUNT_S = 5000;
const PARTICLE_COUNT_P = 3000; // Per lobe

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight); // Light moves with camera
    scene.add(camera);

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x550000 });
    nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // Create Orbitals
    createS_Orbital();
    createP_Orbitals(); // Basic representation

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createS_Orbital() {
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];
    const s_orbital_material = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.05,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < PARTICLE_COUNT_S; i++) {
        // Spherical distribution, denser towards center (simplified)
        const r = Math.random() * 5; // Radius up to 5 units
        const theta = Math.random() * 2 * Math.PI; // Azimuthal angle
        const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform spherical)

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions.push(x, y, z);
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    s_orbital_particles = new THREE.Points(particlesGeometry, s_orbital_material);
    s_orbital_particles.visible = true; // Default visible
    scene.add(s_orbital_particles);
}

function createP_Orbitals() {
    // Px orbital (along x-axis)
    p_orbital_particles_x = createP_Lobe(0xffaa00, 'x');
    scene.add(p_orbital_particles_x);
    p_orbital_particles_x.visible = false;

    // Py orbital (along y-axis)
    p_orbital_particles_y = createP_Lobe(0x00ffaa, 'y');
    scene.add(p_orbital_particles_y);
    p_orbital_particles_y.visible = false;

    // Pz orbital (along z-axis)
    p_orbital_particles_z = createP_Lobe(0xaa00ff, 'z');
    scene.add(p_orbital_particles_z);
    p_orbital_particles_z.visible = false;

    // Simple UI to toggle orbitals (can be improved)
    const p_info = document.createElement('div');
    p_info.style.position = 'absolute';
    p_info.style.bottom = '20px';
    p_info.style.left = '20px';
    p_info.style.color = 'white';
    p_info.style.fontFamily = 'Arial';
    p_info.innerHTML = `
        <h3>Toggle Orbitals:</h3>
        <label><input type="checkbox" id="s_orbital_toggle" checked /> 1s Orbital</label><br/>
        <label><input type="checkbox" id="px_orbital_toggle" /> 2px Orbital</label><br/>
        <label><input type="checkbox" id="py_orbital_toggle" /> 2py Orbital</label><br/>
        <label><input type="checkbox" id="pz_orbital_toggle" /> 2pz Orbital</label>
    `;
    document.body.appendChild(p_info);

    document.getElementById('s_orbital_toggle').addEventListener('change', (e) => s_orbital_particles.visible = e.target.checked);
    document.getElementById('px_orbital_toggle').addEventListener('change', (e) => p_orbital_particles_x.visible = e.target.checked);
    document.getElementById('py_orbital_toggle').addEventListener('change', (e) => p_orbital_particles_y.visible = e.target.checked);
    document.getElementById('pz_orbital_toggle').addEventListener('change', (e) => p_orbital_particles_z.visible = e.target.checked);
}

function createP_Lobe(color, axis) {
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];
    const p_orbital_material = new THREE.PointsMaterial({
        color: color,
        size: 0.04,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    // Create two lobes for a p-orbital
    for (let lobe = 0; lobe < 2; lobe++) {
        const sign = (lobe === 0) ? 1 : -1;
        for (let i = 0; i < PARTICLE_COUNT_P / 2; i++) {
            // Dumbbell shape - simplified using spherical coordinates with bias
            let r = Math.random() * 6; // Max radius
            let theta, phi;

            // Bias distribution to form lobes
            // This is a very simplified representation
            phi = Math.random() * Math.PI; // 0 to PI
            theta = Math.random() * Math.PI - Math.PI / 2; // -PI/2 to PI/2 for one side of lobe

            let x_raw = r * Math.sin(phi) * Math.cos(theta);
            let y_raw = r * Math.sin(phi) * Math.sin(theta);
            let z_raw = r * Math.cos(phi);

            // Make it denser along the axis and taper off
            if (axis === 'x') {
                x_raw *= 2.0; // Elongate along x
                y_raw *= 0.7;
                z_raw *= 0.7;
                positions.push(sign * Math.abs(x_raw), y_raw, z_raw);
            } else if (axis === 'y') {
                y_raw *= 2.0; // Elongate along y
                x_raw *= 0.7;
                z_raw *= 0.7;
                positions.push(x_raw, sign * Math.abs(y_raw), z_raw);
            } else { // 'z'
                z_raw *= 2.0; // Elongate along z
                x_raw *= 0.7;
                y_raw *= 0.7;
                positions.push(x_raw, y_raw, sign * Math.abs(z_raw));
            }
        }
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return new THREE.Points(particlesGeometry, p_orbital_material);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Optional: Animate particles if desired (e.g., slight movement or rotation)
    // if (s_orbital_particles) s_orbital_particles.rotation.y += 0.0005;
    // if (p_orbital_particles_x && p_orbital_particles_x.visible) p_orbital_particles_x.rotation.y += 0.0005;
    // if (p_orbital_particles_y && p_orbital_particles_y.visible) p_orbital_particles_y.rotation.x += 0.0005;
    // if (p_orbital_particles_z && p_orbital_particles_z.visible) p_orbital_particles_z.rotation.x += 0.0005;


    renderer.render(scene, camera);
}

init();
