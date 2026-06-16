/*
 * script.js
 *
 * This file configures a basic Three.js scene and ties it to scrolling
 * animations with GSAP. The goal is to create an interactive landing
 * experience that feels alive as the user scrolls into the shop section.
 *
 * Replace or extend the geometry and animations to match your brand.
 */

// Wait for the DOM to load before initializing Three.js
window.addEventListener('DOMContentLoaded', init);

function init() {
  // Grab the canvas element
  const canvas = document.getElementById('three-canvas');

  // Setup scene, camera and renderer
  const scene = new THREE.Scene();
  // Use a perspective camera for a sense of depth; adjust FOV and aspect
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lighting: ambient light for base illumination and point light for highlights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Group to hold multiple torus rings
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  // Create several torus geometries of varying sizes and colors to evoke
  // wrestling ropes or kinetic energy. Colors reference high‑contrast ink
  // combinations found in Printify’s 2026 trends.
  const ringColors = [0xe5cc00, 0xd40000, 0xffffff];
  const torusRadii = [2.5, 3.0, 3.5];
  torusRadii.forEach((radius, index) => {
    const geometry = new THREE.TorusGeometry(radius, 0.12, 16, 60);
    const material = new THREE.MeshStandardMaterial({
      color: ringColors[index % ringColors.length],
      metalness: 0.3,
      roughness: 0.4,
    });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.random() * Math.PI;
    torus.rotation.y = Math.random() * Math.PI;
    ringGroup.add(torus);
  });

  // Create a central star shape to reference heroic motifs from modern
  // wrestling gear (e.g., star motifs on Cody‑inspired clothing). The star
  // geometry is constructed via a custom shape and extruded for depth.
  const starShape = new THREE.Shape();
  const spikes = 5;
  const outerRadius = 1.2;
  const innerRadius = 0.5;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    if (i === 0) {
      starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    } else {
      starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }
  starShape.closePath();
  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  };
  const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5cc00,
    metalness: 0.5,
    roughness: 0.2,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.rotation.x = Math.PI / 2;
  scene.add(starMesh);

  // Track mouse movement for parallax effect
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    const elapsed = clock.getElapsedTime();
    // Rotate rings slowly for movement
    ringGroup.children.forEach((torus, idx) => {
      torus.rotation.x += 0.001 + idx * 0.0003;
      torus.rotation.y += 0.002 + idx * 0.0002;
    });
    // Small bobbing for the star
    starMesh.position.z = Math.sin(elapsed) * 0.2;
    // Parallax: subtly shift the camera based on mouse
    camera.rotation.y = mouse.x * 0.1;
    camera.rotation.x = mouse.y * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // GSAP scroll animations
  gsap.registerPlugin(ScrollTrigger);
  // Fade out overlay and move camera slightly forward as user scrolls down
  gsap.timeline({
    scrollTrigger: {
      trigger: '#shop',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
    },
  })
    .to('.overlay', { opacity: 0, y: -50, duration: 1 }, 0)
    .to(ringGroup.position, { z: -2, duration: 1 }, 0)
    .to(camera.position, { z: 8, duration: 1 }, 0);
}