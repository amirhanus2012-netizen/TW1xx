/**
 * High-Precision Procedural 3D VR Headset Generator (Ultra-Constructive CAD Edition)
 * Pure solid 3D geometry - NO jagged 1px wireframe lines or pixelated edges.
 * Solid curved visor, chrome bezels, extruded chassis, solid tubular neon lightbars,
 * tracking camera pods, pancake lenses, side arms, knurled dial, and comfort cushion.
 */

const VR_THEMES = {
  obsidian: {
    name: 'Cosmic Obsidian',
    chassis: 0x141824,       // Deep aerospace polymer
    chassisAccent: 0x222a3d, // Secondary shell tone
    visor: 0x050812,         // Ultra-deep optical glass
    metal: 0x48587b,         // Brushed aerospace titanium
    metalBright: 0x8ea0c4,   // Polished chrome highlights
    accent: 0x00f0ff,        // Cyber cyan glow
    strap: 0x181d2c,
    cushion: 0x0c0f17,
    emissiveIntensity: 1.5
  },
  glacier: {
    name: 'Glacier Pure',
    chassis: 0xf2f6fd,       // Ceramic white
    chassisAccent: 0xdde5f4, // Silver metallic panel
    visor: 0x0c1222,         // Smoked contrast glass
    metal: 0xb0c0dc,         // Polished aluminum
    metalBright: 0xffffff,   // Bright specular metal
    accent: 0x00b4d8,        // Ice blue
    strap: 0x96a4bc,
    cushion: 0x1e2430,
    emissiveIntensity: 1.2
  },
  cyber: {
    name: 'Cyber Neon',
    chassis: 0x0e101a,       // Stealth matte black
    chassisAccent: 0x211736, // Deep neon purple frame
    visor: 0x060712,         // Obsidian glass
    metal: 0x5a2d8a,         // Anodized violet
    metalBright: 0x00f0ff,   // Cyan highlights
    accent: 0xff007f,        // Neon magenta glow
    strap: 0x1a1329,
    cushion: 0x0b0813,
    emissiveIntensity: 1.7
  },
  titanium: {
    name: 'Titanium Gold',
    chassis: 0x262529,       // Gunmetal dark alloy
    chassisAccent: 0x3d383a, // Warm bronze panel
    visor: 0x141113,         // Smoked quartz
    metal: 0xd4a359,         // Brushed gold/brass alloy
    metalBright: 0xffe082,   // Polished gold
    accent: 0xffb703,        // Amber gold glow
    strap: 0x242022,
    cushion: 0x141214,
    emissiveIntensity: 1.4
  }
};

// High-Resolution Procedural HUD Texture for Inner Displays
function createInternalScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep cyber background
  ctx.fillStyle = '#010410';
  ctx.fillRect(0, 0, 512, 512);

  // Smooth Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 2;
  const step = 32;
  for (let x = 0; x < 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Circular HUD Ring
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 120, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#ff007f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 85, 0, Math.PI * 1.5);
  ctx.stroke();

  // Crosshair telemetry
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(256, 100); ctx.lineTo(256, 170);
  ctx.moveTo(256, 342); ctx.lineTo(256, 412);
  ctx.moveTo(100, 256); ctx.lineTo(170, 256);
  ctx.moveTo(342, 256); ctx.lineTo(412, 256);
  ctx.stroke();

  // High-Tech Text
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('NEXUS BIONIC OS 5.0', 135, 75);
  ctx.fillText('4K MICRO-OLED // 120Hz', 120, 450);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('PC LINK: 40Gbps OK', 145, 260);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates a complete VR Headset 3D model with solid constructive parts
 */
function createVRHeadsetModel(options = {}) {
  const isDetailed = options.isDetailed !== false;
  const themeKey = options.theme || 'obsidian';
  const theme = VR_THEMES[themeKey] || VR_THEMES.obsidian;

  const headsetGroup = new THREE.Group();
  headsetGroup.name = 'VR_Headset_Root';

  // Dynamic materials collection for real-time live customization
  const dynamicMaterials = {
    chassis: [],
    metal: [],
    metalBright: [],
    visor: [],
    led: [],
    lens: []
  };

  // Dimensions
  const chassisW = 3.2;
  const chassisH = 1.6;
  const chassisD = 1.15;
  const w2 = chassisW / 2;
  const h2 = chassisH / 2;

  // =========================================================================
  // 1. SOLID CHASSIS BODY (Extruded Rounded Polymer Shell with Curvature)
  // =========================================================================
  const chassisShape = new THREE.Shape();
  const rad = 0.44;

  chassisShape.moveTo(-w2 + rad, -h2);
  chassisShape.lineTo(w2 - rad, -h2);
  chassisShape.quadraticCurveTo(w2, -h2, w2, -h2 + rad);
  chassisShape.lineTo(w2, h2 - rad);
  chassisShape.quadraticCurveTo(w2, h2, w2 - rad, h2);
  chassisShape.lineTo(-w2 + rad, h2);
  chassisShape.quadraticCurveTo(-w2, h2, -w2, h2 - rad);
  chassisShape.lineTo(-w2, -h2 + rad);
  chassisShape.quadraticCurveTo(-w2, -h2, -w2 + rad, -h2);

  const extrudeSettings = {
    depth: chassisD,
    bevelEnabled: true,
    bevelSegments: isDetailed ? 10 : 4,
    steps: 1,
    curveSegments: isDetailed ? 36 : 16,
    bevelSize: 0.18,
    bevelThickness: 0.16
  };

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
  chassisGeo.center();

  // Ergonomic face curvature along Z axis
  const posAttr = chassisGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setZ(i, z + Math.cos((x / w2) * (Math.PI / 2.7)) * 0.22);
  }
  chassisGeo.computeVertexNormals();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: theme.chassis,
    metalness: 0.7,
    roughness: 0.25,
    envMapIntensity: 1.5
  });
  dynamicMaterials.chassis.push(chassisMat);

  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  headsetGroup.add(chassisMesh);

  // =========================================================================
  // 2. SOLID METALLIC BEZEL FRAME (Smooth Torus Rim around Visor)
  // =========================================================================
  const frameGeo = new THREE.TorusGeometry(1.62, 0.065, 16, 64);
  frameGeo.scale(0.98, 0.52, 1.0);
  const metalMat = new THREE.MeshStandardMaterial({
    color: theme.metal,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 2.0
  });
  dynamicMaterials.metal.push(metalMat);

  const frameMesh = new THREE.Mesh(frameGeo, metalMat);
  frameMesh.position.set(0, 0, chassisD / 2 + 0.12);
  headsetGroup.add(frameMesh);

  // =========================================================================
  // 3. SOLID CURVED GLASS VISOR (Smooth Reflective Shield)
  // =========================================================================
  const visorW = 3.05;
  const visorH = 1.48;
  const vw2 = visorW / 2;
  const vh2 = visorH / 2;
  const vr = 0.42;

  const visorShape = new THREE.Shape();
  visorShape.moveTo(-vw2 + vr, -vh2);
  visorShape.lineTo(vw2 - vr, -vh2);
  visorShape.quadraticCurveTo(vw2, -vh2, vw2, -vh2 + vr);
  visorShape.lineTo(vw2, vh2 - vr);
  visorShape.quadraticCurveTo(vw2, vh2, vw2 - vr, vh2);
  visorShape.lineTo(-vw2 + vr, vh2);
  visorShape.quadraticCurveTo(-vw2, vh2, -vw2, vh2 - vr);
  visorShape.lineTo(-vw2, -vh2 + vr);
  visorShape.quadraticCurveTo(-vw2, -vh2, -vw2 + vr, -vh2);

  const visorGeo = new THREE.ExtrudeGeometry(visorShape, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSegments: isDetailed ? 10 : 4,
    curveSegments: isDetailed ? 36 : 16,
    bevelSize: 0.10,
    bevelThickness: 0.10
  });
  visorGeo.center();

  // Curvature to match front bezel
  const visorPos = visorGeo.attributes.position;
  for (let i = 0; i < visorPos.count; i++) {
    const x = visorPos.getX(i);
    const z = visorPos.getZ(i);
    visorPos.setZ(i, z + Math.cos((x / vw2) * (Math.PI / 2.7)) * 0.24);
  }
  visorGeo.computeVertexNormals();

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: theme.visor,
    roughness: 0.03,
    metalness: 0.94,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transmission: 0.20,
    reflectivity: 0.98,
    transparent: true,
    opacity: 0.95
  });
  dynamicMaterials.visor.push(visorMat);

  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.z = chassisD / 2 + 0.18;
  headsetGroup.add(visorMesh);

  // =========================================================================
  // 4. SOLID TUBULAR NEON LIGHTBAR (Smooth 3D Tubes, NOT jagged 1px lines!)
  // =========================================================================
  const curvePoints = [];
  const stripWidth = 2.45;
  const stripSteps = 28;
  for (let i = 0; i <= stripSteps; i++) {
    const t = i / stripSteps;
    const x = -stripWidth / 2 + t * stripWidth;
    const y = -0.58 + Math.sin(t * Math.PI) * 0.08;
    const z = chassisD / 2 + 0.24 + Math.cos((x / (stripWidth / 2)) * (Math.PI / 3)) * 0.17;
    curvePoints.push(new THREE.Vector3(x, y, z));
  }
  const ledCurve = new THREE.CatmullRomCurve3(curvePoints);
  const ledGeo = new THREE.TubeGeometry(ledCurve, 32, 0.032, 12, false);

  const ledMat = new THREE.MeshBasicMaterial({
    color: theme.accent
  });
  dynamicMaterials.led.push(ledMat);

  const ledMesh = new THREE.Mesh(ledGeo, ledMat);
  headsetGroup.add(ledMesh);

  // Top Neon Accent Tube
  const topPoints = [];
  for (let i = 0; i <= stripSteps; i++) {
    const t = i / stripSteps;
    const x = -stripWidth / 2.2 + t * (stripWidth / 1.1);
    const y = 0.60 - Math.sin(t * Math.PI) * 0.05;
    const z = chassisD / 2 + 0.22 + Math.cos((x / (stripWidth / 2)) * (Math.PI / 3)) * 0.15;
    topPoints.push(new THREE.Vector3(x, y, z));
  }
  const topCurve = new THREE.CatmullRomCurve3(topPoints);
  const topLedGeo = new THREE.TubeGeometry(topCurve, 28, 0.024, 10, false);
  const topLedMesh = new THREE.Mesh(topLedGeo, ledMat);
  headsetGroup.add(topLedMesh);

  // =========================================================================
  // 5. SOLID TOP COOLING LOUVERS (Real 3D Slat Geometry)
  // =========================================================================
  const ventGroup = new THREE.Group();
  for (let v = -4; v <= 4; v++) {
    const ventLouverGeo = new THREE.BoxGeometry(0.24, 0.05, 0.60);
    const ventLouver = new THREE.Mesh(ventLouverGeo, metalMat);
    ventLouver.position.set(v * 0.28, 0.86, -0.05);
    ventLouver.rotation.x = 0.22;
    ventGroup.add(ventLouver);
  }
  headsetGroup.add(ventGroup);

  // =========================================================================
  // 6. SOLID TRACKING CAMERA PODS & LIDAR ARRAY (Chrome Bezels & Dark Glass)
  // =========================================================================
  const cameraLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x06112d,
    roughness: 0.02,
    transmission: 0.65,
    clearcoat: 1.0,
    reflectivity: 0.98
  });

  const camPositions = [
    // 4 Corner 6DoF SLAM Tracking Cameras
    { x: -1.28, y: -0.46, z: chassisD / 2 + 0.20, angX: 0.2, angY: -0.3 },
    { x: 1.28, y: -0.46, z: chassisD / 2 + 0.20, angX: 0.2, angY: 0.3 },
    { x: -1.30, y: 0.46, z: chassisD / 2 + 0.20, angX: -0.2, angY: -0.3 },
    { x: 1.30, y: 0.46, z: chassisD / 2 + 0.20, angX: -0.2, angY: 0.3 },
    // 2 Center Stereo RGB Pass-Through Cameras
    { x: -0.52, y: -0.06, z: chassisD / 2 + 0.28, angX: 0, angY: 0 },
    { x: 0.52, y: -0.06, z: chassisD / 2 + 0.28, angX: 0, angY: 0 }
  ];

  camPositions.forEach((pos) => {
    const camUnit = new THREE.Group();

    // Solid Chrome Bezel Ring
    const bezelGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.06, 24);
    bezelGeo.rotateX(Math.PI / 2);
    const bezel = new THREE.Mesh(bezelGeo, metalMat);
    camUnit.add(bezel);

    // Inner Deep Optical Well
    const wellGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.05, 20);
    wellGeo.rotateX(Math.PI / 2);
    const wellMat = new THREE.MeshBasicMaterial({ color: 0x010205 });
    const well = new THREE.Mesh(wellGeo, wellMat);
    well.position.z = 0.02;
    camUnit.add(well);

    // Spherical Glass Lens Element
    const lensGeo = new THREE.SphereGeometry(0.07, 16, 16);
    lensGeo.scale(1, 1, 0.45);
    const lens = new THREE.Mesh(lensGeo, cameraLensMat);
    lens.position.z = 0.04;
    camUnit.add(lens);

    camUnit.position.set(pos.x, pos.y, pos.z);
    camUnit.rotation.set(pos.angX, pos.angY, 0);
    headsetGroup.add(camUnit);
  });

  // Solid Central LiDAR Housing
  const lidarHousingGeo = new THREE.BoxGeometry(0.68, 0.24, 0.08);
  const lidarHousingMat = new THREE.MeshStandardMaterial({
    color: 0x06070e,
    metalness: 0.95,
    roughness: 0.2
  });
  const lidarHousing = new THREE.Mesh(lidarHousingGeo, lidarHousingMat);
  lidarHousing.position.set(0, -0.06, chassisD / 2 + 0.29);

  // LiDAR Dual Optical Diodes
  [-0.17, 0.17].forEach(lx => {
    const diodeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20);
    diodeGeo.rotateX(Math.PI / 2);
    const diodeMat = new THREE.MeshBasicMaterial({ color: theme.accent });
    dynamicMaterials.led.push(diodeMat);
    const diode = new THREE.Mesh(diodeGeo, diodeMat);
    diode.position.set(lx, 0, 0.04);
    lidarHousing.add(diode);
  });
  headsetGroup.add(lidarHousing);

  // =========================================================================
  // 7. SOLID ERGONOMIC FACIAL GASKET & SOFT FOAM INTERFACE
  // =========================================================================
  const cushionShape = new THREE.Shape();
  const cw2 = 1.50;
  const ch2 = 0.76;
  const cr = 0.38;

  cushionShape.moveTo(-cw2 + cr, -ch2);
  cushionShape.lineTo(cw2 - cr, -ch2);
  cushionShape.quadraticCurveTo(cw2, -ch2, cw2, -ch2 + cr);
  cushionShape.lineTo(cw2, ch2 - cr);
  cushionShape.quadraticCurveTo(cw2, ch2, cw2 - cr, ch2);
  cushionShape.lineTo(-cw2 + cr, ch2);
  cushionShape.quadraticCurveTo(-cw2, ch2, -cw2, ch2 - cr);
  cushionShape.lineTo(-cw2, -ch2 + cr);
  cushionShape.quadraticCurveTo(-cw2, -ch2, -cw2 + cr, -ch2);

  // Eye chamber cutout
  const holePath = new THREE.Path();
  const hw2 = 1.20;
  const hh2 = 0.52;
  holePath.moveTo(-hw2 + 0.2, -hh2);
  holePath.lineTo(hw2 - 0.2, -hh2);
  holePath.quadraticCurveTo(hw2, -hh2, hw2, -hh2 + 0.2);
  holePath.lineTo(hw2, hh2 - 0.2);
  holePath.quadraticCurveTo(hw2, hh2, hw2 - 0.2, hh2);
  holePath.lineTo(-hw2 + 0.2, hh2);
  holePath.quadraticCurveTo(-hw2, hh2, -hw2, hh2 - 0.2);
  holePath.lineTo(-hw2, -hh2 + 0.2);
  holePath.quadraticCurveTo(-hw2, -hh2, -hw2 + 0.2, -hh2);
  cushionShape.holes.push(holePath);

  const cushionGeo = new THREE.ExtrudeGeometry(cushionShape, {
    depth: 0.48,
    bevelEnabled: true,
    bevelSegments: isDetailed ? 6 : 3,
    bevelSize: 0.15,
    bevelThickness: 0.15
  });
  cushionGeo.center();

  const cushionMat = new THREE.MeshStandardMaterial({
    color: theme.cushion,
    roughness: 0.95,
    metalness: 0.05
  });
  const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
  cushionMesh.position.z = -chassisD / 2 - 0.28;
  headsetGroup.add(cushionMesh);

  // Ergonomic Nose Notch Flap
  const noseFlapGeo = new THREE.ConeGeometry(0.28, 0.40, 16, 1, true);
  noseFlapGeo.rotateX(Math.PI);
  const noseFlap = new THREE.Mesh(noseFlapGeo, cushionMat);
  noseFlap.position.set(0, -0.44, -chassisD / 2 - 0.32);
  headsetGroup.add(noseFlap);

  // =========================================================================
  // 8. SOLID INTERNAL PANCAKE OPTICS & MICRO-OLED SCREENS
  // =========================================================================
  if (isDetailed) {
    const screenTexture = createInternalScreenTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });

    const lensGeo = new THREE.CylinderGeometry(0.52, 0.56, 0.18, 32);
    lensGeo.rotateX(Math.PI / 2);

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x092656,
      roughness: 0.05,
      metalness: 0.15,
      transmission: 0.74,
      ior: 1.70,
      clearcoat: 1.0,
      emissive: theme.accent,
      emissiveIntensity: 0.40
    });
    dynamicMaterials.lens.push(lensMat);

    // Left and Right Eye Optical Chambers
    [-0.65, 0.65].forEach((eyeX) => {
      const eyeChamber = new THREE.Group();

      // Metallic stepped bezel ring around lens
      const lensBezelGeo = new THREE.TorusGeometry(0.58, 0.045, 14, 36);
      const lensBezel = new THREE.Mesh(lensBezelGeo, metalMat);
      eyeChamber.add(lensBezel);

      // Glass Pancake Lens
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      eyeChamber.add(lensMesh);

      // Inner OLED display panel
      const screenGeo = new THREE.PlaneGeometry(0.88, 0.78);
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.z = 0.20;
      eyeChamber.add(screenMesh);

      eyeChamber.position.set(eyeX, 0.06, -chassisD / 2 - 0.08);
      headsetGroup.add(eyeChamber);
    });

    // Proximity / Wear Detection Sensor
    const proxGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.025, 20);
    proxGeo.rotateX(Math.PI / 2);
    const proxMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    dynamicMaterials.led.push(proxMat);
    const prox = new THREE.Mesh(proxGeo, proxMat);
    prox.position.set(0, 0.24, -chassisD / 2);
    headsetGroup.add(prox);
  }

  // =========================================================================
  // 9. SOLID RIGID SIDE ARMS WITH SPATIAL AUDIO GRILLES
  // =========================================================================
  const strapMat = new THREE.MeshStandardMaterial({
    color: theme.strap,
    roughness: 0.82,
    metalness: 0.25
  });

  [-1, 1].forEach((side) => {
    // Mechanical Pivot Joint
    const hingeGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 28);
    hingeGeo.rotateZ(Math.PI / 2);
    const hinge = new THREE.Mesh(hingeGeo, metalMat);
    hinge.position.set(side * 1.68, 0.02, -0.1);
    headsetGroup.add(hinge);

    // Decorative Center Bolt
    const boltGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 20);
    boltGeo.rotateZ(Math.PI / 2);
    const boltMat = new THREE.MeshBasicMaterial({ color: theme.accent });
    dynamicMaterials.led.push(boltMat);
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(side * 1.68, 0.02, -0.1);
    headsetGroup.add(bolt);

    // Rigid Temple Arm
    const armShape = new THREE.Shape();
    armShape.moveTo(0, -0.17);
    armShape.lineTo(2.10, -0.13);
    armShape.lineTo(2.10, 0.15);
    armShape.lineTo(0, 0.17);
    armShape.closePath();

    const armGeo = new THREE.ExtrudeGeometry(armShape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.03,
      bevelThickness: 0.03
    });
    const armMesh = new THREE.Mesh(armGeo, chassisMat);
    armMesh.position.set(side * 1.70, 0.02, -0.1);
    armMesh.rotation.y = side * (Math.PI / 2 + 0.11);
    headsetGroup.add(armMesh);

    // Spatial Audio Perforated Grille
    if (isDetailed) {
      const grilleGeo = new THREE.BoxGeometry(0.05, 0.20, 0.54);
      const grilleMat = new THREE.MeshStandardMaterial({
        color: 0x040508,
        metalness: 0.95,
        roughness: 0.25
      });
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.set(side * 1.80, 0.03, -1.04);
      headsetGroup.add(grille);
    }
  });

  // =========================================================================
  // 10. SOLID ERGONOMIC HEAD STRAP, CRADLE & KNURLED FIT DIAL
  // =========================================================================
  // Rear curved head cradle loop
  const rearCurvePoints = [];
  const rearSteps = 20;
  for (let i = 0; i <= rearSteps; i++) {
    const t = i / rearSteps;
    const angle = Math.PI * 0.14 + t * (Math.PI * 0.72);
    const radX = 1.80;
    const radZ = 2.18;
    const x = Math.cos(angle) * radX;
    const z = -Math.sin(angle) * radZ;
    const y = -0.04 + Math.sin(t * Math.PI) * 0.16;
    rearCurvePoints.push(new THREE.Vector3(x, y, z));
  }
  const rearCurve = new THREE.CatmullRomCurve3(rearCurvePoints);
  const rearStrapGeo = new THREE.TubeGeometry(rearCurve, 24, 0.095, 10, false);
  const rearStrapMesh = new THREE.Mesh(rearStrapGeo, strapMat);
  headsetGroup.add(rearStrapMesh);

  // Rear Occipital Comfort Cushion Pad
  const rearPadGeo = new THREE.BoxGeometry(1.28, 0.54, 0.15);
  const rearPad = new THREE.Mesh(rearPadGeo, cushionMat);
  rearPad.position.set(0, 0.06, -2.20);
  headsetGroup.add(rearPad);

  // Knurled Mechanical Tension Dial
  const dialGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.10, 36);
  dialGeo.rotateX(Math.PI / 2);
  const dial = new THREE.Mesh(dialGeo, metalMat);
  dial.position.set(0, 0.06, -2.28);
  headsetGroup.add(dial);

  // Inner Accent Ring on Dial
  const dialRingGeo = new THREE.TorusGeometry(0.15, 0.022, 10, 28);
  const dialRingMat = new THREE.MeshBasicMaterial({ color: theme.accent });
  dynamicMaterials.led.push(dialRingMat);
  const dialRing = new THREE.Mesh(dialRingGeo, dialRingMat);
  dialRing.position.set(0, 0.06, -2.33);
  headsetGroup.add(dialRing);

  // Overhead Stabilization Strap
  const topStrapPoints = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const z = 0.32 - t * 2.38;
    const y = 0.88 + Math.sin(t * Math.PI) * 0.80;
    topStrapPoints.push(new THREE.Vector3(0, y, z));
  }
  const topStrapCurve = new THREE.CatmullRomCurve3(topStrapPoints);
  const topStrapGeo = new THREE.TubeGeometry(topStrapCurve, 18, 0.048, 8, false);
  const topStrapMesh = new THREE.Mesh(topStrapGeo, strapMat);
  headsetGroup.add(topStrapMesh);

  // Metallic Tension Buckle
  const buckleGeo = new THREE.BoxGeometry(0.25, 0.095, 0.15);
  const buckle = new THREE.Mesh(buckleGeo, metalMat);
  buckle.position.set(0, 1.62, -0.87);
  headsetGroup.add(buckle);

  // =========================================================================
  // 11. HOTSPOTS & INTERACTIVE STUDIO METADATA
  // =========================================================================
  headsetGroup.userData = {
    theme: themeKey,
    dynamicMaterials,
    ledMesh,
    topLedMesh,
    hotspots: [
      {
        id: 'optics',
        title: 'Бионические Pancake-линзы 4K',
        desc: 'Сверхкомпактная оптика с подавлением бликов и углом обзора 110°. Сдвоенные Micro-OLED панели выдают 4K на каждый глаз с частотой 120 Гц.',
        pos: new THREE.Vector3(0.65, 0.06, -chassisD / 2 - 0.22)
      },
      {
        id: 'visor',
        title: 'Изогнутый 3D-визор и LiDAR',
        desc: 'Высокопрочное оптическое стекло с антибликовым покрытием, датчик глубины LiDAR и 6 внешних камер с задержкой сквозного видео менее 12 мс.',
        pos: new THREE.Vector3(0, -0.06, chassisD / 2 + 0.38)
      },
      {
        id: 'audio',
        title: 'Пространственный звук Spatial Audio',
        desc: 'Направленные акустические излучатели в боковых дужках создают точную 3D-звуковую сцену без необходимости надевать отдельные наушники.',
        pos: new THREE.Vector3(1.90, 0.03, -1.04)
      },
      {
        id: 'strap',
        title: 'Эргономичное оголовье с балансом веса',
        desc: 'Поворотный регулятор натяжения с микро-шагом и мягкая затылочная подушка идеально распределяют вес 385 грамм по голове.',
        pos: new THREE.Vector3(0, 0.06, -2.30)
      },
      {
        id: 'cameras',
        title: '6DoF Трекинг без внешних станций',
        desc: 'Широкоугольные камеры с компьютерным зрением отслеживают перемещение в пространстве и жесты рук пользователя с точностью до 1 мм.',
        pos: new THREE.Vector3(-1.30, 0.46, chassisD / 2 + 0.28)
      }
    ],

    // Realtime Theme Color Switching
    setTheme: function (newThemeKey) {
      const th = VR_THEMES[newThemeKey];
      if (!th) return;
      headsetGroup.userData.theme = newThemeKey;

      dynamicMaterials.chassis.forEach(m => m.color.setHex(th.chassis));
      dynamicMaterials.metal.forEach(m => m.color.setHex(th.metal));
      dynamicMaterials.visor.forEach(m => m.color.setHex(th.visor));
      dynamicMaterials.led.forEach(m => m.color.setHex(th.accent));
      dynamicMaterials.lens.forEach(m => {
        m.emissive.setHex(th.accent);
      });
    },

    // Realtime Render Mode Switching: 'realistic', 'wireframe', 'hologram'
    setRenderMode: function (mode) {
      headsetGroup.traverse((child) => {
        if (child.isMesh) {
          if (mode === 'wireframe') {
            child.material.wireframe = true;
          } else if (mode === 'hologram') {
            child.material.wireframe = false;
            child.material.transparent = true;
            child.material.opacity = 0.55;
            if (child.material.emissive) {
              child.material.emissive.setHex(0x00f0ff);
              child.material.emissiveIntensity = 0.9;
            }
          } else {
            // Realistic PBR
            child.material.wireframe = false;
            child.material.transparent = child === visorMesh;
            child.material.opacity = child === visorMesh ? 0.95 : 1.0;
            if (child.material.emissive && child !== ledMesh && child !== topLedMesh) {
              child.material.emissiveIntensity = 0.40;
            }
          }
        }
      });
    }
  };

  return headsetGroup;
}

window.createVRHeadsetModel = createVRHeadsetModel;
window.VR_THEMES = VR_THEMES;
