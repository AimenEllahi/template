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
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float time;
    uniform vec2 resolution;

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
        0.5 + 0.5 * cos(angle + time),         // Red component
        0.5 + 0.5 * sin(distance + time),      // Green component
        0.5 + 0.5 * cos(distance + angle + time) // Blue component
      );

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const shaderMaterial = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(screenWidth, screenHeight) }
    }
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
const vertexShaderSky = `
varying vec2 vUv;

void main()	{
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderSky = `
varying vec2 vUv;
  uniform float time;

  void main()	{
    vec2 p = -1.0 + 2.0 * vUv;
    float a = time * 40.0;
    float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

    e = 400.0 * ( p.x * 0.5 + 0.5 );
    f = 400.0 * ( p.y * 0.5 + 0.5 );
    i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
    d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
    r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
    q = f / r;
    e = ( r * cos( q ) ) - a / 2.0;
    f = ( r * sin( q ) ) - a / 2.0;
    d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
    h = ( ( f + d ) + a / 2.0 ) * g;
    i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
    h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
    h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
    i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
    i = mod( i / 5.6, 256.0 ) / 64.0;
    if ( i < 0.0 ) i += 4.0;
    if ( i >= 2.0 ) i = 4.0 - i;
    d = r / 350.0;
    d += sin( d * d * 8.0 ) * 0.52;
    f = ( sin( a * g ) + 1.0 ) / 2.0;
    gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );
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
    // frontTexture: { value: new THREE.TextureLoader().load(sky) } // Image for the front side
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
   
    skybox.rotation.y += (23.44 * Math.PI / 90) * 0.01; // Adjust the rotation speed by multiplying with a smaller value
skybox.rotation.z += (23.44 * Math.PI / 90) * 0.01;

  
    // Render the scene with the camera
    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();
});
