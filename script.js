// ====== THREE.JS SCENE SETUP ======
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 20;

// ====== STARFIELD CREATION ======
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000; // Increased star count for a denser field
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 1000; // x
  positions[i3 + 1] = (Math.random() - 0.5) * 1000; // y
  positions[i3 + 2] = (Math.random() - 0.5) * 1000; // z
}

starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  sizeAttenuation: true
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);


// ====== MOUSE INTERACTION SETUP ======
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    // Normalize mouse position from -1 to 1 for both x and y
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});


// ====== ANIMATION LOOP ======
function animate() {
  requestAnimationFrame(animate);

  // Subtle constant rotation
  starField.rotation.y += 0.0001;
  
  // Interactive rotation based on mouse position
  // The small multiplier creates a subtle, gentle effect
  starField.rotation.x += (mouseY - starField.rotation.x) * 0.0005;
  starField.rotation.y += (mouseX - starField.rotation.y) * 0.0005;

  renderer.render(scene, camera);
}

animate();


// ====== RESIZE LISTENER ======
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});