/**
 * Interactive 3D VR Headset Studio Inspector
 * 360° orbital navigation, camera angle presets, color customizer,
 * rendering mode switcher, and interactive 3D hotspots.
 */

class VRStudioInspector {
  constructor() {
    this.container = document.getElementById('studio-canvas-container');
    if (!this.container) return;

    this.canvas = document.getElementById('studio-canvas');
    this.hotspotContainer = document.getElementById('hotspots-overlay');

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.headsetModel = null;

    this.isAutoRotating = true;
    this.activeHotspot = null;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(2.8, 1.4, 4.2);

    // 3. Renderer with high dynamic range
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // 4. Studio Lighting Rig for Crisp Structural Definition
    const ambLight = new THREE.AmbientLight(0x222e44, 2.2);
    this.scene.add(ambLight);

    // Main Key Spot Light (Cyan)
    const keyLight = new THREE.SpotLight(0x00f0ff, 4.5, 25, Math.PI / 4, 0.35);
    keyLight.position.set(6, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Rim Fill Light (Violet)
    const rimLight = new THREE.DirectionalLight(0x9d4edd, 3.2);
    rimLight.position.set(-7, 4, -5);
    this.scene.add(rimLight);

    // Front Crisp Accent Light
    const frontKey = new THREE.DirectionalLight(0xffffff, 2.0);
    frontKey.position.set(0, 5, 8);
    this.scene.add(frontKey);

    // Floor Bounce Glow
    const bounceLight = new THREE.PointLight(0x0070f3, 1.5, 12);
    bounceLight.position.set(0, -3, 2);
    this.scene.add(bounceLight);

    // Studio Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(14, 14);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.6;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // High-Tech Cyber Circular Grid Platform
    const grid = new THREE.GridHelper(12, 24, 0x00f0ff, 0x1d283e);
    grid.position.y = -1.6;
    this.scene.add(grid);

    // Circular glowing ring under the headset
    const ringGeo = new THREE.RingGeometry(1.8, 1.84, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const platformRing = new THREE.Mesh(ringGeo, ringMat);
    platformRing.position.y = -1.58;
    this.scene.add(platformRing);

    // 5. Ultra-Detailed High-Structure VR Headset
    this.headsetModel = createVRHeadsetModel({
      isDetailed: true,
      theme: 'obsidian',
      showEdges: true
    });
    this.headsetModel.position.y = 0.05;
    this.scene.add(this.headsetModel);

    // 6. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 2.2;
      this.controls.maxDistance = 8.5;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.25;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.2;

      this.controls.addEventListener('start', () => {
        this.isAutoRotating = false;
        this.updateAutoRotateButton();
      });
    }

    // 7. Setup Interactive Hotspots DOM overlay
    this.setupHotspots();

    // 8. Bind UI Controls
    this.bindControls();

    // 9. Resize Listener
    window.addEventListener('resize', () => this.onResize());

    // 10. Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupHotspots() {
    if (!this.hotspotContainer || !this.headsetModel.userData.hotspots) return;

    this.hotspotElements = [];
    const hotspots = this.headsetModel.userData.hotspots;

    hotspots.forEach((hs, idx) => {
      const el = document.createElement('div');
      el.className = 'studio-hotspot';
      el.dataset.id = hs.id;
      el.innerHTML = `
        <button class="hotspot-pin" aria-label="${hs.title}">
          <span class="hotspot-pulse"></span>
          <span class="hotspot-num">${idx + 1}</span>
        </button>
        <div class="hotspot-card">
          <div class="hotspot-card-badge">ДЕТАЛИЗАЦИЯ #0${idx + 1}</div>
          <h4>${hs.title}</h4>
          <p>${hs.desc}</p>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectHotspot(hs, el);
      });

      this.hotspotContainer.appendChild(el);
      this.hotspotElements.push({ el, pos: hs.pos, data: hs });
    });
  }

  updateHotspotsPositions() {
    if (!this.hotspotElements || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.hotspotElements.forEach((item) => {
      const worldPos = item.pos.clone();
      this.headsetModel.localToWorld(worldPos);

      const tempV = worldPos.clone().project(this.camera);

      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      const toPos = worldPos.clone().sub(this.camera.position).normalize();
      const isFacing = camDir.dot(toPos) > 0;

      if (tempV.z > 1.0 || !isFacing) {
        item.el.style.opacity = '0';
        item.el.style.pointerEvents = 'none';
        return;
      }

      const x = (tempV.x * 0.5 + 0.5) * width;
      const y = (-tempV.y * 0.5 + 0.5) * height;

      item.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      item.el.style.opacity = '1';
      item.el.style.pointerEvents = 'auto';
    });
  }

  selectHotspot(hs, element) {
    if (window.sciFiAudio) window.sciFiAudio.playClick();

    this.hotspotElements.forEach(item => item.el.classList.remove('active'));
    element.classList.add('active');

    const targetPos = hs.pos.clone();
    this.headsetModel.localToWorld(targetPos);

    const offset = targetPos.clone().normalize().multiplyScalar(3.2);
    offset.y = Math.max(offset.y, 0.4);

    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: targetPos.x + offset.x * 0.7,
        y: targetPos.y + offset.y * 0.6 + 0.3,
        z: targetPos.z + offset.z * 0.7,
        duration: 1.3,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (this.controls) this.controls.update();
        }
      });
      if (this.controls) {
        gsap.to(this.controls.target, {
          x: targetPos.x * 0.5,
          y: targetPos.y * 0.5,
          z: targetPos.z * 0.5,
          duration: 1.3,
          ease: 'power2.inOut'
        });
      }
    }

    if (this.controls) {
      this.controls.autoRotate = false;
      this.isAutoRotating = false;
      this.updateAutoRotateButton();
    }
  }

  bindControls() {
    // 1. Angle Presets
    const angleBtns = document.querySelectorAll('.angle-btn');
    angleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playChime(580, 870);
        angleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const preset = btn.dataset.angle;
        this.setCameraPreset(preset);
      });
    });

    // 2. Color / Theme Picker
    const colorBtns = document.querySelectorAll('.color-swatch');
    colorBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playHover();
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const theme = btn.dataset.theme;
        if (this.headsetModel && this.headsetModel.userData.setTheme) {
          this.headsetModel.userData.setTheme(theme);
        }
      });
    });

    // 3. Render Mode Switcher
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playChime(700, 950);
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode;
        if (this.headsetModel && this.headsetModel.userData.setRenderMode) {
          this.headsetModel.userData.setRenderMode(mode);
        }
      });
    });

    // 4. Auto-Rotate Toggle Button
    const autoRotateBtn = document.getElementById('btn-auto-rotate');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playClick();
        this.isAutoRotating = !this.isAutoRotating;
        if (this.controls) {
          this.controls.autoRotate = this.isAutoRotating;
        }
        this.updateAutoRotateButton();
      });
    }

    // 5. Reset View Button
    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playClick();
        this.setCameraPreset('isometric');
      });
    }

    this.canvas.addEventListener('click', () => {
      if (this.hotspotElements) {
        this.hotspotElements.forEach(item => item.el.classList.remove('active'));
      }
    });
  }

  setCameraPreset(preset) {
    const targets = {
      front: { x: 0, y: 0.1, z: 4.6, target: { x: 0, y: 0, z: 0 } },
      lenses: { x: 0, y: 0.15, z: -4.3, target: { x: 0, y: 0.1, z: -0.6 } },
      isometric: { x: 3.2, y: 1.6, z: 3.4, target: { x: 0, y: 0, z: 0 } },
      side: { x: 4.8, y: 0.1, z: -0.2, target: { x: 0, y: 0, z: 0 } },
      top: { x: 0.1, y: 4.8, z: 0.6, target: { x: 0, y: 0, z: 0 } }
    };

    const cfg = targets[preset] || targets.isometric;

    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: cfg.x,
        y: cfg.y,
        z: cfg.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (this.controls) this.controls.update();
        }
      });
      if (this.controls) {
        gsap.to(this.controls.target, {
          x: cfg.target.x,
          y: cfg.target.y,
          z: cfg.target.z,
          duration: 1.2,
          ease: 'power2.inOut'
        });
      }
    } else {
      this.camera.position.set(cfg.x, cfg.y, cfg.z);
      if (this.controls) {
        this.controls.target.set(cfg.target.x, cfg.target.y, cfg.target.z);
        this.controls.update();
      }
    }
  }

  updateAutoRotateButton() {
    const btn = document.getElementById('btn-auto-rotate');
    if (!btn) return;
    if (this.isAutoRotating) {
      btn.classList.add('active');
      btn.querySelector('.label').textContent = 'Вращение: Вкл';
    } else {
      btn.classList.remove('active');
      btn.querySelector('.label').textContent = 'Вращение: Пауза';
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    if (this.controls) {
      this.controls.update();
    }

    // Breathing pulse on the front LED strip
    if (this.headsetModel && this.headsetModel.userData.ledMesh) {
      const pulse = (Math.sin(elapsedTime * 3.0) + 1.0) * 0.5;
      this.headsetModel.userData.ledMesh.material.opacity = 0.75 + pulse * 0.25;
    }

    this.updateHotspotsPositions();
    this.renderer.render(this.scene, this.camera);
  }
}

window.VRStudioInspector = VRStudioInspector;
