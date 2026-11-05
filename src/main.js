
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================================
// SCENE SETUP
// ======================================================

const container = document.getElementById('canvas3D');

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

container.style.width = '100vw';
container.style.height = '100vh';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202630);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(5, 3.5, 7);
camera.lookAt(0, 1.4, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.minDistance = 3;
controls.maxDistance = 15;
controls.update();

// ======================================================
// MATERIALS
// ======================================================

const yellow = new THREE.MeshStandardMaterial({
  color: 0xd6a332,
  metalness: 0.65,
  roughness: 0.55
});

const darkYellow = new THREE.MeshStandardMaterial({
  color: 0x8e641d,
  metalness: 0.65,
  roughness: 0.65
});

const metal = new THREE.MeshStandardMaterial({
  color: 0x747b7e,
  metalness: 0.85,
  roughness: 0.35
});

const darkMetal = new THREE.MeshStandardMaterial({
  color: 0x30383d,
  metalness: 0.75,
  roughness: 0.5
});

const rubber = new THREE.MeshStandardMaterial({
  color: 0x191d20,
  roughness: 0.92
});

const glass = new THREE.MeshStandardMaterial({
  color: 0x101a24,
  metalness: 0.25,
  roughness: 0.12
});

const eyeHighlight = new THREE.MeshBasicMaterial({
  color: 0x9ed5e8
});

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function box(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function cylinder(
  parent, radius, depth, material, x, y, z,
  rotationX = 0, rotationY = 0, rotationZ = 0
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, 24),
    material
  );

  mesh.position.set(x, y, z);
  mesh.rotation.set(rotationX, rotationY, rotationZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function sphere(parent, radius, material, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 16),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);

  return mesh;
}

// ======================================================
// ROBOT ROOT
// ======================================================

const robot = new THREE.Group();
scene.add(robot);

// ======================================================
// BODY / CHASSIS
// ======================================================

const body = new THREE.Group();
robot.add(body);

box(body, 1.9, 1.75, 1.45, yellow, 0, 1.55, 0);

box(body, 1.98, 0.14, 1.55, darkMetal, 0, 2.43, 0);
box(body, 1.98, 0.12, 1.55, darkMetal, 0, 0.66, 0);

// Front panel
box(body, 1.48, 1.25, 0.07, darkYellow, 0, 1.55, 0.76);
box(body, 1.35, 0.92, 0.08, yellow, 0, 1.58, 0.81);

// Front vents
for (let i = 0; i < 5; i++) {
  box(
    body, 0.8, 0.055, 0.025,
    darkMetal,
    0, 1.85 - i * 0.14, 0.86
  );
}

// Lower mechanical panel
box(body, 1.2, 0.25, 0.1, metal, 0, 0.98, 0.84);

// Small bolts
for (const x of [-0.72, 0.72]) {
  for (const y of [1.08, 2.1]) {
    cylinder(
      body, 0.055, 0.035, metal,
      x, y, 0.855,
      Math.PI / 2
    );
  }
}

// ======================================================
// NECK
// ======================================================

const neck = new THREE.Group();
neck.position.set(0, 2.48, 0);
robot.add(neck);

cylinder(
  neck, 0.17, 0.65, darkMetal,
  0, 0.27, 0
);

cylinder(
  neck, 0.24, 0.12, metal,
  0, 0.5, 0
);

// Head pivot
const head = new THREE.Group();
head.position.set(0, 0.65, 0.05);
neck.add(head);

box(head, 0.9, 0.17, 0.32, metal, 0, 0, 0);

// ======================================================
// BINOCULAR EYES
// ======================================================

function createEye(x) {
  const eye = new THREE.Group();
  eye.position.set(x, 0.1, 0.18);
  head.add(eye);

  // Outer optical housing
  cylinder(
    eye, 0.43, 0.5, metal,
    0, 0, 0,
    Math.PI / 2
  );

  // Forward-facing rim
  cylinder(
    eye, 0.38, 0.07, darkMetal,
    0, 0, 0.28,
    Math.PI / 2
  );

  // Glass lens
  cylinder(
    eye, 0.29, 0.045, glass,
    0, 0, 0.335,
    Math.PI / 2
  );

  // Inner pupil
  cylinder(
    eye, 0.17, 0.05, rubber,
    0, 0, 0.37,
    Math.PI / 2
  );

  // Eye reflection
  sphere(
    eye, 0.055, eyeHighlight,
    -0.09, 0.1, 0.406
  );

  // Top brow
  const brow = box(
    eye, 0.8, 0.1, 0.15,
    darkMetal,
    0, 0.37, 0.09
  );
  brow.rotation.z = x < 0 ? -0.1 : 0.1;

  return eye;
}

createEye(-0.47);
createEye(0.47);

// ======================================================
// ARTICULATED ARMS
// ======================================================

const arms = [];

function createArm(side) {
  const arm = new THREE.Group();

  arm.position.set(side * 1.03, 2.05, 0.03);
  robot.add(arm);
  arms.push(arm);

  // Shoulder
  sphere(arm, 0.22, darkMetal, 0, 0, 0);

  cylinder(
    arm, 0.18, 0.2, metal,
    side * 0.1, 0, 0,
    0, 0, Math.PI / 2
  );

  // Upper arm
  const upper = box(
    arm, 0.25, 0.7, 0.23,
    metal,
    side * 0.16, -0.42, 0.06
  );
  upper.rotation.z = side * 0.15;

  // Elbow
  sphere(
    arm, 0.18, darkMetal,
    side * 0.22, -0.8, 0.07
  );

  // Forearm
  const forearm = box(
    arm, 0.22, 0.57, 0.2,
    yellow,
    side * 0.29, -1.1, 0.12
  );

  forearm.rotation.z = side * -0.12;

  // Wrist
  sphere(
    arm, 0.13, metal,
    side * 0.3, -1.43, 0.13
  );

  // Claw palm
  box(
    arm, 0.35, 0.17, 0.22,
    darkMetal,
    side * 0.3, -1.57, 0.14
  );

  // Two fingers
  for (const offset of [-0.15, 0.15]) {
    box(
      arm, 0.09, 0.32, 0.13,
      metal,
      side * 0.3 + offset,
      -1.78, 0.14
    );
  }
}

createArm(-1);
createArm(1);

// ======================================================
// TANK TRACKS
// ======================================================

function createTrack(side) {
  const track = new THREE.Group();
  track.position.x = side * 1.08;
  robot.add(track);

  // Main track housing
  box(
    track, 0.4, 0.7, 1.8,
    rubber,
    0, 0.49, 0
  );

  // Inner metal frame
  box(
    track, 0.44, 0.38, 1.55,
    darkMetal,
    0, 0.5, 0
  );

  // Three visible wheels
  for (const z of [-0.62, 0, 0.62]) {
    cylinder(
      track, 0.25, 0.48, metal,
      0, 0.46, z,
      0, 0, Math.PI / 2
    );

    cylinder(
      track, 0.12, 0.51, darkMetal,
      0, 0.46, z,
      0, 0, Math.PI / 2
    );
  }

  // Rubber tread segments
  for (let i = 0; i < 12; i++) {
    const z = -0.86 + i * 0.155;

    box(
      track, 0.54, 0.08, 0.105,
      darkMetal,
      0, 0.12, z
    );

    box(
      track, 0.54, 0.08, 0.105,
      darkMetal,
      0, 0.86, z
    );
  }

  // End tread surfaces
  for (const z of [-0.91, 0.91]) {
    box(
      track, 0.54, 0.78, 0.09,
      rubber,
      0, 0.49, z
    );
  }
}

createTrack(-1);
createTrack(1);

// ======================================================
// FLOOR
// ======================================================

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({
    color: 0x505962,
    roughness: 0.9
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// ======================================================
// LIGHTING
// ======================================================

scene.add(new THREE.HemisphereLight(
  0xc7deff,
  0x473b2a,
  2
));

const keyLight = new THREE.DirectionalLight(
  0xffe3bb,
  3.2
);

keyLight.position.set(4, 8, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(
  0x92b9ff,
  1.8
);

rimLight.position.set(-5, 4, -4);
scene.add(rimLight);

// ======================================================
// ANIMATION
// ======================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Curious head tilt
  head.rotation.z = Math.sin(t * 0.85) * 0.055;
  head.rotation.y = Math.sin(t * 0.42) * 0.12;

  // Small neck movement
  neck.rotation.y = Math.sin(t * 0.3) * 0.06;

  // Gentle arm motion
  arms[0].rotation.z = Math.sin(t * 0.8) * 0.065;
  arms[1].rotation.z = -Math.sin(t * 0.8) * 0.065;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ======================================================
// WINDOW RESIZE
// ======================================================

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});
