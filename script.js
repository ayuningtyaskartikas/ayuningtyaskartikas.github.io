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
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 20;

// STARFIELD
const starGeometry = new THREE.BufferGeometry();
const starCount = 200;
const positions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 80;
  const y = (Math.random() - 0.5) * 80;
  const z = (Math.random() - 0.5) * 80;
  positions.push(x, y, z);
}

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1,
  sizeAttenuation: true,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);
  stars.rotation.y += 0.0008;
  renderer.render(scene, camera);
}
animate();

// HANDLE RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
