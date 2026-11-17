/**
 * Windows 11 Cyberpunk Desktop Simulation & Realistic Interactive VR Games
 * Fully interactive:
 * - Desktop Icons & Window Management (Open, Close, Minimize, Maximize, Drag)
 * - Windows 11 Taskbar, Start Menu, Real-time Clock, System Tray
 * - Real playable "Beat Saber VR" rhythm slicer (Canvas 60-120fps with laser swords & sound)
 * - Real playable "Cyber Target 3D" VR shooter with crosshair, recoil, and score
 * - Windows Store with instant ordering, -40% discount, and Amirkhan's phone +7 777 777 7777
 * - Proxy Guard Firewall window & Direct Amirkhan Caller window
 */

class WindowsDesktopSimulator {
  constructor() {
    this.container = document.getElementById('windows-desktop-container');
    if (!this.container) return;

    this.activeWindow = null;
    this.zIndexCounter = 100;
    this.openWindows = new Set();
    this.minimizedWindows = new Set();

    // Beat Saber state
    this.bsGame = {
      canvas: null,
      ctx: null,
      isRunning: false,
      score: 0,
      combo: 0,
      multiplier: 1,
      cubes: [],
      particles: [],
      lastTime: 0,
      animId: null,
      mousePos: { x: 300, y: 250 },
      leftSaberPos: { x: 260, y: 250 },
      rightSaberPos: { x: 340, y: 250 }
    };

    // Cyber Target shooter state
    this.ctGame = {
      canvas: null,
      ctx: null,
      isRunning: false,
      score: 0,
      hits: 0,
      shots: 0,
      timeLeft: 30,
      timerId: null,
      targets: [],
      particles: [],
      animId: null,
      crosshair: { x: 300, y: 200 },
      recoil: 0
    };

    this.init();
  }

  init() {
    this.bindDesktopEvents();
    this.startClock();
    this.bindTaskbar();
    this.bindStartMenu();

    // By default, open the Beat Saber game window or Store window so the user immediately sees it's alive!
    setTimeout(() => {
      this.openWindow('app-beatsaber');
    }, 600);
  }

  startClock() {
    const timeEl = document.getElementById('win-taskbar-time');
    const dateEl = document.getElementById('win-taskbar-date');
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      if (dateEl) dateEl.textContent = `${day}.${month}.${year}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  bindDesktopEvents() {
    // Desktop icons click/double-click
    const icons = this.container.querySelectorAll('.win-desktop-icon');
    icons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
        if (window.sciFiAudio) window.sciFiAudio.playHover();
      });

      icon.addEventListener('dblclick', () => {
        const appId = icon.dataset.app;
        if (appId) {
          this.openWindow(appId);
        }
      });

      // Also open on single click for mobile / quick access
      icon.addEventListener('touchend', () => {
        const appId = icon.dataset.app;
        if (appId) this.openWindow(appId);
      });
    });

    // Deselect icons when clicking desktop wallpaper
    const wallpaper = this.container.querySelector('.win-desktop-wallpaper');
    if (wallpaper) {
      wallpaper.addEventListener('click', (e) => {
        if (e.target === wallpaper) {
          icons.forEach(i => i.classList.remove('selected'));
          this.closeStartMenu();
        }
      });
    }

    // Windows controls (close, minimize, maximize)
    this.container.querySelectorAll('.win-window').forEach(win => {
      const appId = win.id;

      win.addEventListener('mousedown', () => {
        this.bringToFront(win);
      });

      const btnClose = win.querySelector('.win-control-btn.close');
      if (btnClose) {
        btnClose.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeWindow(appId);
        });
      }

      const btnMin = win.querySelector('.win-control-btn.minimize');
      if (btnMin) {
        btnMin.addEventListener('click', (e) => {
          e.stopPropagation();
          this.minimizeWindow(appId);
        });
      }

      const btnMax = win.querySelector('.win-control-btn.maximize');
      if (btnMax) {
        btnMax.addEventListener('click', (e) => {
          e.stopPropagation();
          win.classList.toggle('maximized');
        });
      }

      // Simple Draggable header
      this.makeWindowDraggable(win);
    });
  }

  makeWindowDraggable(win) {
    const titleBar = win.querySelector('.win-window-titlebar');
    if (!titleBar) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-window-controls')) return;
      if (win.classList.contains('maximized')) return;
      isDragging = true;
      this.bringToFront(win);
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = win.offsetLeft;
      initialTop = win.offsetTop;

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        win.style.left = `${Math.max(10, initialLeft + deltaX)}px`;
        win.style.top = `${Math.max(10, initialTop + deltaY)}px`;
        win.style.transform = 'none';
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  openWindow(appId) {
    const win = document.getElementById(appId);
    if (!win) return;

    if (window.sciFiAudio) window.sciFiAudio.playClick();

    win.classList.remove('hidden', 'minimized');
    this.openWindows.add(appId);
    this.minimizedWindows.delete(appId);
    this.bringToFront(win);
    this.updateTaskbar();

    // Specific game initializations
    if (appId === 'app-beatsaber') {
      this.startBeatSaber();
    } else if (appId === 'app-target-shooter') {
      this.startCyberTarget();
    }
  }

  closeWindow(appId) {
    const win = document.getElementById(appId);
    if (!win) return;
    if (window.sciFiAudio) window.sciFiAudio.playHover();

    win.classList.add('hidden');
    this.openWindows.delete(appId);
    this.minimizedWindows.delete(appId);
    this.updateTaskbar();

    if (appId === 'app-beatsaber') {
      this.stopBeatSaber();
    } else if (appId === 'app-target-shooter') {
      this.stopCyberTarget();
    }
  }

  minimizeWindow(appId) {
    const win = document.getElementById(appId);
    if (!win) return;
    if (window.sciFiAudio) window.sciFiAudio.playHover();

    win.classList.add('minimized');
    this.minimizedWindows.add(appId);
    this.updateTaskbar();
  }

  bringToFront(win) {
    this.zIndexCounter++;
    win.style.zIndex = this.zIndexCounter;
    this.activeWindow = win.id;
    this.updateTaskbar();
  }

  bindTaskbar() {
    const startBtn = document.getElementById('win-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStartMenu();
      });
    }

    // Proxy shield icon in tray
    const trayShield = document.getElementById('win-tray-shield');
    if (trayShield) {
      trayShield.addEventListener('click', () => {
        this.openWindow('app-proxy-guard');
      });
    }

    // Sound icon in tray
    const traySound = document.getElementById('win-tray-sound');
    if (traySound) {
      traySound.addEventListener('click', () => {
        if (window.sciFiAudio) {
          const isUnmuted = window.sciFiAudio.toggleMute();
          traySound.title = isUnmuted ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ';
          traySound.classList.toggle('active', isUnmuted);
        }
      });
    }
  }

  bindStartMenu() {
    const startMenu = document.getElementById('win-start-menu');
    if (!startMenu) return;

    startMenu.querySelectorAll('.win-start-item').forEach(item => {
      item.addEventListener('click', () => {
        const appId = item.dataset.app;
        if (appId) {
          this.openWindow(appId);
          this.closeStartMenu();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#win-start-menu') && !e.target.closest('#win-start-btn')) {
        this.closeStartMenu();
      }
    });
  }

  toggleStartMenu() {
    const startMenu = document.getElementById('win-start-menu');
    if (!startMenu) return;
    if (window.sciFiAudio) window.sciFiAudio.playClick();
    startMenu.classList.toggle('active');
  }

  closeStartMenu() {
    const startMenu = document.getElementById('win-start-menu');
    if (startMenu) startMenu.classList.remove('active');
  }

  updateTaskbar() {
    const taskbarAppsContainer = document.getElementById('win-taskbar-apps');
    if (!taskbarAppsContainer) return;

    const allApps = [
      { id: 'app-beatsaber', name: 'Beat Saber VR', icon: '⚡' },
      { id: 'app-target-shooter', name: 'Cyber Target 3D', icon: '🎯' },
      { id: 'app-store', name: 'Магазин NEXUS VR', icon: '🛒' },
      { id: 'app-glasses-guide', name: '3D Очки & Гид', icon: '🥽' },
      { id: 'app-proxy-guard', name: 'Proxy Guard WAF', icon: '🛡️' },
      { id: 'app-contacts', name: 'Связь с Амирханом', icon: '📞' }
    ];

    let html = '';
    allApps.forEach(app => {
      const isOpen = this.openWindows.has(app.id);
      const isMinimized = this.minimizedWindows.has(app.id);
      const isActive = this.activeWindow === app.id && !isMinimized;

      if (isOpen) {
        html += `
          <button class="win-taskbar-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}" 
                  data-app="${app.id}" title="${app.name}">
            <span class="win-taskbar-icon">${app.icon}</span>
            <span class="win-taskbar-name">${app.name}</span>
          </button>
        `;
      }
    });

    taskbarAppsContainer.innerHTML = html;

    // Bind taskbar clicks
    taskbarAppsContainer.querySelectorAll('.win-taskbar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.app;
        const win = document.getElementById(appId);
        if (!win) return;

        if (this.minimizedWindows.has(appId)) {
          win.classList.remove('minimized');
          this.minimizedWindows.delete(appId);
          this.bringToFront(win);
        } else if (this.activeWindow === appId) {
          this.minimizeWindow(appId);
        } else {
          this.bringToFront(win);
        }
        this.updateTaskbar();
      });
    });
  }

  // =========================================================================
  // REAL PLAYABLE GAME 1: BEAT SABER VR (Interactive 60-120fps HTML5 Canvas)
  // =========================================================================
  startBeatSaber() {
    const canvas = document.getElementById('beatsaber-canvas');
    if (!canvas) return;

    this.bsGame.canvas = canvas;
    this.bsGame.ctx = canvas.getContext('2d');
    this.bsGame.isRunning = true;
    this.bsGame.score = 0;
    this.bsGame.combo = 0;
    this.bsGame.multiplier = 1;
    this.bsGame.cubes = [];
    this.bsGame.particles = [];
    this.bsGame.lastSpawn = 0;

    // Resize canvas to parent display
    canvas.width = canvas.clientWidth || 640;
    canvas.height = canvas.clientHeight || 380;

    // Track mouse
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.bsGame.mousePos = { x, y };

      // Left Saber (Red) and Right Saber (Cyan) offset
      this.bsGame.leftSaberPos = { x: x - 40, y: y };
      this.bsGame.rightSaberPos = { x: x + 40, y: y };
    };

    // Touch support for mobile
    canvas.ontouchmove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        this.bsGame.mousePos = { x, y };
        this.bsGame.leftSaberPos = { x: x - 40, y: y };
        this.bsGame.rightSaberPos = { x: x + 40, y: y };
      }
    };

    if (this.bsGame.animId) cancelAnimationFrame(this.bsGame.animId);
    this.loopBeatSaber = this.loopBeatSaber.bind(this);
    this.bsGame.animId = requestAnimationFrame(this.loopBeatSaber);
  }

  stopBeatSaber() {
    this.bsGame.isRunning = false;
    if (this.bsGame.animId) {
      cancelAnimationFrame(this.bsGame.animId);
      this.bsGame.animId = null;
    }
  }

  spawnBeatCube() {
    const w = this.bsGame.canvas.width;
    const h = this.bsGame.canvas.height;
    const isRed = Math.random() > 0.5;
    const lane = Math.floor(Math.random() * 4); // 4 lanes
    const laneX = (w * 0.25) + lane * (w * 0.16);

    this.bsGame.cubes.push({
      x: laneX,
      y: h * 0.15,
      z: 0.1, // Scale from distance
      color: isRed ? '#ff0055' : '#00f0ff',
      isRed: isRed,
      cut: false,
      speed: 2.8 + Math.random() * 1.5,
      size: 14
    });
  }

  createCutParticles(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.bsGame.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  loopBeatSaber(timestamp) {
    if (!this.bsGame.isRunning) return;

    const ctx = this.bsGame.ctx;
    const w = this.bsGame.canvas.width;
    const h = this.bsGame.canvas.height;

    // 1. Dark Cyber Track Background
    ctx.fillStyle = '#060a18';
    ctx.fillRect(0, 0, w, h);

    // Vanishing point perspective lines
    const vpX = w / 2;
    const vpY = h * 0.25;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 6; i++) {
      const bottomX = (w * 0.15) + i * (w * 0.7 / 6);
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Horizontal grid pulses
    const pulseOffset = (Date.now() / 15) % 40;
    for (let y = vpY; y < h; y += 40) {
      const curY = y + pulseOffset;
      if (curY < h) {
        ctx.strokeStyle = `rgba(121, 40, 202, ${0.15 + (curY / h) * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(0, curY);
        ctx.lineTo(w, curY);
        ctx.stroke();
      }
    }

    // 2. Spawn cubes periodically
    if (!this.bsGame.lastSpawn || timestamp - this.bsGame.lastSpawn > 550) {
      this.spawnBeatCube();
      this.bsGame.lastSpawn = timestamp;
    }

    // 3. Update & Render Cubes
    for (let i = this.bsGame.cubes.length - 1; i >= 0; i--) {
      const cube = this.bsGame.cubes[i];
      cube.y += cube.speed;
      cube.z += 0.018; // grows as it gets closer
      const curSize = 24 + cube.z * 40;

      // Check collision with Red (Left) or Cyan (Right) Sabers
      const leftDist = Math.hypot(cube.x - this.bsGame.leftSaberPos.x, cube.y - this.bsGame.leftSaberPos.y);
      const rightDist = Math.hypot(cube.x - this.bsGame.rightSaberPos.x, cube.y - this.bsGame.rightSaberPos.y);

      const hitRed = cube.isRed && leftDist < curSize * 0.85;
      const hitCyan = !cube.isRed && rightDist < curSize * 0.85;

      if ((hitRed || hitCyan) && !cube.cut) {
        cube.cut = true;
        this.bsGame.combo++;
        if (this.bsGame.combo > 30) this.bsGame.multiplier = 8;
        else if (this.bsGame.combo > 14) this.bsGame.multiplier = 4;
        else if (this.bsGame.combo > 5) this.bsGame.multiplier = 2;
        else this.bsGame.multiplier = 1;

        this.bsGame.score += 110 * this.bsGame.multiplier;
        this.createCutParticles(cube.x, cube.y, cube.color);
        if (window.sciFiAudio) window.sciFiAudio.playLaserSlice();
      }

      if (cube.cut || cube.y > h + 50) {
        if (!cube.cut && cube.y > h + 40) {
          // Missed cube resets combo
          this.bsGame.combo = 0;
          this.bsGame.multiplier = 1;
        }
        this.bsGame.cubes.splice(i, 1);
        continue;
      }

      // Draw Cube with Neon Glow
      ctx.save();
      ctx.shadowColor = cube.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = cube.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cube.x - curSize / 2, cube.y - curSize / 2, curSize, curSize, 6);
      } else {
        ctx.rect(cube.x - curSize / 2, cube.y - curSize / 2, curSize, curSize);
      }
      ctx.fill();
      ctx.stroke();

      // White inner directional slice triangle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cube.x, cube.y - curSize * 0.25);
      ctx.lineTo(cube.x - curSize * 0.25, cube.y + curSize * 0.2);
      ctx.lineTo(cube.x + curSize * 0.25, cube.y + curSize * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 4. Update & Render Particles
    for (let i = this.bsGame.particles.length - 1; i >= 0; i--) {
      const p = this.bsGame.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.bsGame.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Laser Sabers (Left = Red, Right = Cyan)
    this.drawLaserSaber(ctx, this.bsGame.leftSaberPos.x, this.bsGame.leftSaberPos.y, '#ff0055', 'КРАСНЫЙ МЕЧ');
    this.drawLaserSaber(ctx, this.bsGame.rightSaberPos.x, this.bsGame.rightSaberPos.y, '#00f0ff', 'СИНИЙ МЕЧ');

    // 6. HUD: Score, Combo, Multiplier
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`SCORE: ${this.bsGame.score}`, 24, 38);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`COMBO: ${this.bsGame.combo}x [MULTIPLIER ${this.bsGame.multiplier}X]`, 24, 64);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px sans-serif';
    ctx.fillText('Управляйте курсором мыши или пальцем. Разрубайте кубы!', w - 340, 36);

    // Update in-window DOM counters if present
    const scoreVal = document.getElementById('bs-score-val');
    const comboVal = document.getElementById('bs-combo-val');
    if (scoreVal) scoreVal.textContent = this.bsGame.score;
    if (comboVal) comboVal.textContent = `${this.bsGame.combo}x (${this.bsGame.multiplier}X)`;

    this.bsGame.animId = requestAnimationFrame(this.loopBeatSaber);
  }

  drawLaserSaber(ctx, x, y, color, label) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;

    // Saber glowing beam
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 45);
    ctx.lineTo(x, y - 55);
    ctx.stroke();

    // White core beam
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x, y - 50);
    ctx.stroke();

    // Hilt / Handle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1c2230';
    ctx.fillRect(x - 5, y + 45, 10, 28);
    ctx.fillStyle = color;
    ctx.fillRect(x - 5, y + 68, 10, 4);

    ctx.restore();
  }

  // =========================================================================
  // REAL PLAYABLE GAME 2: CYBER TARGET 3D (Interactive First-Person VR Shooter)
  // =========================================================================
  startCyberTarget() {
    const canvas = document.getElementById('shooter-canvas');
    if (!canvas) return;

    this.ctGame.canvas = canvas;
    this.ctGame.ctx = canvas.getContext('2d');
    this.ctGame.isRunning = true;
    this.ctGame.score = 0;
    this.ctGame.shots = 0;
    this.ctGame.hits = 0;
    this.ctGame.timeLeft = 30;
    this.ctGame.targets = [];
    this.ctGame.particles = [];
    this.ctGame.recoil = 0;

    canvas.width = canvas.clientWidth || 640;
    canvas.height = canvas.clientHeight || 380;

    // Crosshair movement
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.ctGame.crosshair.x = e.clientX - rect.left;
      this.ctGame.crosshair.y = e.clientY - rect.top;
    };

    // Shooting on click
    canvas.onclick = () => {
      this.fireWeapon();
    };

    // Timer countdown
    if (this.ctGame.timerId) clearInterval(this.ctGame.timerId);
    this.ctGame.timerId = setInterval(() => {
      if (!this.ctGame.isRunning) return;
      this.ctGame.timeLeft--;
      const timerEl = document.getElementById('ct-timer-val');
      if (timerEl) timerEl.textContent = `${this.ctGame.timeLeft}s`;

      if (this.ctGame.timeLeft <= 0) {
        this.ctGame.isRunning = false;
        clearInterval(this.ctGame.timerId);
        if (window.showToast) {
          window.showToast(`🎯 Раунд завершен! Ваш результат: ${this.ctGame.score} очков. Точность: ${Math.round((this.ctGame.hits / (this.ctGame.shots || 1)) * 100)}%`, 'success');
        }
      }
    }, 1000);

    // Initial targets
    for (let i = 0; i < 4; i++) {
      this.spawnCyberTarget();
    }

    if (this.ctGame.animId) cancelAnimationFrame(this.ctGame.animId);
    this.loopCyberTarget = this.loopCyberTarget.bind(this);
    this.ctGame.animId = requestAnimationFrame(this.loopCyberTarget);
  }

  stopCyberTarget() {
    this.ctGame.isRunning = false;
    if (this.ctGame.timerId) clearInterval(this.ctGame.timerId);
    if (this.ctGame.animId) {
      cancelAnimationFrame(this.ctGame.animId);
      this.ctGame.animId = null;
    }
  }

  spawnCyberTarget() {
    const w = this.ctGame.canvas ? this.ctGame.canvas.width : 640;
    const h = this.ctGame.canvas ? this.ctGame.canvas.height : 380;
    const isGold = Math.random() > 0.8;

    this.ctGame.targets.push({
      x: Math.random() * (w - 120) + 60,
      y: Math.random() * (h - 140) + 60,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 2,
      radius: isGold ? 22 : 32,
      isGold: isGold,
      pulse: 0,
      hp: 1,
      points: isGold ? 300 : 100
    });
  }

  fireWeapon() {
    if (!this.ctGame.isRunning || this.ctGame.timeLeft <= 0) return;

    this.ctGame.shots++;
    this.ctGame.recoil = 18; // screen kick
    if (window.sciFiAudio) window.sciFiAudio.playLaserShot();

    const cx = this.ctGame.crosshair.x;
    const cy = this.ctGame.crosshair.y;

    let hitSomething = false;
    for (let i = this.ctGame.targets.length - 1; i >= 0; i--) {
      const t = this.ctGame.targets[i];
      const dist = Math.hypot(t.x - cx, t.y - cy);

      if (dist < t.radius) {
        hitSomething = true;
        this.ctGame.hits++;
        this.ctGame.score += t.points;

        // Sparks & shockwave
        for (let p = 0; p < 24; p++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = Math.random() * 8 + 3;
          this.ctGame.particles.push({
            x: t.x,
            y: t.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: t.isGold ? '#ffb703' : '#00f0ff',
            life: 1.0,
            decay: 0.05
          });
        }

        this.ctGame.targets.splice(i, 1);
        this.spawnCyberTarget();
        break;
      }
    }

    const scoreEl = document.getElementById('ct-score-val');
    if (scoreEl) scoreEl.textContent = this.ctGame.score;
  }

  loopCyberTarget() {
    if (!this.ctGame.isRunning) return;

    const ctx = this.ctGame.ctx;
    const w = this.ctGame.canvas.width;
    const h = this.ctGame.canvas.height;

    // Recoil decay
    if (this.ctGame.recoil > 0) this.ctGame.recoil *= 0.82;

    // 1. Futuristic Shooting Gallery 3D Room
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Grid walls
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 2. Targets animation
    this.ctGame.targets.forEach(t => {
      t.x += t.vx;
      t.y += t.vy;
      if (t.x < t.radius || t.x > w - t.radius) t.vx *= -1;
      if (t.y < t.radius || t.y > h - t.radius) t.vy *= -1;
      t.pulse += 0.08;

      ctx.save();
      const col = t.isGold ? '#ffb703' : '#00f0ff';
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;

      // Outer ring
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius + Math.sin(t.pulse) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Center Bullseye
      ctx.fillStyle = t.isGold ? '#fff' : '#ff0055';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Target holographic crosshairs
      ctx.beginPath();
      ctx.moveTo(t.x - t.radius - 8, t.y); ctx.lineTo(t.x + t.radius + 8, t.y);
      ctx.moveTo(t.x, t.y - t.radius - 8); ctx.lineTo(t.x, t.y + t.radius + 8);
      ctx.stroke();

      ctx.restore();
    });

    // 3. Particles
    for (let i = this.ctGame.particles.length - 1; i >= 0; i--) {
      const p = this.ctGame.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.ctGame.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
      ctx.restore();
    }

    // 4. Crosshair at mouse pointer
    const cx = this.ctGame.crosshair.x;
    const cy = this.ctGame.crosshair.y - this.ctGame.recoil;

    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 28, cy); ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 28, cy);
    ctx.moveTo(cx, cy - 28); ctx.lineTo(cx, cy - 8);
    ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 28);
    ctx.stroke();

    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. Weapon HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`SCORE: ${this.ctGame.score}`, 24, 38);
    ctx.fillStyle = '#ffb703';
    ctx.fillText(`TIME: ${this.ctGame.timeLeft}s`, w - 140, 38);

    this.ctGame.animId = requestAnimationFrame(this.loopCyberTarget);
  }
}

// Global initialization
window.WindowsDesktopSimulator = WindowsDesktopSimulator;
