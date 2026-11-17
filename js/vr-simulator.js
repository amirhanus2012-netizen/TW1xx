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

  // 3 Floating 4K Curved Screens representing the Authentic Windows 11 PC Desktop
  buildVirtualPCDesktop() {
    // Canvas roundRect Polyfill for all browsers
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
        let radii = typeof r === 'number' ? [r, r, r, r] : (Array.isArray(r) ? r : [0, 0, 0, 0]);
        while (radii.length < 4) radii.push(radii[0] || 0);
        const [tl, tr, br, bl] = radii;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        return this;
      };
    }

    const desktopGroup = new THREE.Group();
    desktopGroup.name = 'Virtual_PC_Desktop_Cluster';
    desktopGroup.position.set(0, 1.2, -14);

    const screenAngles = [-0.35, 0, 0.35];

    // Helper: Draw authentic Windows 11 Bloom Wallpaper
    const drawWin11Wallpaper = (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 80, w * 0.5, h * 0.5, w * 0.7);
      grad.addColorStop(0, '#1a3668');
      grad.addColorStop(0.35, '#0e2044');
      grad.addColorStop(0.75, '#081126');
      grad.addColorStop(1, '#040714');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Windows 11 Bloom central flower petals
      ctx.save();
      ctx.translate(w * 0.5, h * 0.46);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 45;

      const petalColors = [
        'rgba(0, 210, 255, 0.65)',
        'rgba(0, 112, 243, 0.75)',
        'rgba(121, 40, 202, 0.55)',
        'rgba(0, 240, 255, 0.45)'
      ];

      for (let p = 0; p < 8; p++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.fillStyle = petalColors[p % petalColors.length];
        ctx.beginPath();
        ctx.ellipse(0, -90, 75, 150, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner glowing core of the bloom
      const coreGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.6)');
      coreGrad.addColorStop(1, 'rgba(0, 112, 243, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw Windows 11 Taskbar
    const drawWin11Taskbar = (ctx, w, h, activeTitle = 'SteamVR') => {
      const barH = 68;
      const barY = h - barH;

      // Translucent Acrylic Taskbar
      ctx.fillStyle = 'rgba(12, 18, 34, 0.92)';
      ctx.fillRect(0, barY, w, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, barY);
      ctx.lineTo(w, barY);
      ctx.stroke();

      // Centered Icons (Windows 11 Layout)
      const centerX = w * 0.5;
      const startX = centerX - 180;

      // 1. Windows Start Logo (4 Blue Squares)
      ctx.fillStyle = '#00a4ef';
      const logoSize = 10;
      const gap = 3;
      const lw = startX;
      const lh = barY + 24;
      ctx.fillRect(lw, lh, logoSize, logoSize);
      ctx.fillRect(lw + logoSize + gap, lh, logoSize, logoSize);
      ctx.fillRect(lw, lh + logoSize + gap, logoSize, logoSize);
      ctx.fillRect(lw + logoSize + gap, lh + logoSize + gap, logoSize, logoSize);

      // 2. Search Pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(startX + 40, barY + 16, 110, 36, 18);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('⌕  Поиск', startX + 58, barY + 39);

      // 3. Taskbar Apps (Explorer, Edge, SteamVR, Discord, Store)
      const apps = [
        { icon: '📁', name: 'Explorer', active: false },
        { icon: '🌐', name: 'Edge', active: false },
        { icon: '🎮', name: 'SteamVR', active: true },
        { icon: '💬', name: 'Discord', active: false },
        { icon: '🛒', name: 'Store', active: false }
      ];

      apps.forEach((app, i) => {
        const appX = startX + 170 + i * 46;
        if (app.active) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
          ctx.beginPath();
          ctx.roundRect(appX - 8, barY + 14, 40, 40, 8);
          ctx.fill();

          // Active indicator pill
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.roundRect(appX + 2, barY + 60, 20, 3, 2);
          ctx.fill();
        }

        ctx.font = '22px sans-serif';
        ctx.fillText(app.icon, appX, barY + 41);
      });

      // System Tray (Right Side)
      const trayX = w - 340;
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('🛡️ PROXY SHIELD: OK', trayX, barY + 40);

      ctx.font = '16px sans-serif';
      ctx.fillText('📶  🔊  🔋', trayX + 180, barY + 40);

      // Clock & Date
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('17:20', w - 85, barY + 32);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('17.11.2026', w - 85, barY + 52);
    };

    // Helper: Draw Desktop Icons Column on Left
    const drawDesktopIcons = (ctx) => {
      const icons = [
        { glyph: '🖥️', label: 'Этот компьютер' },
        { glyph: '📁', label: 'Документы VR' },
        { glyph: '🎮', label: 'SteamVR.exe' },
        { glyph: '⚡', label: 'Beat Saber VR' },
        { glyph: '🎯', label: 'Half-Life: Alyx' },
        { glyph: '🛒', label: 'Магазин VR (-20%)' },
        { glyph: '📞', label: 'Амирхан (+7 777)' },
        { glyph: '🗑️', label: 'Корзина' }
      ];

      icons.forEach((ic, i) => {
        const x = 32;
        const y = 30 + i * 82;

        ctx.font = '32px sans-serif';
        ctx.fillText(ic.glyph, x + 16, y + 36);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(ic.label, x, y + 62);
        ctx.shadowBlur = 0;
      });
    };

    // Helper: Draw Windows 11 App Window Frame
    const drawWindowFrame = (ctx, x, y, width, height, title, icon = '💻') => {
      // Window Background with subtle shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 35;
      ctx.fillStyle = 'rgba(14, 20, 38, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 12);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 12);
      ctx.stroke();

      // Titlebar
      ctx.fillStyle = 'rgba(8, 12, 24, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x, y, width, 44, [12, 12, 0, 0]);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(x, y + 44);
      ctx.lineTo(x + width, y + 44);
      ctx.stroke();

      // Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${icon}  ${title}`, x + 16, y + 28);

      // Window Control Buttons (— ▢ ✕)
      const ctrlX = x + width - 110;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText('—', ctrlX, y + 28);
      ctx.fillText('▢', ctrlX + 35, y + 28);
      ctx.fillStyle = '#ff4d4f';
      ctx.fillText('✕', ctrlX + 70, y + 28);
    };

    screenAngles.forEach((ang, idx) => {
      // High-resolution Screen Canvas (1600 x 900)
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 1600;
      sCanvas.height = 900;
      const ctx = sCanvas.getContext('2d');

      // 1. Draw Windows 11 Wallpaper
      drawWin11Wallpaper(ctx, 1600, 900);

      // 2. Draw Desktop Icons
      drawDesktopIcons(ctx);

      // 3. Draw Windows Application Windows based on monitor
      if (idx === 1) {
        // =====================================================================
        // CENTER MONITOR: MAIN WINDOWS 11 DESKTOP WITH STEAMVR LAUNCHER
        // =====================================================================
        drawWindowFrame(ctx, 230, 70, 1280, 720, 'SteamVR 2026 // Half-Life: Alyx & Beat Saber [120 FPS]', '🎮');

        // Status Bar inside Window
        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(260, 130, 1220, 50, 8);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('● ГОТОВО К ИГРЕ // ШЛЕМ ПОДКЛЮЧЕН ПО WI-FI 7 // 120 FPS ULTRA-SMOOTH', 285, 162);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('ЗАДЕРЖКА: 6.8 МС  |  КОДЕК: AV1 500 МБИТ/С', 1040, 162);

        // Featured Game Card 1: Half-Life Alyx
        ctx.fillStyle = 'rgba(6, 12, 28, 0.9)';
        ctx.beginPath();
        ctx.roundRect(260, 200, 595, 380, 12);
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ff007f';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('▶ HALF-LIFE: ALYX', 290, 250);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px sans-serif';
        ctx.fillText('• Разрешение: Dual Micro-OLED 4K (3840x3550 per eye)', 290, 295);
        ctx.fillText('• Физика взаимодействия: 6DoF отслеживание рук', 290, 335);
        ctx.fillText('• Пространственный 3D-звук Spatial Audio', 290, 375);
        ctx.fillText('• Плавность 120 Гц без укачивания', 290, 415);

        // Green Play Button
        ctx.fillStyle = 'linear-gradient(135deg, #10b981, #059669)';
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(290, 470, 320, 55, 10);
        ctx.fill();
        ctx.fillStyle = '#021008';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('▶ ЗАПУСТИТЬ В VR-ОЧКАХ', 330, 505);

        // Featured Game Card 2: Beat Saber VR
        ctx.fillStyle = 'rgba(6, 12, 28, 0.9)';
        ctx.beginPath();
        ctx.roundRect(885, 200, 595, 380, 12);
        ctx.fill();
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('⚡ BEAT SABER VR // РЕАЛИСТИЧНЫЙ СЛЭШЕР', 915, 250);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px sans-serif';
        ctx.fillText('• Лазерные световые мечи с тактильной отдачей', 915, 295);
        ctx.fillText('• Неоновые кубы летят в такт киберпанк-саундтрека', 915, 335);
        ctx.fillText('• Полноценный играбельный симулятор на сайте!', 915, 375);
        ctx.fillText('• Скидка 20% при заказе у Амирхана (+7 777 777 7777)', 915, 415);

        // Magenta Play Button
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.roundRect(915, 470, 340, 55, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('⚡ СЫГРАТЬ В BEAT SABER', 955, 505);

        // Bottom Telemetry Strip inside window
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(260, 605, 1220, 65);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('🖥️ Подключено к рабочему столу ПК через Wi-Fi 7 и USB-C 40Gbps', 290, 642);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('Заказ шлема у Амирхана: +7 777 777 7777 (Скидка 20%)', 1000, 642);

      } else if (idx === 0) {
        // =====================================================================
        // LEFT MONITOR: STEAMVR LIBRARY & SETTINGS
        // =====================================================================
        drawWindowFrame(ctx, 230, 80, 1280, 700, 'SteamVR Library & Display Settings // 4K 120Hz', '📂');

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('БИБЛИОТЕКА VR-ИГР И СИМУЛЯТОРОВ 2026', 280, 160);

        const gamesList = [
          { title: '1. Beat Saber VR', desc: 'Ритм-слэшер, полный интерактив, 120 FPS' },
          { title: '2. Half-Life: Alyx', desc: 'Флагманский сюжетный AAA-шутер нового поколения' },
          { title: '3. Cyberpunk 2077 VR Mod', desc: 'Полномасштабный Найт-Сити с трассировкой лучей' },
          { title: '4. Assetto Corsa Competizione', desc: 'Ультрареалистичный автосимулятор с рулем' },
          { title: '5. Microsoft Flight Simulator 2024', desc: 'Полеты над всем земным шаром в 3D' }
        ];

        gamesList.forEach((gm, gIdx) => {
          const gy = 210 + gIdx * 90;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.beginPath();
          ctx.roundRect(280, gy, 1180, 72, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px monospace';
          ctx.fillText(gm.title, 310, gy + 32);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '15px sans-serif';
          ctx.fillText(gm.desc, 310, gy + 56);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 14px monospace';
          ctx.fillText('✓ УСТАНОВЛЕНО', 1310, gy + 42);
        });

      } else {
        // =====================================================================
        // RIGHT MONITOR: MICROSOFT EDGE BROWSER WITH NEXUS VR STORE & AMIRKHAN
        // =====================================================================
        drawWindowFrame(ctx, 230, 80, 1280, 700, 'Microsoft Edge — NEXUS VR Официальный Магазин', '🌐');

        // Address Bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.roundRect(280, 140, 1180, 42, 8);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.font = '15px monospace';
        ctx.fillText('🔒 https://nexus-vr.io/order-sale-20-amirkhan', 305, 167);

        // Store Discount Promo Banner
        ctx.fillStyle = 'linear-gradient(90deg, rgba(255,0,127,0.2), rgba(0,240,255,0.2))';
        ctx.fillStyle = 'rgba(255, 0, 127, 0.2)';
        ctx.beginPath();
        ctx.roundRect(280, 205, 1180, 60, 8);
        ctx.fill();
        ctx.fillStyle = '#ff007f';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('🔥 ГОРЯЧАЯ СКИДКА ДО -20% АКТИВИРОВАНА (ПРОМОКОД: AMIRKHAN)', 310, 242);

        // Price Cards Comparison
        const tariffs = [
          { name: 'NEXUS LITE', old: '65 000 ₽', cur: '52 000 ₽', kzt: '264 000 ₸', f: '4K Micro-OLED 90Hz' },
          { name: 'NEXUS PRO ⭐', old: '95 000 ₽', cur: '76 000 ₽', kzt: '384 000 ₸', f: 'Dual 4K 120Hz + LiDAR' },
          { name: 'NEXUS ULTIMATE', old: '130 000 ₽', cur: '104 000 ₽', kzt: '520 000 ₸', f: 'Pro + Тактильный жилет' }
        ];

        tariffs.forEach((tr, tIdx) => {
          const tx = 280 + tIdx * 400;
          ctx.fillStyle = tIdx === 1 ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)';
          ctx.beginPath();
          ctx.roundRect(tx, 285, 380, 240, 10);
          ctx.fill();
          if (tIdx === 1) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.fillStyle = tIdx === 1 ? '#00f0ff' : '#ffffff';
          ctx.font = 'bold 18px monospace';
          ctx.fillText(tr.name, tx + 24, 320);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.fillText(`Старая цена: ${tr.old}`, tx + 24, 350);

          ctx.fillStyle = '#ff007f';
          ctx.font = 'bold 28px monospace';
          ctx.fillText(tr.cur, tx + 24, 390);

          ctx.fillStyle = '#ffb703';
          ctx.font = '16px monospace';
          ctx.fillText(tr.kzt, tx + 24, 420);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '14px sans-serif';
          ctx.fillText(tr.f, tx + 24, 460);

          ctx.fillStyle = tIdx === 1 ? '#00f0ff' : 'rgba(255,255,255,0.1)';
          ctx.beginPath();
          ctx.roundRect(tx + 24, 480, 330, 36, 6);
          ctx.fill();
          ctx.fillStyle = tIdx === 1 ? '#020612' : '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText('ЗАКАЗАТЬ СО СКИДКОЙ 20%', tx + 80, 503);
        });

        // Amirkhan Contact Card inside Edge
        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(280, 545, 1180, 110, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Консультант и основатель: Амирхан', 310, 580);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('📞 +7 777 777 7777', 310, 620);
        ctx.fillStyle = '#10b981';
        ctx.font = '16px sans-serif';
        ctx.fillText('● Вам ответит лично: Амирхан (Звонок, WhatsApp, Telegram)', 720, 620);
      }

      // 4. Draw Windows 11 Taskbar across bottom
      drawWin11Taskbar(ctx, 1600, 900);

      // Create Three.js Texture with crisp mipmaps
      const screenTex = new THREE.CanvasTexture(sCanvas);
      screenTex.minFilter = THREE.LinearFilter;
      screenTex.magFilter = THREE.LinearFilter;
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
      desktop: { pos: { x: 0, y: 1.2, z: -8.0 }, look: { lon: -90, lat: 0 } },
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
        badge: 'РЕЖИМ: ВИРТУАЛЬНЫЙ РАБОЧИЙ СТОЛ WINDOWS 11 (120 FPS)',
        desc: 'Полноценный рабочий стол Windows 11 на 3 мониторах: играйте в SteamVR (Half-Life, Beat Saber), работайте и заказывайте шлем со скидкой 20% у Амирхана (+7 777 777 7777).'
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
