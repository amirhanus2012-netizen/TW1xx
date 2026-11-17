/**
 * Main Application Logic & User Interaction
 * Initializes 3D background, interactive studio, simulator, modals, and animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Audio System
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isUnmuted = window.sciFiAudio.toggleMute();
      if (isUnmuted) {
        audioToggleBtn.classList.add('active');
        audioToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span>Звук: ВКЛ</span>
        `;
        showToast('Аудиоэффекты и атмосферный саундтрек активированы', 'success');
      } else {
        audioToggleBtn.classList.remove('active');
        audioToggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span>Звук: ВЫКЛ</span>
        `;
      }
    });
  }

  // Add subtle hover sound to all interactive elements
  const hoverElements = document.querySelectorAll('button, a, .glass-card, .feature-card, .color-swatch');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.sciFiAudio) window.sciFiAudio.playHover();
    });
  });

  // 2. Initialize Background 3D Scene
  let bgScene = null;
  try {
    bgScene = new BackgroundVRScene();
  } catch (e) {
    console.error('Failed to init BackgroundVRScene', e);
  }

  // 3. Initialize Interactive 3D Studio Inspector
  let studioInspector = null;
  try {
    studioInspector = new VRStudioInspector();
    window.studioInspectorInstance = studioInspector;
  } catch (e) {
    console.error('Failed to init VRStudioInspector', e);
  }

  // 4. Initialize Interactive VR Simulator
  let vrSim = null;
  try {
    vrSim = new VRSimulator();
    window.vrSimulatorInstance = vrSim;
  } catch (e) {
    console.error('Failed to init VRSimulator', e);
  }

  // 4b. Initialize Windows 11 Desktop Simulator
  let winDesktop = null;
  try {
    winDesktop = new WindowsDesktopSimulator();
    window.winDesktopInstance = winDesktop;
  } catch (e) {
    console.error('Failed to init WindowsDesktopSimulator', e);
  }

  // Simulator Mode Switcher: Desktop vs VR 360
  const tabDesktop = document.getElementById('tab-mode-desktop');
  const tabVR360 = document.getElementById('tab-mode-vr360');
  const winDesktopContainer = document.getElementById('windows-desktop-container');
  const vr360Container = document.getElementById('vr-360-container');

  if (tabDesktop && tabVR360 && winDesktopContainer && vr360Container) {
    tabDesktop.addEventListener('click', () => {
      if (window.sciFiAudio) window.sciFiAudio.playClick();
      tabDesktop.classList.add('active');
      tabVR360.classList.remove('active');
      winDesktopContainer.style.display = 'flex';
      vr360Container.style.display = 'none';
      if (winDesktop) winDesktop.startBeatSaber();
    });

    tabVR360.addEventListener('click', () => {
      if (window.sciFiAudio) window.sciFiAudio.playClick();
      tabVR360.classList.add('active');
      tabDesktop.classList.remove('active');
      winDesktopContainer.style.display = 'none';
      vr360Container.style.display = 'block';
      if (winDesktop) winDesktop.stopBeatSaber();
      // Trigger canvas resize in vrSim
      window.dispatchEvent(new Event('resize'));
    });
  }

  // Flash Sale Live Countdown Timer (16 Hours)
  const tHours = document.getElementById('t-hours');
  const tMins = document.getElementById('t-mins');
  const tSecs = document.getElementById('t-secs');

  if (tHours && tMins && tSecs) {
    let totalSeconds = 16 * 3600; // 16 hours exactly as requested
    setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        tHours.textContent = String(h).padStart(2, '0');
        tMins.textContent = String(m).padStart(2, '0');
        tSecs.textContent = String(s).padStart(2, '0');
      }
    }, 1000);
  }

  // 5. Speak Russian Quote Button (Web Speech API)
  const speakQuoteBtn = document.getElementById('speak-quote-btn');
  const quoteTextEl = document.querySelector('.hero-quote-text');
  let isSpeaking = false;

  if (speakQuoteBtn && quoteTextEl) {
    speakQuoteBtn.addEventListener('click', () => {
      if (window.sciFiAudio) window.sciFiAudio.playClick();
      if (!isSpeaking) {
        const text = quoteTextEl.textContent.trim();
        speakQuoteBtn.classList.add('speaking');
        speakQuoteBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          <span>Остановить озвучку</span>
        `;
        isSpeaking = true;
        const utt = window.sciFiAudio.speakRussian(text);
        if (utt) {
          utt.onend = () => resetSpeechBtn();
          utt.onerror = () => resetSpeechBtn();
        } else {
          resetSpeechBtn();
        }
      } else {
        window.sciFiAudio.stopSpeaking();
        resetSpeechBtn();
      }
    });

    function resetSpeechBtn() {
      isSpeaking = false;
      speakQuoteBtn.classList.remove('speaking');
      speakQuoteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <span>Прослушать определение</span>
      `;
    }
  }

  // 6. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      if (window.sciFiAudio) window.sciFiAudio.playHover();
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 7. Modal Pre-order / Test Drive
  const modal = document.getElementById('order-modal');
  const openModalBtns = document.querySelectorAll('.open-order-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const orderForm = document.getElementById('order-form');
  const planSelect = document.getElementById('order-plan-select');

  if (modal) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.sciFiAudio) window.sciFiAudio.playClick();
        
        // Auto-select package if clicked from card
        const plan = btn.dataset.plan;
        if (plan && planSelect) {
          planSelect.value = plan;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        if (window.sciFiAudio) window.sciFiAudio.playClick();
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    if (orderForm) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (window.sciFiAudio) window.sciFiAudio.playChime(660, 990);
        modal.classList.remove('active');
        document.body.style.overflow = '';
        showToast('Заявка успешно отправлена! Консультант Амирхан (+7 777 777 7777) свяжется с вами в течение 3 минут.', 'success');
        orderForm.reset();
      });
    }
  }

  // 8. Mobile Navigation Toggle
  const mobileNavToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavMenu = document.getElementById('mobile-nav');
  if (mobileNavToggle && mobileNavMenu) {
    mobileNavToggle.addEventListener('click', () => {
      if (window.sciFiAudio) window.sciFiAudio.playClick();
      mobileNavMenu.classList.toggle('active');
      mobileNavToggle.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavMenu.classList.remove('active');
        mobileNavToggle.classList.remove('active');
      });
    });
  }

  // 9. Scroll Progress Indicator
  const progressBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });

  // 10. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (window.sciFiAudio) window.sciFiAudio.playClick();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 11. Toast Notification Utility
  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  window.showToast = showToast;
});
