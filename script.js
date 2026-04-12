// Dismiss Alert Banner
const dismissBtn = document.getElementById('dismiss-alert');
if(dismissBtn) {
  dismissBtn.addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
  });
}

// Sticky Nav Scroll Effect
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  const isHome = document.getElementById('view-home').classList.contains('active');
  if (!isHome || window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Fade Up Animation Observer
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => {
  fadeObserver.observe(el);
});

// Research Area Filter Logic
const areaBtns = document.querySelectorAll('.area-btn');
const pubCards = document.querySelectorAll('.pub-card');

areaBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    areaBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked
    btn.classList.add('active');
    
    const filterTerm = btn.getAttribute('data-filter');
    
    pubCards.forEach(card => {
      if (filterTerm === 'all' || card.getAttribute('data-area') === filterTerm) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if(targetId === '#' || targetId.startsWith('#view')) return;
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if(targetElement) {
      const navHeight = document.getElementById('main-nav').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// SPA View Switching Logic
const navTabs = document.querySelectorAll('.nav-tab');
const views = document.querySelectorAll('.view');

navTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active from all tabs
    navTabs.forEach(t => t.classList.remove('active'));
    // Add active to clicked
    tab.classList.add('active');
    
    // Hide all views
    views.forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    
    // Show target view
    const targetId = tab.getAttribute('data-target');
    const targetView = document.getElementById(targetId);
    if(targetView) {
      targetView.classList.add('active');
      targetView.style.display = 'block';
      
      // Keep nav bar solid on non-home tabs
      const nav = document.getElementById('main-nav');
      if (targetId !== 'view-home') {
        nav.classList.add('scrolled');
      } else if (window.scrollY <= 50) {
        nav.classList.remove('scrolled');
      }

      // Reset scroll
      window.scrollTo(0, 0);
      
      // Re-trigger fade-up animations in the new view
      const fadeElements = targetView.querySelectorAll('.fade-up');
      fadeElements.forEach(el => {
        el.classList.remove('visible');
        fadeObserver.observe(el);
      });
    }
  });
});
