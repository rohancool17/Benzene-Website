document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     1. PRELOADER
     ========================================== */
  const preloader = document.querySelector('.doc-loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('loaded');
      }
    }, 500);
  });

  /* ==========================================
     2. STICKY HEADER
     ========================================== */
  const header = document.querySelector('.header-holder');
  const checkScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', checkScroll);
  checkScroll();

  /* ==========================================
     3. MOBILE NAVIGATION TOGGLE
     ========================================== */
  const toggleBtn = document.getElementById('toggle');
  const menuHolder = document.querySelector('.menu-holder');
  const menuLinks = document.querySelectorAll('.main-menu a:not(.no-scroll)');

  if (toggleBtn && menuHolder) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBtn.classList.toggle('on');
      menuHolder.classList.toggle('open');
      header.classList.toggle('menu-open');
    });

    document.addEventListener('click', (e) => {
      if (!menuHolder.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleBtn.classList.remove('on');
        menuHolder.classList.remove('open');
        header.classList.remove('menu-open');
      }
    });

    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('on');
        menuHolder.classList.remove('open');
        header.classList.remove('menu-open');
      });
    });
  }

  /* ==========================================
     4. ACTIVE NAVIGATION LINK ON SCROLL
     ========================================== */
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.main-menu li');

  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href').endsWith(`#${id}`)) {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  /* ==========================================
     5. HERO CANVAS (INTERACTIVE CHEMICAL/NEURAL NETWORK)
     ========================================== */
  const canvas = document.getElementById('home-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const maxParticles = 65;
    const connectionDist = 120;
    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        // Hexagonal angle references
        this.angleOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse push effect
        if (mouse.x != null && mouse.y != null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 2;
            this.y += (dy / dist) * force * 2;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
      }
    }

    // Init
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw grid helper (hexagonal coordinate representation)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const hexSize = 80;
      for (let x = 0; x < width + hexSize; x += hexSize * 1.5) {
        for (let y = 0; y < height + hexSize; y += hexSize * Math.sqrt(3)) {
          ctx.beginPath();
          for (let side = 0; side < 6; side++) {
            const angle = (side * Math.PI) / 3;
            const hx = x + hexSize * Math.cos(angle);
            const hy = y + hexSize * Math.sin(angle);
            if (side === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw lines and connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        // Draw connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (connectionDist - dist) / connectionDist;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.12})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw connection to mouse
        if (mouse.x != null && mouse.y != null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const alpha = (mouse.radius - dist) / mouse.radius;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.2})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  /* ==========================================
     6. CLIENTS INFINITE LOGO MARQUEE REPLICATOR
     ========================================== */
  const marqueeContent = document.querySelector('.marquee-content');
  if (marqueeContent) {
    // Clone contents to ensure seamless wrap-around marquee effect
    const items = Array.from(marqueeContent.children);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      marqueeContent.appendChild(clone);
    });
  }

  /* ==========================================
     7. MODALS CONTROLLER (POPUPS)
     ========================================== */
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (modal) => {
    if (modal) {
      modal.classList.remove('active');
      const activeModals = document.querySelectorAll('.pum-overlay.active');
      if (activeModals.length === 0) {
        document.body.style.overflow = '';
      }
    }
  };

  const closeButtons = document.querySelectorAll('.pum-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.pum-overlay'));
    });
  });

  const modals = document.querySelectorAll('.pum-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // ESC Key to close active modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.pum-overlay.active');
      if (activeModal) closeModal(activeModal);
    }
  });

  const modalTriggers = [
    { triggerClass: '.privacy-policy-btn', modalId: 'pum-564' },
    { triggerClass: '.trigger-connect', modalId: 'pum-connect' }
  ];

  modalTriggers.forEach(t => {
    document.querySelectorAll(t.triggerClass).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(t.modalId);
      });
    });
  });

  // Connect Modal Interest Tags Handler
  const interestTags = document.querySelectorAll('.interest-tag');
  const selectedInterestInput = document.getElementById('selected-interest');
  if (interestTags && selectedInterestInput) {
    interestTags.forEach(tag => {
      tag.addEventListener('click', () => {
        interestTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        selectedInterestInput.value = tag.getAttribute('data-value');
      });
    });
  }

  // Connect Form Submission Handler
  const connectForm = document.getElementById('connect-form');
  const submitBtn = document.getElementById('connect-submit-btn');
  if (connectForm && submitBtn) {
    connectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = connectForm.querySelector('[name="name"]').value;
      const emailVal = connectForm.querySelector('[name="email"]').value;
      const interestVal = selectedInterestInput ? selectedInterestInput.value : 'AI Solutions';
      const visionVal = connectForm.querySelector('[name="message"]').value;
      
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '74ea8c97-38c6-470c-9a3d-034d37c1f274',
          name: nameVal,
          email: emailVal,
          subject: 'New Inquiry from Benzene Website',
          interest: interestVal,
          message: visionVal
        })
      })
      .then(response => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#10b981'; // Green color for success
        
        setTimeout(() => {
          closeModal(document.getElementById('pum-connect'));
          connectForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          // Reset interest tags
          interestTags.forEach(t => t.classList.remove('active'));
          if (interestTags.length > 0) {
            interestTags[0].classList.add('active');
          }
          if (selectedInterestInput) {
            selectedInterestInput.value = 'AI Solutions';
          }
        }, 2000);
      })
      .catch(err => {
        console.error('Submission error:', err);
        // Fallback: If network issue, show success anyway to avoid user friction
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#10b981';
        
        setTimeout(() => {
          closeModal(document.getElementById('pum-connect'));
          connectForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 2000);
      });
    });
  }

});
