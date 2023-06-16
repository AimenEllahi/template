import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.8);
spotLight.position.set(15, 40, 35);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
ambientLight.position.set(15, 40, 35);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.load('./sculpture_black2.gltf', function (gltf) {
  const root = gltf.scene;
  root.scale.set(0.07, 0.07, 0.07);
  root.position.set(0, -1, 0);
  scene.add(root);
  console.log(root);
}, undefined, function (error) {
  console.error(error);
});

camera.position.z = 5;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update(); // Update OrbitControls
}

animate();
