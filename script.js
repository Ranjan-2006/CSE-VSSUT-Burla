// VSSUT CSE Department — script.js

'use strict';

// NAVBAR: Sticky + scroll class
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    toggleBackToTop();
    // updateActiveNavLink(); // Disabled to keep Home always active
});

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Mobile: Toggle dropdowns on click
document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const parent = link.closest('.has-dropdown');
            parent.classList.toggle('open');
        }
    });
});

// Close nav when a link is clicked (mobile)
document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('open');
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
    });
});

// ACTIVE NAV LINK ON SCROLL
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
}

// NEWS MODAL
document.addEventListener('DOMContentLoaded', () => {
    const newsViewAllBtn = document.getElementById('newsViewAllBtn');
    const newsModal = document.getElementById('newsModal');
    const newsModalClose = document.getElementById('newsModalClose');

    if (newsViewAllBtn && newsModal && newsModalClose) {
        newsViewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            newsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        newsModalClose.addEventListener('click', () => {
            newsModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        newsModal.addEventListener('click', (e) => {
            if (e.target === newsModal) {
                newsModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
        function openNewsModal() {
            var modal = document.getElementById('newsModal');
            if(modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        var closeBtn = document.getElementById('newsModalClose');
        if(closeBtn) {
            closeBtn.addEventListener('click', function() {
                document.getElementById('newsModal').classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        var modalOverlay = document.getElementById('newsModal');
        if(modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

// PUBLICATIONS MODAL
document.addEventListener('DOMContentLoaded', () => {
    const pubViewAllBtn = document.getElementById('viewPubBtn');
    const pubModal = document.getElementById('pubModal');
    const pubModalClose = document.getElementById('pubModalClose');

    if (pubViewAllBtn && pubModal && pubModalClose) {
        pubViewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pubModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        pubModalClose.addEventListener('click', () => {
            pubModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        pubModal.addEventListener('click', (e) => {
            if (e.target === pubModal) {
                pubModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// PROJECTS MODAL
document.addEventListener('DOMContentLoaded', () => {
    const projViewAllBtn = document.getElementById('viewProjBtn');
    const projModal = document.getElementById('projModal');
    const projModalClose = document.getElementById('projModalClose');

    if (projViewAllBtn && projModal && projModalClose) {
        projViewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            projModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        projModalClose.addEventListener('click', () => {
            projModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        projModal.addEventListener('click', (e) => {
            if (e.target === projModal) {
                projModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// PROGRAMME TABS
const progTabs = document.querySelectorAll('.prog-tab');
const progPanels = document.querySelectorAll('.prog-panel');

progTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        progTabs.forEach(t => t.classList.remove('active'));
        progPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('tab-' + target);
        if (panel) panel.classList.add('active');
    });
});

// RESEARCH TABS
const resTabs = document.querySelectorAll('.res-tab');
const resPanels = document.querySelectorAll('.res-panel');

resTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.res;
        resTabs.forEach(t => t.classList.remove('active'));
        resPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('res-' + target);
        if (panel) panel.classList.add('active');
    });
});

// PEO / PSO / PO TABS
const peoTabs = document.querySelectorAll('.peo-tab');
const peoPanels = document.querySelectorAll('.peo-panel');

peoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.peo;
        peoTabs.forEach(t => t.classList.remove('active'));
        peoPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('peo-' + target);
        if (panel) panel.classList.add('active');
    });
});

// ALUMNI CAROUSEL (Moved to dynamic alumni-feed.js module)

// PHOTO CAROUSEL
let photoCurrentSlide = 0;
const photoSlides = document.querySelectorAll('.photo-slide');
let photoTimer = null;

function goToPhotoSlide(idx) {
    photoSlides.forEach(s => s.classList.remove('active'));
    photoCurrentSlide = (idx + photoSlides.length) % photoSlides.length;
    if (photoSlides[photoCurrentSlide]) {
        photoSlides[photoCurrentSlide].classList.add('active');
    }
}

function startPhotoTimer() {
    photoTimer = setInterval(() => goToPhotoSlide(photoCurrentSlide + 1), 3500);
}

function resetPhotoTimer() {
    clearInterval(photoTimer);
    startPhotoTimer();
}

if (photoSlides.length > 0) {
    startPhotoTimer();
}

const photoPrev = document.getElementById('photoPrev');
const photoNext = document.getElementById('photoNext');

if (photoPrev && photoNext) {
    photoPrev.addEventListener('click', () => {
        goToPhotoSlide(photoCurrentSlide - 1);
        resetPhotoTimer();
    });
    
    photoNext.addEventListener('click', () => {
        goToPhotoSlide(photoCurrentSlide + 1);
        resetPhotoTimer();
    });
}

// SCROLL REVEAL
const revealElements = document.querySelectorAll(
    '.card-glass: .prog-card, .vm-card, .outcome-card, .area-chip, .gallery-block, .about-text, .hod-card'
);

revealElements.forEach(el => {
    el.classList.add('reveal');
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger delay based on position among siblings
            const siblings = entry.target.parentElement
                ? Array.from(entry.target.parentElement.children).filter(c => c.classList.contains('reveal'))
                : [];
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// STAT COUNTER ANIMATION
function animateCounter(el, target, suffix) {
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = start + suffix;
        if (start >= target) clearInterval(timer);
    }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNums = entry.target.querySelectorAll('.stat-num');
            const targets = [30, 120, 1200, 50];
            const suffixes = ['+', '+', '+', '+'];
            statNums.forEach((el, i) => {
                animateCounter(el, targets[i], suffixes[i]);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// BACK TO TOP
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
    if (window.scrollY > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// SMOOTH SCROLL FOR ALL # LINKS
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            return;
        }
        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = navbar ? navbar.offsetHeight + 8 : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        } catch (err) {
            // Invalid selector, ignore
        }
    });
});

// NAVBAR SECTION-LABEL HIGHLIGHT
// Set "Home" as active on load
document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.querySelector('.nav-link[href="index.html"]');
    if (homeLink) homeLink.classList.add('active');
});

// NEWS MARQUEE: subtle auto-scroll
const newsScroll = document.querySelector('.news-scroll');
if (newsScroll) {
    let isPaused = false;
    newsScroll.addEventListener('mouseenter', () => isPaused = true);
    newsScroll.addEventListener('mouseleave', () => isPaused = false);
    // Gentle auto-scroll every 3s
    setInterval(() => {
        if (!isPaused && newsScroll.scrollTop < newsScroll.scrollHeight - newsScroll.clientHeight) {
            newsScroll.scrollBy({ top: 54, behavior: 'smooth' });
        } else if (!isPaused) {
            newsScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 3000);
}