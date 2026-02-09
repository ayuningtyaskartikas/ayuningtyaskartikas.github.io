// ====== THREE.JS SCENE SETUP ======
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 20;

// ====== STARFIELD CREATION ======
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 1000;     // x
  positions[i3 + 1] = (Math.random() - 0.5) * 1000; // y
  positions[i3 + 2] = (Math.random() - 0.5) * 1000; // z
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xd8d2c6,
  size: 0.35,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.55
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// ====== MOUSE INTERACTION SETUP ======
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });

// ====== ANIMATION LOOP ======
function animate() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) requestAnimationFrame(animate);

  // subtle rotation
  starField.rotation.y += 0.0001;

  // interactive rotation
  starField.rotation.x += (mouseY - starField.rotation.x) * 0.0005;
  starField.rotation.y += (mouseX - starField.rotation.y) * 0.0005;

  renderer.render(scene, camera);
}
animate();

// ====== RESIZE LISTENER ======
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ====== READING PROGRESS BAR ======
const progressBar = document.getElementById('reading-progress-bar');

function updateProgress() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ====== HEADER SHRINK ON SCROLL ======
const header = document.querySelector('.site-header');

function updateHeader() {
  if (!header) return;
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ====== REVEAL ON SCROLL ======
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealElements.length) {
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        ro.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => ro.observe(el));
} else {
  // fallback
  revealElements.forEach(el => el.classList.add('visible'));
}

// ====== BOOK OVERLAY: populate pages and animate flips ======
const bookOverlay = document.getElementById('book-overlay');
const leftPage = document.querySelector('.page.left-page .page-inner');
const rightPage = document.querySelector('.page.right-page .page-inner');
const rightPageEl = document.querySelector('.page.right-page');

// Gather major content sections to put into book pages
const contentSections = Array.from(document.querySelectorAll('.content-section'));
let pages = [];

contentSections.forEach((sec) => {
  const clone = sec.cloneNode(true);
  pages.push(clone.innerHTML);
});

const spreads = [];
for (let i = 0; i < pages.length; i += 2) {
  spreads.push([pages[i] || '', pages[i + 1] || '']);
}

function showSpread(index) {
  const s = spreads[index] || ['', ''];
  if (!leftPage || !rightPage) return;
  leftPage.innerHTML = s[0];
  rightPage.innerHTML = s[1];
}

let currentSpread = 0;

function handleBookOverlay() {
  if (!bookOverlay) return;
  const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;

  if (window.scrollY > heroHeight / 2 && spreads.length) {
    bookOverlay.style.display = 'flex';
    bookOverlay.classList.add('open');
    bookOverlay.setAttribute('aria-hidden', 'false');
    showSpread(currentSpread);
  } else {
    bookOverlay.style.display = 'none';
    bookOverlay.classList.remove('open');
    bookOverlay.setAttribute('aria-hidden', 'true');
  }
}

function flipToSpread(targetIndex) {
  if (!rightPageEl) return;
  if (targetIndex < 0 || targetIndex >= spreads.length) return;

  if (targetIndex > currentSpread) {
    rightPageEl.classList.remove('flipping');
    void rightPageEl.offsetWidth; // reflow
    rightPageEl.classList.add('flipping');

    setTimeout(() => {
      currentSpread = targetIndex;
      showSpread(currentSpread);
      rightPageEl.classList.remove('flipping');
    }, 700);
  } else if (targetIndex < currentSpread) {
    currentSpread = targetIndex;
    showSpread(currentSpread);
  }
}

function updateSpreadFromScroll() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0 || spreads.length === 0) return;

  const pct = Math.min(1, Math.max(0, window.scrollY / docHeight));
  const target = Math.min(spreads.length - 1, Math.floor(pct * spreads.length));

  if (target !== currentSpread) flipToSpread(target);
}

window.addEventListener('scroll', () => {
  handleBookOverlay();
  updateSpreadFromScroll();
}, { passive: true });

handleBookOverlay();

// Close overlay when clicking outside the book
if (bookOverlay) {
  bookOverlay.addEventListener('click', (e) => {
    if (e.target === bookOverlay) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Close overlay on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (bookOverlay && bookOverlay.classList.contains('open')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});

// ====== SCROLLSPY: highlight active nav link ======
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function updateActiveNav() {
  if (!sections.length) return;
  const scrollPos = window.scrollY + (window.innerHeight * 0.2);
  let activeIndex = -1;

  sections.forEach((sec, i) => {
    if (sec.offsetTop <= scrollPos) activeIndex = i;
  });

  navLinks.forEach((a, i) => a.classList.toggle('active', i === activeIndex));
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// Smooth-scroll for nav links
navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ====== MOBILE NAV TOGGLE ======
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuLive = document.getElementById('menu-live');

function closeMobileMenu() {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.classList.remove('open');
  if (menuLive) menuLive.textContent = 'Menu closed';
}

function openMobileMenu() {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.classList.add('open');
  if (menuLive) menuLive.textContent = 'Menu opened';

  // focus first link
  const focusable = mobileMenu.querySelectorAll('a');
  if (focusable.length) focusable[0].focus();
}

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });

  // close when a mobile link is clicked
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileMenu());
  });

  // click outside to close
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('open')) return;
    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedToggle = navToggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) closeMobileMenu();
  });

  // Escape closes menu
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
      navToggle.focus();
    }
  });

  // close menu if resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileMenu();
  });
}

// ====== TYPEWRITER BRAND EFFECT ======
const rotatorEl = document.querySelector('.brand-rotator');
const typewriterEl = rotatorEl ? rotatorEl.querySelector('.typewriter') : null;
const brandLive = document.getElementById('brand-live');
const hiddenWords = rotatorEl ? Array.from(rotatorEl.querySelectorAll('.word')) : [];

const TYPING_SPEED = 90;
const DELETING_SPEED = 45;
const HOLD_AFTER_COMPLETE = 2000;

let twIndex = 0;
let twPos = 0;
let isDeleting = false;

function typeTick() {
  if (!typewriterEl || hiddenWords.length === 0) return;

  // pause typewriter if book overlay is open
  if (bookOverlay && bookOverlay.classList.contains('open')) {
    setTimeout(typeTick, 400);
    return;
  }

  const currentWord = hiddenWords[twIndex].textContent.trim();

  if (!isDeleting) {
    twPos = Math.min(currentWord.length, twPos + 1);
    typewriterEl.textContent = currentWord.slice(0, twPos);
    if (brandLive) brandLive.textContent = typewriterEl.textContent;

    if (twPos === currentWord.length) {
      isDeleting = true;
      setTimeout(typeTick, HOLD_AFTER_COMPLETE);
      return;
    }

    setTimeout(typeTick, TYPING_SPEED);
  } else {
    twPos = Math.max(0, twPos - 1);
    typewriterEl.textContent = currentWord.slice(0, twPos);
    if (brandLive) brandLive.textContent = typewriterEl.textContent;

    if (twPos === 0) {
      isDeleting = false;
      twIndex = (twIndex + 1) % hiddenWords.length;
      setTimeout(typeTick, 220);
      return;
    }

    setTimeout(typeTick, DELETING_SPEED);
  }
}

setTimeout(typeTick, 900);

// respect reduced motion for typewriter
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReduced.matches) {
  const firstWord = rotatorEl ? rotatorEl.querySelector('.word') : null;
  if (typewriterEl && firstWord) typewriterEl.textContent = firstWord.textContent;
}

// ====== SMALL UX ENHANCEMENTS ======
const logoLink = document.querySelector('.logo');
if (logoLink) {
  logoLink.style.cursor = 'pointer';
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    const hero = document.querySelector('.hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Custom cursor ring for CTA buttons
const arrowCTA = document.querySelector('.cta-button.cta-arrow');
if (arrowCTA) {
  arrowCTA.addEventListener('mouseenter', () => document.body.classList.add('custom-cursor'));
  arrowCTA.addEventListener('mouseleave', () => document.body.classList.remove('custom-cursor'));
  arrowCTA.addEventListener('focus', () => document.body.classList.add('custom-cursor'));
  arrowCTA.addEventListener('blur', () => document.body.classList.remove('custom-cursor'));
}

const sectionDowns = document.querySelectorAll('.cta-button.section-down');
if (sectionDowns.length) {
  sectionDowns.forEach(btn => {
    btn.addEventListener('mouseenter', () => document.body.classList.add('custom-cursor'));
    btn.addEventListener('mouseleave', () => document.body.classList.remove('custom-cursor'));
    btn.addEventListener('focus', () => document.body.classList.add('custom-cursor'));
    btn.addEventListener('blur', () => document.body.classList.remove('custom-cursor'));
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
  document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('custom-cursor')) return;
    document.body.style.setProperty('--cursor-x', e.clientX + 'px');
    document.body.style.setProperty('--cursor-y', e.clientY + 'px');
  }, { passive: true });
}
