import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { ShaderMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sky } from 'three/examples/jsm/objects/Sky';

import sky from './skybox/stars.jpg';


// Create a scene
const scene = new THREE.Scene();

// Create a camera
let screenWidth = window.innerWidth,
  screenHeight = window.innerHeight,
  viewAngle = 95,
  nearDistance = 0.1,
  farDistance = 5000;
let camera = new THREE.PerspectiveCamera(
  viewAngle,
  screenWidth / screenHeight,
  nearDistance,
  farDistance,
);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the font for the text geometry
const fontLoader = new FontLoader();

// Load the font file and create the text geometry
fontLoader.load('MisterBrown_.json', function (font) {
  const textGeometry = new TextGeometry('Polydea', {
    font: font,
    size: 1.9,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.05,
    bevelSegments: 5
  });

  const shaderMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, // Set the color of the material
    roughness: 0.3, // Set the roughness property (0 for smooth, 1 for rough)
    metalness: 1, // Set the metalness property (0 for plastic, 1 for metal)
  });
  const textMesh = new THREE.Mesh(textGeometry, shaderMaterial);
  textMesh.position.set(0, 0, 0);
  const textContainer = new THREE.Object3D();
  textContainer.add(textMesh);
  scene.add(textContainer);

  // Add directional light to the scene
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.scale.set(2, 2, 2);
  directionalLight.position.set(10, 2, 1);
  //to increase intensity of light
  directionalLight.intensity = 2;
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.scale.set(2, 2, 2);
  directionalLight2.position.set(-10, 2, 1);
  directionalLight2.intensity = 2;
  scene.add(directionalLight2);

// Create a shader for the sky
const vertexShader1 = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader1 = `
uniform float time;
varying vec2 vUv;

float rand(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y; // Flip Y coordinate

  // Calculate the distance from the center
  vec2 center = vec2(0.5, 0.5); // Center coordinates
  float distance = length(uv - center);

  // Calculate the angle from the center
  float angle = atan(uv.y - center.y, uv.x - center.x);

  // Generate the cube pattern
  float cubes = smoothstep(0.51, 0.55, fract(sin(uv.x * 10.0) * 43758.5453 + sin(uv.y * 10.0) * 23421.631));

  // Generate the texture pattern
  float texture = rand(floor(uv.x * 10.0) + floor(uv.y * 10.0) * 100.0);

  // Adjust the visibility of the texture
  texture = pow(texture, 4.0);

  // Calculate the color based on the distance, angle, cube pattern, and texture
  vec3 color = vec3(
    0.5 + 0.2 * cos(angle + time) * cubes * texture,         // Red component
    0.5 + 0.25 * sin(distance + time) * cubes * texture,      // Green component
    0.5 + 0.2 * cos(distance + angle + time) * cubes * texture // Blue component
  );

  gl_FragColor = vec4(color, 1.0);
}


`;

const vertexShader2 = `
varying vec2 vUv;

void main()	{
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader2 = `
  uniform float time;
  varying vec2 vUv;

  void main()	{
    vec2 position = vUv;

    float color = 0.0;
    color += sin(position.x * cos(time / 15.0) * 80.0) + cos(position.y * cos(time / 15.0) * 10.0);
    color += sin(position.y * sin(time / 10.0) * 40.0) + cos(position.x * sin(time / 25.0) * 40.0);
    color += sin(position.x * sin(time / 5.0) * 10.0) + sin(position.y * sin(time / 35.0) * 80.0);
    color *= sin(time / 10.0) * 0.5;

    gl_FragColor = vec4(vec3(color, color * 0.5, sin(color + time / 3.0) * 0.75), 1.0);
  }
`;

const vertexShader3 = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader3 = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y; // Flip Y coordinate

    // Calculate the distance from the center
    vec2 center = vec2(0.5, 0.5); // Center coordinates
    float distance = length(uv - center);

    // Calculate the angle from the center
    float angle = atan(uv.y - center.y, uv.x - center.x);

    // Calculate the color based on the distance and angle
    vec3 color = vec3(
      mix(0.917, 0.415, sin(distance * 5.0 + time)),  // Red component
      mix(0.878, 0.604, cos(angle * 10.0 + time)),     // Green component
      mix(0.878, 0.467, sin((distance + angle) * 15.0 + time))  // Blue component
    );

    // Exclude white color
    if (color == vec3(1.0)) {
      color = vec3(0.917, 0.415, 0.878); // Use a different color as fallback
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;



//array of shaders
const shaders = [
  {
    vertexShader: vertexShader1,
    fragmentShader: fragmentShader1,
  },
  {
    vertexShader: vertexShader2,
    fragmentShader: fragmentShader2,
  },
  {
    vertexShader: vertexShader3,
    fragmentShader: fragmentShader3,
  },
  // Add more shaders here as needed
];

// Randomly select a shader from the array
const randomShader = shaders[Math.floor(Math.random() * shaders.length)];


// Create the shader material for the sky
const skyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() },
  },
  vertexShader: randomShader.vertexShader,
  fragmentShader: randomShader.fragmentShader,
  side: THREE.BackSide,
});

// Create the skybox mesh
const skybox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), skyMaterial);

// Scale the skybox to a large size
skybox.scale.setScalar(5000);

// Add the skybox to the scene
scene.add(skybox);


  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Update the resolution uniform when the window is resized
window.addEventListener('load', () => {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  camera.aspect = screenWidth / screenHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(screenWidth, screenHeight);
  skyMaterial.uniforms.resolution.value.set(screenWidth, screenHeight);
});

  let time = 0;
  let movementRange = 0.1;
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update the uniform value for time
    // shaderMaterial.uniforms.time.value += 0.05;
    // Update the uniform value for time for sky 
    skyMaterial.uniforms.time.value += 0.05;

         // Rotate the parent object (textContainer) on the y-axis
  const rotationSpeed = 0.006; // Adjust the speed of rotation
 // textContainer.rotation.y += rotationSpeed;
 textMesh.geometry.center();
  textMesh.rotation.y += rotationSpeed;

    // Adjust the z-position of the text
    time += 0.1;

  // Calculate the z position based on the updated time value
  const zPosition = Math.sin(time) * movementRange;

  // Set the new z position for the text mesh
  textMesh.position.z = 1 + zPosition;

    // Rotate the skybox
   
    skybox.rotation.y += (23.44 * Math.PI / 90) * 0.001; // Adjust the rotation speed by multiplying with a smaller value
    skybox.rotation.z += (23.44 * Math.PI / 90) * 0.001;
  
    // Render the scene with the camera
    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();
});
