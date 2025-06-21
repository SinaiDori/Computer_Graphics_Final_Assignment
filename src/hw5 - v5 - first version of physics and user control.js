import {OrbitControls} from './OrbitControls.js'

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

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// ---------------------------------------------------------
// Global variables for ball physics
// ---------------------------------------------------------
let basketball; // Will hold the ball mesh
const ballPosition = new THREE.Vector3(0, 0.34, 0);
const ballVelocity = new THREE.Vector3(0, 0, 0);
const ballRadius = 0.24;
const gravity = -9.81;
const floorHeight = 0.1; // Top of the court floor
const bounceDamping = 0.7;

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}

// Create all elements
createBasketballCourt();

// ---------------------------------------------------------
// Court/hoop parameters (metres) – chosen to match the
// 30 × 15 court floor already in the boiler-plate.
// ---------------------------------------------------------
const COURT_LENGTH = 30;   // X-axis span  (-15 → +15)
const COURT_WIDTH  = 15;   // Z-axis span  (-7.5 → +7.5)
const HOOP_OFFSET  = 1.2;  // Backboard plane inset from baseline

// ••• BUILDERS •••
createCourtLines();
createHoop(-COURT_LENGTH / 2 + HOOP_OFFSET, 'left');
createHoop( COURT_LENGTH / 2 - HOOP_OFFSET, 'right');
createBasketball();
createUI();

// ---------------------------------------------------------
// White court markings
// ---------------------------------------------------------
function createCourtLines() {
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const y = 0.11;           // 0.01 m above floor top

  /* centre line */
  addLine(
    new THREE.Vector3(0, y, -COURT_WIDTH / 2),
    new THREE.Vector3(0, y,  COURT_WIDTH / 2)
  );

  /* centre circle */
  addCircle(1.8);

  /* three-point arcs */
  const r = 6.75;
  addArc(-COURT_LENGTH / 2 + HOOP_OFFSET + 0.15, r);         // left goal
  addArc( COURT_LENGTH / 2 - HOOP_OFFSET - 0.15, r, true);   // right goal

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
  function addArc(xCentre, radius, flip = false) {
    const pts = [];
    const seg = 64;
    const start = Math.PI / 2 + 0.14;
    const end   = -Math.PI / 2 - 0.14;
    for (let i = 0; i <= seg; i++) {
      const t = start + (i / seg) * (end - start);
      const x = xCentre;
      const z = Math.cos(t) * radius;
      const yArc = Math.sin(t) * radius;
      pts.push(new THREE.Vector3(
        x,
        y,
        (flip ? -yArc : yArc)
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
    // depth 0.05 m in +X/-X, width 1.8 m across Z
    new THREE.BoxGeometry(0.05, 1, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
  );
  back.position.set(0, 3.05, 0);     // put its centre at rim height
  back.castShadow = true;
  g.add(back);

  /* rim – sits 0.30 m in front of the backboard (toward centre court) */
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.02, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0xff8c00 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0.30, 3.05, 0);  // X is "toward centre" after rotation
  rim.castShadow = true;
  g.add(rim);

  /* net (8 simple strands) */
  const netMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netPts = [];
  const strands = 8, h = 0.5;
  for (let i = 0; i < strands; i++) {
    const a = (i / strands) * Math.PI * 2;
    const xt = 0.30;                       // same x as rim centre
    const zt = Math.sin(a) * 0.23;
    netPts.push(
      new THREE.Vector3(xt, 3.05, zt),
      new THREE.Vector3(xt * 0.6, 3.05 - h, zt * 0.6)
    );
  }
  g.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(netPts),
    netMat
  ));

  /* support pole */
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 3.5, 12),
    poleMat
  );
  pole.position.set(-0.6, 1.75, 0);   // tucked behind the board
  pole.castShadow = pole.receiveShadow = true;
  g.add(pole);

  /* angled support arm */
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 1),
    poleMat
  );
  arm.position.set(-0.3, 3.0, 0);
  arm.rotation.y = Math.PI / 10;
  g.add(arm);

  /* rotate the whole group so the backboard faces centre court */
  g.rotation.y = (side === 'left') ? 0 : Math.PI;  // left hoop faces +X, right hoop faces -X

  scene.add(g);
}

// ---------------------------------------------------------
// Basketball with physics support
// ---------------------------------------------------------
function createBasketball() {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xd35400 })
  );
  ball.position.copy(ballPosition);
  ball.castShadow = true;

  /* seams – 3 orthogonal lat/lon circles */
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const seamGeo = new THREE.TorusGeometry(0.24, 0.005, 8, 100);

  const seam1 = new THREE.Mesh(seamGeo, seamMat);
  seam1.rotation.z = Math.PI / 2;
  const seam2 = new THREE.Mesh(seamGeo, seamMat);
  seam2.rotation.x = Math.PI / 2;
  const seam3 = new THREE.Mesh(seamGeo, seamMat);
  seam3.rotation.y = Math.PI / 2;
  ball.add(seam1, seam2, seam3);

  scene.add(ball);
  basketball = ball; // Store reference for physics updates
}

// ---------------------------------------------------------
// Ball physics and controls
// ---------------------------------------------------------
let isMovingBall = false;
let shotPower = 0;
let maxShotPower = 15;
let powerIncreasing = true;

function updateBallPhysics(deltaTime) {
  if (!isMovingBall || !deltaTime || deltaTime > 0.1) return; // Safety check

  // Apply gravity
  ballVelocity.y += gravity * deltaTime;

  // Update position
  ballPosition.add(ballVelocity.clone().multiplyScalar(deltaTime));

  // Ground collision
  const minY = floorHeight + ballRadius;
  if (ballPosition.y <= minY) {
    ballPosition.y = minY;
    if (ballVelocity.y < 0) {
      ballVelocity.y *= -bounceDamping;
      // Stop tiny bounces
      if (Math.abs(ballVelocity.y) < 0.5) {
        ballVelocity.y = 0;
        if (ballVelocity.length() < 0.1) {
          isMovingBall = false;
        }
      }
    }
  }

  // Court boundaries
  const maxX = COURT_LENGTH / 2 - ballRadius;
  const maxZ = COURT_WIDTH / 2 - ballRadius;
  
  if (ballPosition.x > maxX || ballPosition.x < -maxX) {
    ballPosition.x = Math.max(-maxX, Math.min(maxX, ballPosition.x));
    ballVelocity.x *= -bounceDamping;
  }
  
  if (ballPosition.z > maxZ || ballPosition.z < -maxZ) {
    ballPosition.z = Math.max(-maxZ, Math.min(maxZ, ballPosition.z));
    ballVelocity.z *= -bounceDamping;
  }

  // Apply air resistance
  ballVelocity.multiplyScalar(0.99);

  // Update ball mesh position
  basketball.position.copy(ballPosition);
}

function resetBall() {
  ballPosition.set(0, 0.34, 0);
  ballVelocity.set(0, 0, 0);
  isMovingBall = false;
  shotPower = 0;
  basketball.position.copy(ballPosition);
  updatePowerMeter();
}

function shootBall(direction, power) {
  ballVelocity.copy(direction.normalize().multiplyScalar(power));
  ballVelocity.y = Math.max(ballVelocity.y, 2); // Minimum upward velocity
  isMovingBall = true;
}

// ---------------------------------------------------------
// UI and Controls
// ---------------------------------------------------------
let keysPressed = {};

function createUI() {
  const styleBox = {
    position: 'absolute',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  };

  /* score */
  const score = document.createElement('div');
  Object.assign(score.style, styleBox, { top: '20px', left: '20px' });
  score.textContent = 'Score: 0 – 0';
  document.body.appendChild(score);

  /* power meter */
  const powerMeter = document.createElement('div');
  Object.assign(powerMeter.style, styleBox, { top: '60px', left: '20px' });
  powerMeter.id = 'powerMeter';
  powerMeter.textContent = 'Shot Power: 0%';
  document.body.appendChild(powerMeter);

  /* instructions */
  const instructions = document.createElement('div');
  Object.assign(instructions.style, styleBox, { top: '100px', left: '20px', width: '200px' });
  instructions.innerHTML = `
    <strong>Basketball Controls:</strong><br>
    Arrow Keys: Move ball<br>
    SPACE: Hold for power, release to shoot<br>
    R: Reset ball position<br>
    O: Toggle orbit camera
  `;
  document.body.appendChild(instructions);
}

function updatePowerMeter() {
  const powerMeterEl = document.getElementById('powerMeter');
  if (powerMeterEl) {
    const percentage = Math.round((shotPower / maxShotPower) * 100);
    powerMeterEl.textContent = `Shot Power: ${percentage}%`;
    powerMeterEl.style.color = percentage > 80 ? '#ff4444' : '#fff';
  }
}

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Handle key events
function handleKeyDown(e) {
  keysPressed[e.key.toLowerCase()] = true;
  
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
  
  if (e.key.toLowerCase() === "r") {
    resetBall();
  }
  
  // Start charging shot power
  if (e.key === " " && !isMovingBall) {
    e.preventDefault();
    shotPower = 0;
    powerIncreasing = true;
  }
}

function handleKeyUp(e) {
  keysPressed[e.key.toLowerCase()] = false;
  
  // Release shot
  if (e.key === " " && shotPower > 0 && !isMovingBall) {
    e.preventDefault();
    const direction = new THREE.Vector3();
    // Shoot toward nearest hoop based on ball position
    if (ballPosition.x < 0) {
      direction.set(1, 0.5, 0); // Toward right hoop
    } else {
      direction.set(-1, 0.5, 0); // Toward left hoop
    }
    shootBall(direction, shotPower);
    shotPower = 0;
    updatePowerMeter();
  }
}

function handleBallMovement() {
  if (isMovingBall) return; // Don't move ball while it's in motion
  
  const moveSpeed = 0.1;
  let moved = false;
  
  if (keysPressed['arrowleft']) {
    ballPosition.x -= moveSpeed;
    moved = true;
  }
  if (keysPressed['arrowright']) {
    ballPosition.x += moveSpeed;
    moved = true;
  }
  if (keysPressed['arrowup']) {
    ballPosition.z -= moveSpeed;
    moved = true;
  }
  if (keysPressed['arrowdown']) {
    ballPosition.z += moveSpeed;
    moved = true;
  }
  
  // Keep ball within court bounds
  const maxX = COURT_LENGTH / 2 - ballRadius;
  const maxZ = COURT_WIDTH / 2 - ballRadius;
  ballPosition.x = Math.max(-maxX, Math.min(maxX, ballPosition.x));
  ballPosition.z = Math.max(-maxZ, Math.min(maxZ, ballPosition.z));
  
  if (moved) {
    basketball.position.copy(ballPosition);
  }
  
  // Update shot power while space is held
  if (keysPressed[' '] && !isMovingBall) {
    if (powerIncreasing) {
      shotPower += 0.3;
      if (shotPower >= maxShotPower) {
        shotPower = maxShotPower;
        powerIncreasing = false;
      }
    } else {
      shotPower -= 0.3;
      if (shotPower <= 0) {
        shotPower = 0;
        powerIncreasing = true;
      }
    }
    updatePowerMeter();
  }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Animation function
let lastTime = 0;

function animate(currentTime = 0) {
  requestAnimationFrame(animate);
  
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  // Handle ball movement and physics
  handleBallMovement();
  updateBallPhysics(deltaTime);
  
  renderer.render(scene, camera);
}

animate();