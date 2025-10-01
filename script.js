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
const starCount = 5000; // Increased star count for a denser field
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 1000; // x
  positions[i3 + 1] = (Math.random() - 0.5) * 1000; // y
  positions[i3 + 2] = (Math.random() - 0.5) * 1000; // z
}

starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  sizeAttenuation: true
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);


// ====== MOUSE INTERACTION SETUP ======
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    // Normalize mouse position from -1 to 1 for both x and y
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});


// ====== ANIMATION LOOP ======
function animate() {
  // Respect reduced-motion: if user prefers reduced motion, do not animate continuously
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) requestAnimationFrame(animate);

  // Subtle constant rotation
  starField.rotation.y += 0.0001;
  
  // Interactive rotation based on mouse position
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
        // Optionally unobserve after revealing
        ro.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => ro.observe(el));
} else {
  // Fallback: make everything visible
  revealElements.forEach(el => el.classList.add('visible'));


// ====== BOOK OVERLAY: populate pages and animate flips ======
const bookOverlay = document.getElementById('book-overlay');
const leftPage = document.querySelector('.page.left-page .page-inner');
const rightPage = document.querySelector('.page.right-page .page-inner');
const rightPageEl = document.querySelector('.page.right-page');

// Gather major content sections to put into book pages
const contentSections = Array.from(document.querySelectorAll('.content-section'));
let pages = [];
contentSections.forEach((sec) => {
  // clone section content into a simple page-like string
  const clone = sec.cloneNode(true);
  // remove heavy elements (if any) and keep text
  // convert to a compact HTML snippet
  pages.push(clone.innerHTML);
});

// Simple pagination: pair up content into spread pairs
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

// Show overlay once user scrolls past the hero area
function handleBookOverlay() {
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

// On wheel/scroll inside the overlay, flip right page forward/back
function flipToSpread(targetIndex) {
  if (targetIndex < 0 || targetIndex >= spreads.length) return;
  if (targetIndex > currentSpread) {
    // forward flip: animate right page
    rightPageEl.classList.remove('flipping');
    // force reflow to restart animation
    void rightPageEl.offsetWidth;
    rightPageEl.classList.add('flipping');
    setTimeout(() => {
      currentSpread = targetIndex;
      showSpread(currentSpread);
      // reset right page flipping style
      rightPageEl.classList.remove('flipping');
    }, 700);
  } else if (targetIndex < currentSpread) {
    // backward: just show previous spread (quick effect)
    currentSpread = targetIndex;
    showSpread(currentSpread);
  }
}

// Map scroll position to spread index
function updateSpreadFromScroll() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0 || spreads.length === 0) return;
  const pct = Math.min(1, Math.max(0, window.scrollY / docHeight));
  const target = Math.floor(pct * spreads.length);
  if (target !== currentSpread) flipToSpread(target);
}

window.addEventListener('scroll', () => {
  handleBookOverlay();
  updateSpreadFromScroll();
}, { passive: true });

// Initial call
handleBookOverlay();

// ====== SCROLLSPY: highlight active nav link ======
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function updateActiveNav() {
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
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.classList.toggle('open', open);
    // announce
    const menuLive = document.getElementById('menu-live');
    if (menuLive) menuLive.textContent = open ? 'Menu opened' : 'Menu closed';
    if (open) {
      // optionally trap focus; for now focus the first link
      const focusable = mobileMenu.querySelectorAll('a');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first) first.focus();

      // simple focus trap
      mobileMenu.addEventListener('keydown', function trap(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      });
    }
  });

  // close when a mobile link is clicked
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('open');
    const menuLive = document.getElementById('menu-live');
    if (menuLive) menuLive.textContent = 'Menu closed';
  }));

  // close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// ====== TYPEWRITER BRAND EFFECT ======
const rotatorEl = document.querySelector('.brand-rotator');
const typewriterEl = rotatorEl ? rotatorEl.querySelector('.typewriter') : null;
const brandLive = document.getElementById('brand-live');
const hiddenWords = rotatorEl ? Array.from(rotatorEl.querySelectorAll('.word')) : [];

// Typewriter settings (slower, more deliberate)
const TYPING_SPEED = 90; // ms per char
const DELETING_SPEED = 45;
const HOLD_AFTER_COMPLETE = 2000; // pause after word typed

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
    // typing
    twPos = Math.min(currentWord.length, twPos + 1);
    typewriterEl.textContent = currentWord.slice(0, twPos);
    if (brandLive) brandLive.textContent = typewriterEl.textContent;
    if (twPos === currentWord.length) {
      // hold then start deleting
      isDeleting = true;
      setTimeout(typeTick, HOLD_AFTER_COMPLETE);
      return;
    }
    setTimeout(typeTick, TYPING_SPEED);
  } else {
    // deleting
    twPos = Math.max(0, twPos - 1);
    typewriterEl.textContent = currentWord.slice(0, twPos);
    if (brandLive) brandLive.textContent = typewriterEl.textContent;
    if (twPos === 0) {
      // move to next word
      isDeleting = false;
      twIndex = (twIndex + 1) % hiddenWords.length;
      setTimeout(typeTick, 220);
      return;
    }
    setTimeout(typeTick, DELETING_SPEED);
  }
}

// start slightly after hero entrance animation completes
setTimeout(typeTick, 900);

// respect reduced motion for typewriter (stop typing if reduced)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReduced.matches) {
  // immediately set the visible word and stop animation
  const rotatorEl = document.querySelector('.brand-rotator');
  const typewriterEl = rotatorEl ? rotatorEl.querySelector('.typewriter') : null;
  const firstWord = rotatorEl ? rotatorEl.querySelector('.word') : null;
  if (typewriterEl && firstWord) typewriterEl.textContent = firstWord.textContent;
}

// Close overlay when clicking outside the book (on the overlay background)
if (bookOverlay) {
  bookOverlay.addEventListener('click', (e) => {
    if (e.target === bookOverlay) {
      // scroll back near top to hide overlay
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Close overlay on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (bookOverlay && bookOverlay.classList.contains('open')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});
}

// ====== SMALL UX ENHANCEMENTS ======
// Make header logo clickable to scroll to hero
const logoLink = document.querySelector('.logo');
if (logoLink) {
  logoLink.style.cursor = 'pointer';
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    const hero = document.querySelector('.hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Toggle a custom cursor class when hovering the arrow CTA for a bigger interactive pointer
const arrowCTA = document.querySelector('.cta-button.cta-arrow');
if (arrowCTA) {
  arrowCTA.addEventListener('mouseenter', () => document.body.classList.add('custom-cursor'));
  arrowCTA.addEventListener('mouseleave', () => document.body.classList.remove('custom-cursor'));
  // keyboard focus should also show it
  arrowCTA.addEventListener('focus', () => document.body.classList.add('custom-cursor'));
  arrowCTA.addEventListener('blur', () => document.body.classList.remove('custom-cursor'));
}

// Also apply the same behavior to all section-down buttons
const sectionDowns = document.querySelectorAll('.cta-button.section-down');
if (sectionDowns && sectionDowns.length) {
  sectionDowns.forEach(btn => {
    btn.addEventListener('mouseenter', () => document.body.classList.add('custom-cursor'));
    btn.addEventListener('mouseleave', () => document.body.classList.remove('custom-cursor'));
    btn.addEventListener('focus', () => document.body.classList.add('custom-cursor'));
    btn.addEventListener('blur', () => document.body.classList.remove('custom-cursor'));
  });
}

// Update CSS variables for the custom cursor ring when active
// Keep this minimal and respect reduced-motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
  document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('custom-cursor')) return;
    document.body.style.setProperty('--cursor-x', e.clientX + 'px');
    document.body.style.setProperty('--cursor-y', e.clientY + 'px');
  }, { passive: true });
}
