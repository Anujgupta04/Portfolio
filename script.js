/**
 * Ramanujgupta — PORTFOLIO
 * script.js
 *
 * Features:
 *  1. Dark / Light theme toggle (with localStorage persistence)
 *  2. Sticky navbar with scroll-shadow
 *  3. Hamburger mobile menu
 *  4. Active nav-link highlighting based on scroll position
 *  5. AOS-lite — scroll-triggered entrance animations
 *  6. Progress-bar skill animations (triggered on section entry)
 *  7. Contact form — client-side validation + mailto fallback
 *  8. Back-to-top button
 *  9. Smooth-scroll for all anchor links
 */


/* ── Helper: select elements ─────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ========================================================
   1. THEME TOGGLE
   ======================================================== */
const THEME_KEY   = 'portfolio-theme';
const themeToggle = $('#themeToggle');
const themeIcon   = $('#themeIcon');
const htmlEl      = document.documentElement;

/**
 * Apply a theme ('dark' or 'light') to <html data-theme="...">
 * and update the toggle button icon.
 */
function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  // Switch icon: show moon in dark mode, sun in light mode
  if (theme === 'dark') {
    themeIcon.className = 'ph ph-sun';
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    themeIcon.className = 'ph ph-moon';
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// Restore saved preference (or default to dark)
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ========================================================
   2. STICKY NAVBAR WITH SHADOW
   ======================================================== */
const navbar = $('#navbar');

function handleNavbarScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run once on load


/* ========================================================
   3. HAMBURGER MOBILE MENU
   ======================================================== */
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu when a nav link is clicked
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});


/* ========================================================
   4. ACTIVE NAV-LINK HIGHLIGHTING
   ======================================================== */
const sections  = $$('section[id]');
const navAnchors = $$('.nav-link');

/**
 * Find which section is most visible in the viewport
 * and highlight the corresponding nav link.
 */
function updateActiveNav() {
  const scrollY = window.scrollY;

  sections.forEach(section => {
    const top    = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;

    if (scrollY >= top && scrollY < bottom) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${section.id}`);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav(); // initial call


/* ========================================================
   5. AOS-LITE — INTERSECTION OBSERVER ANIMATIONS
   ======================================================== */

/**
 * Each element with [data-aos] starts invisible (set in CSS).
 * When it enters the viewport, we add the class 'aos-animate'
 * which transitions it to visible.
 */
const aosObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        // Optionally stop observing once animated
        aosObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,       // trigger when 12% visible
    rootMargin: '0px 0px -40px 0px'
  }
);

$$('[data-aos]').forEach(el => aosObserver.observe(el));


/* ========================================================
   6. SKILL PROGRESS BARS
   ======================================================== */

/**
 * Animate progress bars when the skills section
 * scrolls into view. Each .progress-fill has a
 * data-width="N" attribute (0–100).
 */
const progressFills = $$('.progress-fill');

const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const width  = target.getAttribute('data-width') || '0';
        // Use a small timeout so the CSS transition is visible
        setTimeout(() => {
          target.style.width = `${width}%`;
        }, 150);
        progressObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.3 }
);

progressFills.forEach(fill => progressObserver.observe(fill));


/* ========================================================
   7. CONTACT FORM — VALIDATION + MAILTO FALLBACK
   ======================================================== */
const contactForm    = $('#contactForm');
const nameInput      = $('#contactName');
const emailInput     = $('#contactEmail');
const messageInput   = $('#contactMessage');
const nameError      = $('#nameError');
const emailError     = $('#emailError');
const messageError   = $('#messageError');
const formSuccess    = $('#formSuccess');

/** Validate a single field; returns true if valid */
function validateField(input, errorEl, rules) {
  const value = input.value.trim();
  let msg = '';

  if (rules.required && !value) {
    msg = 'This field is required.';
  } else if (rules.email && value) {
    // Simple email regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value)) msg = 'Please enter a valid email address.';
  } else if (rules.minLength && value.length < rules.minLength) {
    msg = `Minimum ${rules.minLength} characters required.`;
  }

  errorEl.textContent = msg;

  if (msg) {
    input.style.borderColor = '#f87171';
    return false;
  } else {
    input.style.borderColor = '';
    return true;
  }
}

// Real-time validation on blur
nameInput.addEventListener('blur', () =>
  validateField(nameInput, nameError, { required: true, minLength: 2 })
);
emailInput.addEventListener('blur', () =>
  validateField(emailInput, emailError, { required: true, email: true })
);
messageInput.addEventListener('blur', () =>
  validateField(messageInput, messageError, { required: true, minLength: 10 })
);

// Clear error styling when user starts typing again
[nameInput, emailInput, messageInput].forEach(input => {
  input.addEventListener('input', () => {
    input.style.borderColor = '';
  });
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault(); // prevent default form submission

  // Validate all fields
  const validName    = validateField(nameInput,    nameError,    { required: true, minLength: 2 });
  const validEmail   = validateField(emailInput,   emailError,   { required: true, email: true });
  const validMessage = validateField(messageInput, messageError, { required: true, minLength: 10 });

  if (!validName || !validEmail || !validMessage) return; // stop if invalid

  // Build a mailto link with the form values
  const name    = encodeURIComponent(nameInput.value.trim());
  const email   = encodeURIComponent(emailInput.value.trim());
  const message = encodeURIComponent(messageInput.value.trim());

  const subject = encodeURIComponent(`Portfolio Contact from ${nameInput.value.trim()}`);
  const body    = encodeURIComponent(
    `Name: ${nameInput.value.trim()}\n` +
    `Email: ${emailInput.value.trim()}\n\n` +
    `Message:\n${messageInput.value.trim()}`
  );

  // Open the user's email client
  window.location.href = `mailto:ramanujgupta9616@gmail.com?subject=${subject}&body=${body}`;

  // Show success message and reset form
  formSuccess.classList.add('show');
  contactForm.reset();

  // Hide success message after 6 seconds
  setTimeout(() => {
    formSuccess.classList.remove('show');
  }, 6000);
});


/* ========================================================
   8. BACK-TO-TOP BUTTON
   ======================================================== */
const backToTopBtn = $('#backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ========================================================
   9. SMOOTH SCROLL — handle href="#..." links
   ======================================================== */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return; // skip empty hashes

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // Offset for the fixed navbar
    const navHeight = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


/* ========================================================
   10. TYPED TEXT EFFECT (hero subtitle — optional flair)
   ======================================================== */
/**
 * Cycles through role strings with a typing/deleting animation
 * rendered inside an element with id="typedRole".
 * This is purely decorative and won't break the page if the
 * element doesn't exist.
 */
const typedRoleEl = document.getElementById('typedRole');

if (typedRoleEl) {
  const roles    = ['Web Developer', 'Software Developer', 'UI/UX Designer', 'ML Enthusiast'];
  let   roleIdx  = 0;
  let   charIdx  = 0;
  let   isDeleting = false;

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typedRoleEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typedRoleEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 60 : 100;

    if (!isDeleting && charIdx === currentRole.length) {
      // Pause at end of word
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type(); // kick off
}


/* ========================================================
   INIT COMPLETE
   ======================================================== */
console.log('%c✦ Portfolio by Alex Morgan — Built with HTML, CSS & JS', 
  'color:#f59e0b; font-weight:bold; font-size:13px;');
