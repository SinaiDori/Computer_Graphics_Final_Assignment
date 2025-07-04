import { OrbitControls } from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

// Configure shadow camera for better shadow coverage
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function createBasketballCourt() {
  // Out-of-bounds floor (larger, lighter color)
  const outOfBoundsGeometry = new THREE.BoxGeometry(36, 0.18, 20);
  const outOfBoundsMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a4d2e,  // Dark green color
    shininess: 30
  });
  const outOfBounds = new THREE.Mesh(outOfBoundsGeometry, outOfBoundsMaterial);
  outOfBounds.position.y = -0.05; // Slightly below court
  outOfBounds.receiveShadow = true;
  scene.add(outOfBounds);

  // Court floor - on top of out-of-bounds area
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
}

// ---------------------------------------------------------
// Court/hoop parameters (metres) – chosen to match the
// 30 × 15 court floor already in the boiler-plate.
// ---------------------------------------------------------
const COURT_LENGTH = 30;   // X-axis span  (-15 → +15)
const COURT_WIDTH = 15;   // Z-axis span  (-7.5 → +7.5)
const HOOP_OFFSET = 1.2;  // Backboard plane inset from baseline

// Create all elements
createBasketballCourt();
createCourtLines();
createHoop(-COURT_LENGTH / 2 + HOOP_OFFSET, 'left');
createHoop(COURT_LENGTH / 2 - HOOP_OFFSET, 'right');
createBasketball();
createUI();

// ---------------------------------------------------------
// White court markings
// ---------------------------------------------------------
function createCourtLines() {
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const y = 0.11;           // 0.01 m above floor top

  /* Perimeter lines (sidelines and baselines) */
  // Top sideline
  addLine(
    new THREE.Vector3(-COURT_LENGTH / 2, y, -COURT_WIDTH / 2),
    new THREE.Vector3(COURT_LENGTH / 2, y, -COURT_WIDTH / 2)
  );
  // Bottom sideline
  addLine(
    new THREE.Vector3(-COURT_LENGTH / 2, y, COURT_WIDTH / 2),
    new THREE.Vector3(COURT_LENGTH / 2, y, COURT_WIDTH / 2)
  );
  // Left baseline
  addLine(
    new THREE.Vector3(-COURT_LENGTH / 2, y, -COURT_WIDTH / 2),
    new THREE.Vector3(-COURT_LENGTH / 2, y, COURT_WIDTH / 2)
  );
  // Right baseline
  addLine(
    new THREE.Vector3(COURT_LENGTH / 2, y, -COURT_WIDTH / 2),
    new THREE.Vector3(COURT_LENGTH / 2, y, COURT_WIDTH / 2)
  );

  /* centre line */
  addLine(
    new THREE.Vector3(0, y, -COURT_WIDTH / 2),
    new THREE.Vector3(0, y, COURT_WIDTH / 2)
  );

  /* centre circle */
  addCircle(1.8);

  /* three-point lines - arc with connecting straight lines */
  const threePointRadius = 6.75;
  const sideLineDistance = 0.9; // Distance from sideline for the straight portions

  // Calculate where the arc intersects with the straight line
  const maxZ = COURT_WIDTH / 2 - sideLineDistance; // Maximum Z where we switch from arc to straight line
  const arcAngle = Math.asin(maxZ / threePointRadius); // Angle where arc meets straight line

  // Left three-point line
  const leftCenter = -COURT_LENGTH / 2 + HOOP_OFFSET;
  addThreePointArc(leftCenter, threePointRadius, arcAngle, false);
  // Straight lines parallel to sideline
  const leftArcX = leftCenter + Math.cos(arcAngle) * threePointRadius;
  addLine(
    new THREE.Vector3(leftArcX, y, maxZ),
    new THREE.Vector3(-COURT_LENGTH / 2, y, maxZ)
  );
  addLine(
    new THREE.Vector3(leftArcX, y, -maxZ),
    new THREE.Vector3(-COURT_LENGTH / 2, y, -maxZ)
  );

  // Right three-point line  
  const rightCenter = COURT_LENGTH / 2 - HOOP_OFFSET;
  addThreePointArc(rightCenter, threePointRadius, arcAngle, true);
  // Straight lines parallel to sideline
  const rightArcX = rightCenter - Math.cos(arcAngle) * threePointRadius;
  addLine(
    new THREE.Vector3(rightArcX, y, maxZ),
    new THREE.Vector3(COURT_LENGTH / 2, y, maxZ)
  );
  addLine(
    new THREE.Vector3(rightArcX, y, -maxZ),
    new THREE.Vector3(COURT_LENGTH / 2, y, -maxZ)
  );

  // Helper function for three-point arc
  function addThreePointArc(xCenter, radius, maxAngle, flip) {
    const pts = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
      // Arc from -maxAngle to +maxAngle
      const t = -maxAngle + (i / segments) * (2 * maxAngle);
      const x = xCenter + (flip ? -Math.cos(t) : Math.cos(t)) * radius;
      const z = Math.sin(t) * radius;
      pts.push(new THREE.Vector3(x, y, z));
    }

    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      mat
    ));
  }

  // helpers
  function addLine(a, b) {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    scene.add(new THREE.Line(geo, mat));
  }
  function addCircle(radius) {
    const pts = [];
    const seg = 64;
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(t) * radius,
        y,
        Math.sin(t) * radius
      ));
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      mat
    ));
  }
}

// ---------------------------------------------------------
// One hoop group (backboard, rim, net, pole & arm)
// ---------------------------------------------------------
function createHoop(xPos, side) {
  const g = new THREE.Group();
  g.position.x = xPos;

  /* backboard – faces centre court after we rotate the group */
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 1, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
  );
  back.position.set(0, 3.05, 0);     // at rim height
  back.castShadow = true;
  g.add(back);

  /* rim – attached to front of backboard */
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.02, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0xff8c00 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0.025 + 0.23, 3.05, 0);  // Front of backboard (0.025) + rim radius (0.23)
  rim.castShadow = true;
  g.add(rim);

  // /* net (8 simple strands) */
  // const netMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  // const netPts = [];
  // const strands = 8, h = 0.5;
  // for (let i = 0; i < strands; i++) {
  //   const a = (i / strands) * Math.PI * 2;
  //   const xt = 0.025 + 0.23;           // same x as rim centre
  //   const zt = Math.sin(a) * 0.23;
  //   netPts.push(
  //     new THREE.Vector3(xt, 3.05, zt),
  //     new THREE.Vector3(xt * 0.6, 3.05 - h, zt * 0.6)
  //   );
  // }
  /* net (12 strands distributed around the rim) */
  const netMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netPts = [];
  const strands = 12;  // Number of strands
  const netHeight = 0.4;  // Net height
  const rimX = 0.025 + 0.23;  // rim center X position
  const rimRadius = 0.23;  // rim radius

  for (let i = 0; i < strands; i++) {
    const angle = (i / strands) * Math.PI * 2;

    // Top attachment point - on the rim circumference
    // Rim is horizontal, so we vary X and Z, keep Y constant
    const xt = rimX + Math.cos(angle) * rimRadius * 0.9;  // 0.9 to attach slightly inside
    const yt = 3.05;  // Keep at rim height
    const zt = Math.sin(angle) * rimRadius * 0.9;

    // Bottom point - narrower cone shape
    const bottomRadius = 0.08;
    const xb = rimX;  // Center at bottom
    const yb = 3.05 - netHeight;
    const zb = Math.sin(angle) * bottomRadius;

    netPts.push(
      new THREE.Vector3(xt, yt, zt),
      new THREE.Vector3(xb, yb, zb)
    );
  }
  g.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(netPts),
    netMat
  ));

  /* support pole - vertical, behind the backboard */
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 3.5, 12),
    poleMat
  );
  pole.position.set(-2.5, 1.75, 0);   // Well behind the backboard, in out-of-bounds area
  pole.castShadow = pole.receiveShadow = true;
  g.add(pole);

  /* horizontal support arm - connects pole to backboard */
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.1, 0.1),  // Longer arm to reach from out-of-bounds pole
    poleMat
  );
  arm.position.set(-1.25, 3.05, 0);  // Centered between pole and backboard
  arm.rotation.z = 0;  // Perfectly horizontal
  arm.castShadow = true;
  arm.receiveShadow = true;
  g.add(arm);

  /* rotate the whole group so the backboard faces centre court */
  g.rotation.y = (side === 'left') ? 0 : Math.PI;  // left hoop faces +X, right hoop faces -X

  scene.add(g);
}

// ---------------------------------------------------------
// Static basketball at centre court
// ---------------------------------------------------------
function createBasketball() {
  const R = 0.24;     // ball radius
  const t = 0.005;    // seam thickness
  const colorBall = 0xd35400;
  const colorSeam = 0x000000;

  // 1) the orange sphere
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 32),
    new THREE.MeshStandardMaterial({ color: colorBall })
  );
  ball.position.set(0, R + 0.1, 0); // lift it just above the floor
  ball.castShadow = true;

  // 2) material for all the seams
  const seamMat = new THREE.MeshBasicMaterial({ color: colorSeam });

  // small helper to add a torus seam at a given x/y/z rotation
  function addRing(rx = 0, ry = 0, rz = 0) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(R, t, 8, 128),
      seamMat
    );
    ring.rotation.set(rx, ry, rz);
    ball.add(ring);
  }

  // equator (XY plane)
  addRing(0, 0, 0);

  // main meridian (YZ plane)
  addRing(0, Math.PI / 2, 0);

  // two “45° tilt” great-circles
  //  • start in the YZ plane, then rotate 45° around the vertical (Y) axis
  addRing(0, Math.PI / 2 + Math.PI / 4, 0);
  addRing(0, Math.PI / 2 - Math.PI / 4, 0);

  scene.add(ball);
}


// ---------------------------------------------------------
// UI Framework (Basic HTML containers for future use)
// ---------------------------------------------------------
function createUI() {
  const styleBox = {
    position: 'absolute',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  };

  /* score display container */
  const score = document.createElement('div');
  Object.assign(score.style, styleBox, { top: '20px', left: '20px' });
  score.id = 'scoreDisplay';
  score.textContent = 'Score: 0 – 0';
  document.body.appendChild(score);

  /* controls display container */
  const controls = document.createElement('div');
  Object.assign(controls.style, styleBox, { top: '60px', left: '20px', width: '200px' });
  controls.id = 'controlsDisplay';
  controls.innerHTML = `
    <strong>Camera Controls:</strong><br>
    O: Toggle orbit camera<br>
    Mouse: Rotate view<br>
    Mouse Wheel: Zoom in/out<br>
    Cmd/Ctrl + Mouse: Pan/move camera position
  `;
  document.body.appendChild(controls);
}

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Enable panning
controls.enablePan = true;
controls.panSpeed = 2.0;
controls.screenSpacePanning = true;

// Handle key events - ONLY for camera controls in HW05
function handleKeyDown(e) {
  if (e.key.toLowerCase() === "o") {
    isOrbitEnabled = !isOrbitEnabled;
    controls.enabled = isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Handle window resize
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update orbit controls
  controls.update();

  renderer.render(scene, camera);
}

animate();