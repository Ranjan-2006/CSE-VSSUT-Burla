import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CAROUSEL ON HOMEPAGE
    const carouselContainer = document.getElementById('alumniCarousel');
    const dotsContainer = document.getElementById('alumniDots');

    // Fallback Mock Data in case the database is empty or fails
    const mockData = [
        {
            id: 1,
            name: "Jane Doe",
            designation: "Senior Engineer at Google",
            batch_year: "2018",
            quote: "VSSUT gave me the foundation to build my career in technology.",
            photo_url: null,
            showcase: true
        },
        {
            id: 2,
            name: "John Smith",
            designation: "Data Scientist at Microsoft",
            batch_year: "2019",
            quote: "The faculty's guidance shaped my problem-solving skills.",
            photo_url: null,
            showcase: true
        },
        {
            id: 3,
            name: "Alice Johnson",
            designation: "Startup Founder & CEO",
            batch_year: "2020",
            quote: "The research environment here is second to none.",
            photo_url: null,
            showcase: true
        },
        {
            id: 4,
            name: "Rahul Sharma",
            designation: "Principal Architect at Amazon",
            batch_year: "2015",
            quote: "Hands-on projects in CSE labs set the trajectory for my engineering career.",
            photo_url: null,
            showcase: false
        },
        {
            id: 5,
            name: "Priyanka Mishra",
            designation: "AI Research Scientist at Meta",
            batch_year: "2017",
            quote: "The mentorship at VSSUT instilled confidence to pursue advanced research.",
            photo_url: null,
            showcase: false
        },
        {
            id: 6,
            name: "Siddharth Verma",
            designation: "Director of Engineering at Uber",
            batch_year: "2014",
            quote: "VSSUT teaches resilience and practical problem solving under constraints.",
            photo_url: null,
            showcase: false
        }
    ];

    let cachedAllAlumni = null;

    if (carouselContainer && dotsContainer) {
        carouselContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--gray-500); width: 100%;"><i class="fas fa-spinner fa-spin"></i> Loading distinguished alumni...</div>';
        dotsContainer.innerHTML = '';

        try {
            const { data: alumniItems, error } = await supabase
                .from('alumni')
                .select('*')
                .eq('showcase', true)
                .order('id', { ascending: false });

            if (error) throw error;

            const itemsToRender = (alumniItems && alumniItems.length > 0) ? alumniItems : mockData.filter(d => d.showcase);

            let slidesHTML = '';
            let dotsHTML = '';

            itemsToRender.forEach((item, index) => {
                const isActive = index === 0 ? 'active' : '';
                
                const photoHTML = item.photo_url 
                    ? `<div class="alumni-avatar" style="width: 150px; height: 150px; margin: 0 auto 15px; border-radius: 50%; overflow: hidden;"><img src="${item.photo_url}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;"></div>`
                    : `<div class="alumni-avatar" style="width: 150px; height: 150px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 80px; color: var(--gray-400);"><i class="fas fa-user-circle"></i></div>`;
                
                const quoteHTML = item.quote ? `<p class="alumni-quote">"${item.quote}"</p>` : '';

                slidesHTML += `
                    <div class="alumni-slide ${isActive}">
                        ${photoHTML}
                        <h4 class="alumni-name">${item.name}</h4>
                        <p class="alumni-desig">${item.designation} &middot; Batch ${item.batch_year}</p>
                        ${quoteHTML}
                    </div>
                `;

                dotsHTML += `<span class="dot ${isActive}" data-idx="${index}"></span>`;
            });

            carouselContainer.innerHTML = slidesHTML;
            dotsContainer.innerHTML = dotsHTML;

            let currentSlide = 0;
            const slides = carouselContainer.querySelectorAll('.alumni-slide');
            const dots = dotsContainer.querySelectorAll('.dot');
            let carouselTimer = null;

            function goToSlide(idx) {
                slides.forEach(s => s.classList.remove('active'));
                dots.forEach(d => d.classList.remove('active'));
                currentSlide = (idx + slides.length) % slides.length;
                if (slides[currentSlide]) slides[currentSlide].classList.add('active');
                if (dots[currentSlide]) dots[currentSlide].classList.add('active');
            }

            dotsContainer.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('dot')) {
                    const idx = parseInt(e.target.getAttribute('data-idx'));
                    goToSlide(idx);
                    resetCarouselTimer();
                }
            });

            function startCarouselTimer() {
                carouselTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
            }

            function resetCarouselTimer() {
                clearInterval(carouselTimer);
                startCarouselTimer();
            }

            const prevBtn = document.getElementById('alumniPrev');
            const nextBtn = document.getElementById('alumniNext');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    goToSlide(currentSlide - 1);
                    resetCarouselTimer();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    goToSlide(currentSlide + 1);
                    resetCarouselTimer();
                });
            }

            carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselTimer));
            carouselContainer.addEventListener('mouseleave', startCarouselTimer);

            if (slides.length > 1) {
                startCarouselTimer();
            }

        } catch (err) {
            console.error("Error fetching alumni data:", err);
            carouselContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--red); width: 100%;">Failed to load alumni showcase.</div>';
        }
    }

    // 2. MODAL DIRECTORY POPUP
    window.loadAllAlumniModal = async function() {
        const gridContainer = document.getElementById('alumniModalGrid');
        if (!gridContainer) return;

        if (cachedAllAlumni && cachedAllAlumni.length > 0) {
            renderAlumniGrid(cachedAllAlumni);
            return;
        }

        gridContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--gray-500); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin"></i> Loading alumni directory...</div>';

        try {
            const { data: allAlumni, error } = await supabase
                .from('alumni')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            cachedAllAlumni = (allAlumni && allAlumni.length > 0) ? allAlumni : mockData;
            renderAlumniGrid(cachedAllAlumni);
        } catch (err) {
            console.warn("Using fallback mock data for alumni modal:", err);
            cachedAllAlumni = mockData;
            renderAlumniGrid(cachedAllAlumni);
        }
    };

    function renderAlumniGrid(items) {
        const gridContainer = document.getElementById('alumniModalGrid');
        if (!gridContainer) return;

        if (!items || items.length === 0) {
            gridContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--gray-500); grid-column: 1 / -1;"><i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--gray-400);"></i>No alumni found matching your search.</div>';
            return;
        }

        let html = '';
        items.forEach(alumni => {
            const avatarHTML = alumni.photo_url
                ? `<img src="${alumni.photo_url}" alt="${alumni.name}" class="alumni-modal-avatar" onerror="this.outerHTML='<div class=\\'alumni-modal-avatar-fallback\\'><i class=\\'fas fa-user-graduate\\'></i></div>'">`
                : `<div class="alumni-modal-avatar-fallback"><i class="fas fa-user-graduate"></i></div>`;

            const batchText = alumni.batch_year ? `Batch ${alumni.batch_year}` : 'Alumni';
            const quoteText = alumni.quote ? `<p class="alumni-modal-quote">"${alumni.quote}"</p>` : '';

            html += `
                <div class="alumni-modal-card">
                    ${avatarHTML}
                    <h4 class="alumni-modal-name">${alumni.name}</h4>
                    <p class="alumni-modal-desig">${alumni.designation || 'Distinguished Alumnus'}</p>
                    <span class="alumni-modal-batch"><i class="fas fa-graduation-cap"></i> ${batchText}</span>
                    ${quoteText}
                </div>
            `;
        });

        gridContainer.innerHTML = html;
    }

    // Live search listener on the alumni modal search input
    const searchInput = document.getElementById('alumniModalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!cachedAllAlumni) return;

            if (!query) {
                renderAlumniGrid(cachedAllAlumni);
                return;
            }

            const filtered = cachedAllAlumni.filter(item => {
                const name = (item.name || '').toLowerCase();
                const desig = (item.designation || '').toLowerCase();
                const batch = (item.batch_year || '').toString().toLowerCase();
                const quote = (item.quote || '').toLowerCase();
                return name.includes(query) || desig.includes(query) || batch.includes(query) || quote.includes(query);
            });

            renderAlumniGrid(filtered);
        });
    }
});
