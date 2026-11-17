/**
 * Background 3D Scene with Floating, Smoothly Moving VR Headsets
 * Features solid, high-resolution CAD models with high-contrast studio lighting,
 * smooth organic oscillation, mouse parallax, and page scroll fly-through.
 */

class BackgroundVRScene {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.headsets = [];
    this.heroHeadset = null;
    this.particles = null;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.clock = new THREE.Clock();
    this.isRunning = true;

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060814, 0.025);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    // 3. High-Quality WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // 4. Studio Lighting Rig for Crisp Structural Clarity
    const ambientLight = new THREE.AmbientLight(0x283654, 2.6);
    this.scene.add(ambientLight);

    // Powerful Key Light (Cyan)
    const keyLight = new THREE.DirectionalLight(0x00f0ff, 3.6);
    keyLight.position.set(6, 8, 9);
    this.scene.add(keyLight);

    // Electric Violet Rim Light (Crisp silhouettes)
    const rimLight = new THREE.DirectionalLight(0x9d4edd, 3.4);
    rimLight.position.set(-8, -4, 5);
    this.scene.add(rimLight);

    // Front White Specular Fill (Ensures glass & chrome gleam)
    const frontFill = new THREE.DirectionalLight(0xffffff, 2.4);
    frontFill.position.set(0, 5, 10);
    this.scene.add(frontFill);

    // Bottom Ambient Ground Glow
    const groundGlow = new THREE.PointLight(0x0070f3, 2.2, 30);
    groundGlow.position.set(0, -6, 2);
    this.scene.add(groundGlow);

    // 5. Featured Hero VR Headset (Solid CAD Model)
    this.heroHeadset = createVRHeadsetModel({
      isDetailed: true,
      theme: 'obsidian'
    });
    this.heroHeadset.scale.set(0.58, 0.58, 0.58);
    this.heroHeadset.position.set(2.4, 0.65, 2.2);
    this.heroHeadset.rotation.set(0.15, -0.55, 0.05);
    this.scene.add(this.heroHeadset);

    // Dedicated spotlight focused on Hero Headset
    const heroSpot = new THREE.SpotLight(0x00f0ff, 5.5, 22, Math.PI / 4, 0.3);
    heroSpot.position.set(4, 6, 7);
    heroSpot.target = this.heroHeadset;
    this.scene.add(heroSpot);

    // 6. Floating Background VR Headsets (Solid instances drifting in 3D depth)
    const bgConfigs = [
      { pos: [-5.4, 3.4, -4.5], rot: [0.35, 0.65, -0.2], scale: 0.55, speed: 0.75, theme: 'glacier' },
      { pos: [-4.8, -3.2, -8.0], rot: [-0.4, 1.3, 0.3], scale: 0.44, speed: 0.55, theme: 'cyber' },
      { pos: [6.2, -2.6, -6.5], rot: [0.45, -0.85, -0.25], scale: 0.48, speed: 0.65, theme: 'titanium' },
      { pos: [5.2, 4.2, -11.0], rot: [-0.2, -1.2, 0.15], scale: 0.36, speed: 0.45, theme: 'obsidian' },
      { pos: [-1.6, -4.8, -12.0], rot: [0.55, 0.45, -0.4], scale: 0.38, speed: 0.50, theme: 'cyber' },
      { pos: [0.8, 5.2, -14.5], rot: [0.15, -0.6, 0.35], scale: 0.34, speed: 0.40, theme: 'glacier' }
    ];

    bgConfigs.forEach((cfg, index) => {
      const model = createVRHeadsetModel({
        isDetailed: false,
        theme: cfg.theme
      });
      model.scale.set(cfg.scale, cfg.scale, cfg.scale);
      model.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      model.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);

      // Oscillation and motion parameters
      model.userData.basePos = { x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2] };
      model.userData.baseRot = { x: cfg.rot[0], y: cfg.rot[1], z: cfg.rot[2] };
      model.userData.speed = cfg.speed;
      model.userData.phase = index * 1.4;
      model.userData.rotSpeed = {
        x: (Math.sin(index) * 0.3 + 0.25) * 0.5,
        y: (Math.cos(index) * 0.4 + 0.45) * 0.5,
        z: (Math.sin(index * 2) * 0.2) * 0.4
      };

      this.scene.add(model);
      this.headsets.push(model);
    });

    // 7. Soft Deep Cosmic Starfield (Kept strictly in the FAR background to avoid noisy pixels)
    this.createBackgroundStars();

    // 8. Event listeners
    this.addEvents();

    // 9. Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createBackgroundStars() {
    const starCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const c1 = new THREE.Color(0x00f0ff);
    const c2 = new THREE.Color(0x9d4edd);

    for (let i = 0; i < starCount; i++) {
      // Strictly placed far back behind all foreground models
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 2] = -12 - Math.random() * 25; // z: -12 to -37

      const col = Math.random() > 0.4 ? c1 : c2;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Smooth soft radial sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.6)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);

    const pTexture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  addEvents() {
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (this.heroHeadset) {
        if (width < 768) {
          this.heroHeadset.position.set(0, -0.6, 1.4);
          this.heroHeadset.scale.set(0.42, 0.42, 0.42);
        } else if (width < 1024) {
          this.heroHeadset.position.set(1.8, 0.4, 1.8);
          this.heroHeadset.scale.set(0.48, 0.48, 0.48);
        } else {
          this.heroHeadset.position.set(2.4, 0.65, 2.2);
          this.heroHeadset.scale.set(0.58, 0.58, 0.58);
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) {
        this.clock.start();
        requestAnimationFrame(this.animate);
      }
    });
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.06;

    // Camera movement reacting to mouse and scroll
    const scrollProgress = this.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    this.camera.position.x = this.mouse.x * 0.85;
    this.camera.position.y = this.mouse.y * 0.55 - scrollProgress * 3.8;
    this.camera.position.z = 11 - scrollProgress * 4.2;
    this.camera.lookAt(0, -scrollProgress * 2.8, 0);

    // 1. Animate Hero Featured VR Headset
    if (this.heroHeadset) {
      const bob = Math.sin(elapsedTime * 1.25) * 0.12;
      const sway = Math.cos(elapsedTime * 0.85) * 0.06;

      const width = window.innerWidth;
      const baseX = width < 768 ? 0 : (width < 1024 ? 1.8 : 2.4);
      const baseY = width < 768 ? -0.6 : 0.65;

      this.heroHeadset.position.y = baseY + bob;
      this.heroHeadset.position.x = baseX + sway;

      // Smooth multi-axis rotation with responsive mouse tilt
      this.heroHeadset.rotation.y = -0.55 + Math.sin(elapsedTime * 0.55) * 0.28 + this.mouse.x * 0.5;
      this.heroHeadset.rotation.x = 0.15 + Math.cos(elapsedTime * 0.75) * 0.14 - this.mouse.y * 0.38;
      this.heroHeadset.rotation.z = 0.05 + Math.sin(elapsedTime * 0.65) * 0.09;
    }

    // 2. Animate Background Floating VR Headsets
    this.headsets.forEach((model) => {
      const u = model.userData;
      const t = elapsedTime * u.speed + u.phase;

      model.position.y = u.basePos.y + Math.sin(t * 1.15) * 0.42;
      model.position.x = u.basePos.x + Math.cos(t * 0.85) * 0.32 + this.mouse.x * 0.25;
      model.position.z = u.basePos.z + Math.sin(t * 0.65) * 0.45;

      model.rotation.x += u.rotSpeed.x * 0.02;
      model.rotation.y += u.rotSpeed.y * 0.025;
      model.rotation.z += u.rotSpeed.z * 0.015;
    });

    // 3. Animate Starfield
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.BackgroundVRScene = BackgroundVRScene;
