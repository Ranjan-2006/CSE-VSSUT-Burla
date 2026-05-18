import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const carouselContainer = document.getElementById('alumniCarousel');
    const dotsContainer = document.getElementById('alumniDots');

    if (!carouselContainer || !dotsContainer) return;

    // Show loading state
    carouselContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--gray-500); width: 100%;"><i class="fas fa-spinner fa-spin"></i> Loading distinguished alumni...</div>';
    dotsContainer.innerHTML = '';

    // Fallback Mock Data in case the database is empty or fails
    const mockData = [
        {
            name: "Jane Doe",
            designation: "Senior Engineer at Google",
            batch_year: "2018",
            quote: "VSSUT gave me the foundation to build my career in technology.",
            photo_url: null
        },
        {
            name: "John Smith",
            designation: "Data Scientist at Microsoft",
            batch_year: "2019",
            quote: "The faculty's guidance shaped my problem-solving skills.",
            photo_url: null
        },
        {
            name: "Alice Johnson",
            designation: "Startup Founder",
            batch_year: "2020",
            quote: "The research environment here is second to none.",
            photo_url: null
        }
    ];

    try {
        const { data: alumniItems, error } = await supabase
            .from('alumni')
            .select('*')
            .eq('showcase', true)
            .order('id', { ascending: false });

        if (error) throw error;

        // Use database items if available, otherwise use mock data
        const itemsToRender = (alumniItems && alumniItems.length > 0) ? alumniItems : mockData;

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

        // ==========================================
        // ENCAPSULATED DYNAMIC CAROUSEL LOGIC
        // ==========================================
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

        // Event delegation for dots since they are dynamically created
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

        // Prev/Next Button Logic
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

        // Pause on hover
        carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselTimer));
        carouselContainer.addEventListener('mouseleave', startCarouselTimer);

        if (slides.length > 1) {
            startCarouselTimer();
        }

    } catch (err) {
        console.error("Error fetching alumni data:", err);
        carouselContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--red); width: 100%;">Failed to load alumni showcase.</div>';
    }
});
