/**
 * Interactive VR Simulator & First-Person Gaming Experience
 * Features:
 * - "Wear VR Headset" cinematic 3D transition (smoothly putting on the glasses)
 * - Large 3D virtual environment with PC Virtual Desktop & Cyberpunk Arena
 * - Interactive Waypoint navigation buttons (smooth camera flight to locations)
 * - Dynamic explanations of 120Hz smoothness, PC desktop streaming, and mobile support
 */

class VRSimulator {
  constructor() {
    this.container = document.getElementById('sim-viewport');
    if (!this.container) return;

    this.canvas = document.getElementById('sim-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // States
    this.isWearing = false;
    this.currentEnv = 'cyberpunk';
    this.currentWaypoint = 'arena';
    this.envObjects = [];

    // Outside Headset Preview Model
    this.previewHeadset = null;

    // First person mouse look
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.lon = -90;
    this.lat = 0;
    this.targetLon = -90;
    this.targetLat = 0;

    // Camera waypoint targets
    this.cameraPos = new THREE.Vector3(0, 0, 0.1);
    this.targetCameraPos = new THREE.Vector3(0, 0, 0.1);

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 3.8); // Start in outside preview position

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // 1. Build Virtual 3D World (Skyscrapers, Neon Grid, Flying Cars & PC Monitors)
    this.buildWorld();

    // 2. Build Floating VR Headset (visible before putting on)
    this.buildPreviewHeadset();

    // 3. Bind UI buttons (Wear VR, Waypoints, Environments, Fullscreen)
    this.bindEvents();

    // 4. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  buildPreviewHeadset() {
    this.previewHeadset = createVRHeadsetModel({
      isDetailed: true,
      theme: 'obsidian'
    });
    this.previewHeadset.scale.set(0.68, 0.68, 0.68);
    this.previewHeadset.position.set(0, 0, 1.2);
    this.previewHeadset.rotation.set(0.12, 0, 0);
    this.scene.add(this.previewHeadset);

    // Front spotlight focused on the preview headset
    this.previewSpot = new THREE.SpotLight(0x00f0ff, 5.0, 15, Math.PI / 4, 0.3);
    this.previewSpot.position.set(0, 3, 4);
    this.previewSpot.target = this.previewHeadset;
    this.scene.add(this.previewSpot);
  }

  buildWorld() {
    this.scene.fog = new THREE.FogExp2(0x060818, 0.016);

    // Ambient Lighting
    const amb = new THREE.AmbientLight(0x182442, 2.4);
    this.scene.add(amb);
    this.envObjects.push(amb);

    const lightCyan = new THREE.DirectionalLight(0x00f0ff, 2.8);
    lightCyan.position.set(15, 25, 12);
    this.scene.add(lightCyan);
    this.envObjects.push(lightCyan);

    const lightMag = new THREE.DirectionalLight(0xff007f, 2.2);
    lightMag.position.set(-20, -10, -15);
    this.scene.add(lightMag);
    this.envObjects.push(lightMag);

    // Ground Cyber Grid Platform
    const grid = new THREE.GridHelper(160, 80, 0x00f0ff, 0x18233c);
    grid.position.y = -6;
    this.scene.add(grid);
    this.envObjects.push(grid);

    // Central Arena Floor Ring
    const floorRingGeo = new THREE.RingGeometry(8, 8.4, 64);
    floorRingGeo.rotateX(-Math.PI / 2);
    const floorRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.position.y = -5.95;
    this.scene.add(floorRing);
    this.envObjects.push(floorRing);

    // =========================================================================
    // VIRTUAL PC DESKTOP (3 Floating 4K Curved Screens in 3D Space)
    // =========================================================================
    this.buildVirtualPCDesktop();

    // =========================================================================
    // CYBERPUNK SKYSCRAPERS & NEON ADVERTISEMENTS
    // =========================================================================
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0b1020,
      roughness: 0.25,
      metalness: 0.85
    });

    const windowColors = [0x00f0ff, 0xff007f, 0x7928ca, 0xffb703];

    for (let i = 0; i < 50; i++) {
      const h = Math.random() * 45 + 20;
      const w = Math.random() * 8 + 5;
      const d = Math.random() * 8 + 5;

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 45 + 24;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const geo = new THREE.BoxGeometry(w, h, d);
      const bMesh = new THREE.Mesh(geo, buildingMat);
      bMesh.position.set(x, h / 2 - 6, z);
      this.scene.add(bMesh);
      this.envObjects.push(bMesh);

      // Neon billboard stripes
      if (Math.random() > 0.35) {
        const stripeGeo = new THREE.BoxGeometry(w + 0.15, 1.2, d + 0.15);
        const col = windowColors[Math.floor(Math.random() * windowColors.length)];
        const stripeMat = new THREE.MeshBasicMaterial({ color: col });
        const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
        stripeMesh.position.set(x, Math.random() * (h * 0.7) - 2, z);
        this.scene.add(stripeMesh);
        this.envObjects.push(stripeMesh);
      }
    }

    // Flying Vehicles / Cyberpunk Traffic
    for (let i = 0; i < 24; i++) {
      const trailGeo = new THREE.CylinderGeometry(0.08, 0.08, 7, 8);
      trailGeo.rotateZ(Math.PI / 2);
      const isCyan = Math.random() > 0.5;
      const trailMat = new THREE.MeshBasicMaterial({
        color: isCyan ? 0x00f0ff : 0xff0055
      });
      const trail = new THREE.Mesh(trailGeo, trailMat);
      const rad = Math.random() * 35 + 16;
      const ang = Math.random() * Math.PI * 2;
      trail.position.set(Math.cos(ang) * rad, Math.random() * 16 + 2, Math.sin(ang) * rad);
      trail.rotation.y = ang + Math.PI / 2;
      trail.userData.speed = (Math.random() * 0.45 + 0.25) * (isCyan ? 1 : -1);
      trail.userData.radius = rad;
      trail.userData.angle = ang;
      this.scene.add(trail);
      this.envObjects.push(trail);
    }
  }

  // 3 Floating 4K Curved Screens representing the PC Virtual Desktop
  buildVirtualPCDesktop() {
    const desktopGroup = new THREE.Group();
    desktopGroup.name = 'Virtual_PC_Desktop_Cluster';
    desktopGroup.position.set(0, 1.2, -14);

    const screenAngles = [-0.35, 0, 0.35];
    const screenTexts = [
      '🖥️ МОНИТОР 1: STEAMVR // CYBERPUNK 2077 VR [120 FPS]',
      '💻 МОНИТОР 2: РАБОЧИЙ СТОЛ WINDOWS // 4K DESKTOP STREAM',
      '📊 МОНИТОР 3: VISUAL STUDIO CODE // TELEMETRY & CHAT'
    ];

    screenAngles.forEach((ang, idx) => {
      // Screen Canvas Texture
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 1024;
      sCanvas.height = 576;
      const ctx = sCanvas.getContext('2d');

      // Wallpaper
      const grad = ctx.createLinearGradient(0, 0, 1024, 576);
      grad.addColorStop(0, '#060a1a');
      grad.addColorStop(0.5, '#0b1633');
      grad.addColorStop(1, '#110c24');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 576);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 1024; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 576); ctx.stroke();
      }
      for (let y = 0; y < 576; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
      }

      // Window Header Bar
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(0, 0, 1024, 60);
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(screenTexts[idx], 30, 40);

      // Content Box
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 80, 964, 460);

      if (idx === 0) {
        // Game Monitor
        ctx.fillStyle = '#ff007f';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('▶ HALF-LIFE: ALYX // RUNNING', 60, 160);
        ctx.fillStyle = '#f0f4fc';
        ctx.font = '22px monospace';
        ctx.fillText('• Разрешение: 3840x3550 per eye @ 120Hz', 60, 230);
        ctx.fillText('• Задержка стриминга с ПК: 6.8 мс (Wi-Fi 7)', 60, 280);
        ctx.fillText('• Битрейт кодека AV1: 500 Мбит/с без потерь', 60, 330);
        ctx.fillText('• 6DoF отслеживание рук и контроллеров', 60, 380);
      } else if (idx === 1) {
        // Main Desktop
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 38px monospace';
        ctx.fillText('ПОДКЛЮЧЕНО К ПК ЧЕРЕЗ VIRTUAL DESKTOP', 60, 160);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.fillText('Бесшовное управление мышью, клавиатурой и геймпадом', 60, 230);
        ctx.fillText('Работайте на 3 гигантских виртуальных мониторах', 60, 280);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('✓ Доступно на ПК (Windows 11 / 10)', 60, 350);
        ctx.fillText('✓ Доступно на смартфонах (iOS & Android Companion)', 60, 400);
      } else {
        // Code / Productivity
        ctx.fillStyle = '#7928ca';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('CODE & WORKSPACE 360°', 60, 160);
        ctx.fillStyle = '#a0aec0';
        ctx.font = '20px monospace';
        ctx.fillText('const vrSession = await navigator.xr.requestSession();', 60, 230);
        ctx.fillText('vrSession.enableUltraLowLatency({ pcLink: true });', 60, 270);
        ctx.fillText('// 120 FPS ultra-smooth viewport synchronization', 60, 310);
        ctx.fillText('// Full compatibility: PC + SteamVR + Mobile WebXR', 60, 350);
      }

      const screenTex = new THREE.CanvasTexture(sCanvas);
      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTex,
        side: THREE.DoubleSide
      });

      const screenGeo = new THREE.PlaneGeometry(6.4, 3.6);
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);

      // Curved radius arrangement
      const rad = 7.5;
      screenMesh.position.set(Math.sin(ang) * rad, 0, -Math.cos(ang) * rad + rad);
      screenMesh.rotation.y = -ang;

      // Outer bezel frame
      const frameGeo = new THREE.BoxGeometry(6.5, 3.7, 0.1);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x070c18,
        metalness: 0.9,
        roughness: 0.2
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.z = -0.06;
      screenMesh.add(frameMesh);

      desktopGroup.add(screenMesh);
    });

    this.scene.add(desktopGroup);
    this.envObjects.push(desktopGroup);
  }

  // Cinematic Action: Smoothly Putting On / Taking Off VR Headset
  toggleWearHeadset() {
    if (this.isWearing) {
      this.takeOffHeadset();
    } else {
      this.wearHeadset();
    }
  }

  wearHeadset() {
    if (this.isWearing) return;
    if (window.sciFiAudio) {
      window.sciFiAudio.playChime(440, 880);
      window.sciFiAudio.playClick();
    }

    this.isWearing = true;
    const wearBtn = document.getElementById('btn-wear-vr');
    const hudContainer = document.querySelector('.sim-hud-overlay');
    const mask = document.querySelector('.sim-vr-mask');

    if (wearBtn) {
      wearBtn.classList.add('active-worn');
      wearBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>СНЯТЬ VR-ОЧКИ</span>
      `;
    }

    if (mask) mask.classList.add('visible');
    if (hudContainer) hudContainer.classList.add('active');

    if (window.showToast) {
      window.showToast('Вы надели VR-очки! Перемещайтесь по локациям и осматривайтесь на 360°.', 'success');
    }

    // Smooth cinematic animation: Headset flies towards eyes
    if (this.previewHeadset && typeof gsap !== 'undefined') {
      gsap.to(this.previewHeadset.position, {
        z: 3.6,
        y: 0.1,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      gsap.to(this.previewHeadset.scale, {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      gsap.to(this.camera.position, {
        x: 0,
        y: 0,
        z: 0.1,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          this.previewHeadset.visible = false;
          if (this.previewSpot) this.previewSpot.visible = false;
        }
      });
    } else {
      if (this.previewHeadset) this.previewHeadset.visible = false;
      this.camera.position.set(0, 0, 0.1);
    }
  }

  takeOffHeadset() {
    if (!this.isWearing) return;
    if (window.sciFiAudio) window.sciFiAudio.playClick();

    const wearBtn = document.getElementById('btn-wear-vr');
    const hudContainer = document.querySelector('.sim-hud-overlay');
    const mask = document.querySelector('.sim-vr-mask');
    const explanationCard = document.getElementById('sim-explanation-card');

    if (this.previewHeadset) {
      this.previewHeadset.visible = true;
      if (this.previewSpot) this.previewSpot.visible = true;
      this.previewHeadset.position.set(0, 0, 2.5);
      this.previewHeadset.scale.set(1.2, 1.2, 1.2);
    }

    if (mask) mask.classList.remove('visible');
    if (hudContainer) hudContainer.classList.remove('active');
    if (explanationCard) explanationCard.classList.remove('active');

    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: 0,
        y: 0,
        z: 3.8,
        duration: 1.3,
        ease: 'power2.inOut'
      });
      if (this.previewHeadset) {
        gsap.to(this.previewHeadset.position, {
          x: 0,
          y: 0,
          z: 1.2,
          duration: 1.3,
          ease: 'power2.inOut'
        });
        gsap.to(this.previewHeadset.scale, {
          x: 0.65,
          y: 0.65,
          z: 0.65,
          duration: 1.3,
          ease: 'power2.inOut',
          onComplete: () => {
            this.isWearing = false;
          }
        });
      }
    } else {
      this.isWearing = false;
      this.camera.position.set(0, 0, 3.8);
      if (this.previewHeadset) {
        this.previewHeadset.position.set(0, 0, 1.2);
        this.previewHeadset.scale.set(0.65, 0.65, 0.65);
      }
    }

    if (wearBtn) {
      wearBtn.classList.remove('active-worn');
      wearBtn.innerHTML = `
        <span class="btn-wear-icon">🥽</span>
        <span>НАДЕТЬ VR-ОЧКИ И ВОЙТИ В ИГРУ</span>
      `;
    }
  }

  // Smooth Teleportation / Camera Flight to In-Game Waypoints
  flyToWaypoint(waypointId) {
    if (!this.isWearing) {
      // Automatically wear headset first
      this.wearHeadset();
    }

    if (window.sciFiAudio) window.sciFiAudio.playChime(550, 825);
    this.currentWaypoint = waypointId;

    const waypoints = {
      arena: { pos: { x: 0, y: 0, z: 0.1 }, look: { lon: -90, lat: 0 } },
      desktop: { pos: { x: 0, y: 1.2, z: -7.5 }, look: { lon: -90, lat: 0 } },
      tower: { pos: { x: 16, y: 10, z: 10 }, look: { lon: -135, lat: -20 } },
      bridge: { pos: { x: -14, y: 1.5, z: -4 }, look: { lon: -35, lat: 5 } }
    };

    const target = waypoints[waypointId] || waypoints.arena;

    // Explanatory telemetry update
    const expText = document.getElementById('waypoint-explanation');
    const expBadge = document.getElementById('waypoint-badge');
    const explanations = {
      arena: {
        badge: 'РЕЖИМ: ГЛАВНАЯ АРЕНА (120 FPS)',
        desc: 'Плавное скольжение без задержек. Угол обзора 110° и частота 120 Гц исключают укачивание.'
      },
      desktop: {
        badge: 'РЕЖИМ: ВИРТУАЛЬНЫЙ РАБОЧИЙ СТОЛ ПК',
        desc: 'Удобно для тех, у кого есть ПК: подключитесь по Wi-Fi 7 или USB-C и откройте 3 гигантских 4K монитора для игр SteamVR и работы.'
      },
      tower: {
        badge: 'РЕЖИМ: СМОТРОВАЯ ПЛОЩАДКА',
        desc: 'Масштабная панорама мегаполиса. Также доступно на смартфонах (iOS и Android) через новейшие технологии WebXR.'
      },
      bridge: {
        badge: 'РЕЖИМ: НЕОНОВЫЙ МОСТ',
        desc: 'Быстрое перемещение между игровыми зонами. Плавные траектории камеры обеспечивают 100% комфорт.'
      }
    };

    const info = explanations[waypointId];
    if (expText && info) expText.textContent = info.desc;
    if (expBadge && info) expBadge.textContent = info.badge;

    // Smooth Camera Flight via GSAP
    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: target.pos.x,
        y: target.pos.y,
        z: target.pos.z,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      gsap.to(this, {
        targetLon: target.look.lon,
        targetLat: target.look.lat,
        lon: target.look.lon,
        lat: target.look.lat,
        duration: 1.0,
        ease: 'power2.inOut'
      });
    } else {
      this.camera.position.set(target.pos.x, target.pos.y, target.pos.z);
      this.targetLon = target.look.lon;
      this.targetLat = target.look.lat;
      this.lon = target.look.lon;
      this.lat = target.look.lat;
    }
  }

  bindEvents() {
    // Wear / Take off button
    const wearBtn = document.getElementById('btn-wear-vr');
    if (wearBtn) {
      wearBtn.addEventListener('click', () => this.toggleWearHeadset());
    }

    // Waypoint Navigation Buttons
    const wpBtns = document.querySelectorAll('.sim-waypoint-btn');
    wpBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        wpBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const wp = btn.dataset.waypoint;
        this.flyToWaypoint(wp);
      });
    });

    // Mouse drag for 360 look (when wearing)
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetLon += deltaX * 0.28;
      this.targetLat -= deltaY * 0.28;
      this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetLon += deltaX * 0.35;
      this.targetLat -= deltaY * 0.35;
      this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. If not wearing headset, gently float & rotate the preview headset
    if (!this.isWearing && this.previewHeadset) {
      this.previewHeadset.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      this.previewHeadset.rotation.y = Math.sin(elapsedTime * 0.8) * 0.35;
      this.previewHeadset.rotation.x = 0.1 + Math.cos(elapsedTime * 1.0) * 0.08;
    }

    // 2. Smooth 360 Camera Look
    if (this.isWearing) {
      this.lon += (this.targetLon - this.lon) * 0.12;
      this.lat += (this.targetLat - this.lat) * 0.12;

      const phi = THREE.MathUtils.degToRad(90 - this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon);

      const target = new THREE.Vector3();
      target.x = this.camera.position.x + 500 * Math.sin(phi) * Math.cos(theta);
      target.y = this.camera.position.y + 500 * Math.cos(phi);
      target.z = this.camera.position.z + 500 * Math.sin(phi) * Math.sin(theta);
      this.camera.lookAt(target);
    } else {
      // In preview mode, camera looks directly at preview headset
      this.camera.lookAt(0, 0, 1.2);
    }

    // 3. Animate Traffic in virtual world
    this.envObjects.forEach(obj => {
      if (obj.userData && obj.userData.speed) {
        obj.userData.angle += obj.userData.speed * delta;
        const rad = obj.userData.radius;
        obj.position.x = Math.cos(obj.userData.angle) * rad;
        obj.position.z = Math.sin(obj.userData.angle) * rad;
        obj.rotation.y = obj.userData.angle + Math.PI / 2;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.VRSimulator = VRSimulator;
