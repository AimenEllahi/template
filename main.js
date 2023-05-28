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
  viewAngle = 85,
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
fontLoader.load('Roboto_Regular.json', function (font) {
  const textGeometry = new TextGeometry('MAD', {
    font: font,
    size: 1.55,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 5
  });

  const vertexShader = `
  precision mediump float;
  precision mediump int;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 position;
  attribute vec4 color;

  varying vec3 vPosition;
  varying vec4 vColor;

  void main() {
    vPosition = position;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  precision mediump int;

  uniform float time;

  varying vec3 vPosition;
  varying vec4 vColor;

  void main() {
    vec4 color = vec4(vColor);
    color.r += sin(vPosition.x * 10.0 + time) * 0.5;

    gl_FragColor = color;
  }
`;

const shaderMaterial = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
});



  const textMesh = new THREE.Mesh(textGeometry, shaderMaterial);
  textMesh.position.set(-2, 0, 0);
  scene.add(textMesh);

  // Add directional light to the scene
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Load skybox textures and create the skybox
  // const textureLoader = new CubeTextureLoader();
  // const skyTextures = [
  //   sky,
  //   sky,
  //   sky,
  //   sky,
  //   sky,
  //   sky
  // ];

  // const skybox = textureLoader.load(skyTextures);
  // scene.background = skybox;

// Create a shader for the sky
// Create a shader for the sky
const vertexShaderSky = `
  varying vec3 vWorldPosition;
  varying vec2 vUv; // Add varying for UV coordinates

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vUv = uv; // Pass UV coordinates to the fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderSky = `
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform float offset;
  uniform float exponent;
  uniform float time; // New uniform for animation

  varying vec3 vWorldPosition;
  varying vec2 vUv; // UV coordinates

  // Image texture for the front side of the skybox
  uniform sampler2D frontTexture;

  void main() {
    float h = normalize(vWorldPosition + offset).y;
    
    // Calculate the animated colors based on time
    vec3 animatedColor1 = mix(color1, color2, (sin(time * 0.2) + 1.0) * 0.5); // Transition between color1 and color2
    vec3 animatedColor2 = mix(color2, color3, (sin(time * 0.1) + 1.0) * 0.5); // Transition between color2 and color3
    
    // Mix the animated colors based on height
    vec3 color = mix(animatedColor1, animatedColor2, max(pow(max(h, 0.0), exponent), 0.0));

    // Apply the texture to the front side
    if (vUv.y > 0.5) {
      gl_FragColor = texture2D(frontTexture, vec2(vUv.x, 1.0 - vUv.y));
    } else {
      gl_FragColor = vec4(color, 1.0);
    }
  }
`;


// Create the shader material for the sky
const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShaderSky,
  fragmentShader: fragmentShaderSky,
  uniforms: {
    color1: { value: new THREE.Color(0xff00f4) }, // Set initial color1
    color2: { value: new THREE.Color(0x00ff00) }, // Set initial color2
    color3: { value: new THREE.Color(0x0f00ff) }, // Set initial color3
    offset: { value: 33 },
    exponent: { value: 0.6 },
    time: { value: 0 }, // Initialize time uniform
    frontTexture: { value: new THREE.TextureLoader().load(sky) } // Image for the front side
  },
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

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update the uniform value for time
    shaderMaterial.uniforms.time.value += 0.05;
    // Update the uniform value for time for sky 
    skyMaterial.uniforms.time.value += 0.05;

    

    // Adjust the z-position of the text
    const movementSpeed = 0.005; // Adjust the speed of movement
    const movementRange = 0.2; // Adjust the range of movement
    const zPosition = Math.sin(shaderMaterial.uniforms.time.value) * movementRange;
    textMesh.position.z = 1 + zPosition;

    // Adjust the thickness of the text
    const thickness = 0.1 + Math.sin(shaderMaterial.uniforms.time.value * 0.5) * 0.1;
    textGeometry.parameters.height = thickness;
    textGeometry.parameters.bevelThickness = thickness * 0.1;
    textGeometry.parameters.bevelSize = thickness * 0.1;

    // Rotate the skybox
   
    skybox.rotation.y += (23.44 * Math.PI / 90) * 0.4; // Adjust the rotation speed by multiplying with a smaller value
skybox.rotation.z += (23.44 * Math.PI / 90) * 0.4;

  
    // Render the scene with the camera
    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();
});
