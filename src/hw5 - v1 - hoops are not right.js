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
  rim.position.set(0.30, 3.05, 0);  // X is “toward centre” after rotation
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
  g.rotation.y = (side === 'left') ?  Math.PI / 2   // hoop at x < 0 → face +X
                                   : Math.PI / 2;  // hoop at x > 0 → face –X

  scene.add(g);
}


// ---------------------------------------------------------
// Static basketball at centre court
// ---------------------------------------------------------
function createBasketball() {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xd35400 })
  );
  ball.position.set(0, 0.24, 0);
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
}

// ---------------------------------------------------------
// Simple UI placeholders
// ---------------------------------------------------------
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
}
/* ===== End of HW-05 additions ===== */

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();