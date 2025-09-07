// ---- Lightweight helper utilities ----
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Set year
  $('#year').textContent = new Date().getFullYear();

  // -------------------------
  // Theme toggle (dark mode)
  // -------------------------
  const body = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const heroPhoto = $('#heroPhoto');

  function applyTheme(theme){
    if(theme === 'dark') {
      body.classList.add('dark');
      themeToggle.setAttribute('aria-pressed','true');
      heroPhoto.src = 'photo-dark.png';
    } else {
      body.classList.remove('dark');
      themeToggle.setAttribute('aria-pressed','false');
      heroPhoto.src = 'photo-light.png';
    }
  }

  // initialize theme from localStorage or system preference
  (function initTheme(){
    try{
      const saved = localStorage.getItem('ash_theme');
      if(saved) { applyTheme(saved); }
      else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
      }
    } catch(e){ console.warn('Theme init error', e); }
  })();

  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try{ localStorage.setItem('ash_theme', next); } catch(e){}
  });

  // -------------------------
  // Typing effect for hero
  // -------------------------
  const typingEl = document.getElementById('typing');
  const phrases = ['Frontend Developer', 'UI & Interaction Designer', 'Performance Enthusiast', 'Accessibility Advocate'];
  let tIndex = 0, charIndex = 0, typingForward = true;

  function typeLoop(){
    const current = phrases[tIndex];
    if(typingForward){
      charIndex++;
      typingEl.textContent = current.slice(0,charIndex);
      if(charIndex >= current.length){
        typingForward = false;
        setTimeout(typeLoop, 1100);
        return;
      }
    } else {
      charIndex--;
      typingEl.textContent = current.slice(0,charIndex);
      if(charIndex <= 0){
        typingForward = true;
        tIndex = (tIndex+1) % phrases.length;
      }
    }
    setTimeout(typeLoop, typingForward ? 90 : 30);
  }
  setTimeout(typeLoop, 600);

  // -------------------------
  // Smooth scroll offset for anchored links (compensate for fixed header)
  // -------------------------
  const navLinks = $$('.nav-link');
  function scrollToId(id){
    const el = document.getElementById(id);
    if(!el) return;
    const topOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 68;
    const rect = el.getBoundingClientRect();
    const target = window.scrollY + rect.top - topOffset + 8;
    window.scrollTo({top: target, behavior:'smooth'});
  }
  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('data-target');
      scrollToId(id);
      navLinks.forEach(n=>n.classList.remove('active'));
      a.classList.add('active');
    });
  });

  const sections = $$('#main section');
  const navMap = {};
  navLinks.forEach(link => navMap[link.getAttribute('data-target')] = link);

  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        if(navMap[id]){
          navLinks.forEach(n => n.classList.remove('active'));
          navMap[id].classList.add('active');
        }
      }
    });
  }, obsOptions);

  sections.forEach(s => sectionObserver.observe(s));

  // -------------------------
  // Skills progress animation using IntersectionObserver
  // -------------------------
  const skills = $$('.skill');
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const level = el.getAttribute('data-level') || 0;
        const bar = el.querySelector('.progress > i');
        bar.style.width = level + '%';
        observer.unobserve(el);
      }
    });
  }, {threshold: 0.35});
  skills.forEach(s => skillObserver.observe(s));

  // -------------------------
  // Simple contact form validation and submission
  // -------------------------
  const contactForm = $('#contactForm');
  const formMsg = $('#formMsg');

  function isEmail(email){
    return /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    if(!name){ formMsg.textContent = 'Please enter your name.'; return; }
    if(!email || !isEmail(email)){ formMsg.textContent = 'Please enter a valid email.'; return; }
    if(!message || message.length < 10){ formMsg.textContent = 'Message should be at least 10 characters.'; return; }

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    const oldBtnText = btn.textContent;
    btn.textContent = 'Sending...';

    try {
      const response = await fetch('/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        formMsg.textContent = 'Thanks — your message has been received!';
        contactForm.reset();
      } else {
        formMsg.textContent = 'Oops! Something went wrong. Please try again later.';
      }
    } catch (error) {
      console.error('Submission error:', error);
      formMsg.textContent = 'Failed to send message. Check your connection.';
    } finally {
      btn.disabled = false;
      btn.textContent = oldBtnText;
    }
  });

  // -------------------------
  // Accessibility: allow keyboard focus to show subtle elevation
  // -------------------------
  $$('.service-card, .project-card').forEach(t => {
    t.addEventListener('focus', () => t.style.transform = 'translateY(-8px)');
    t.addEventListener('blur', () => t.style.transform = '');
  });