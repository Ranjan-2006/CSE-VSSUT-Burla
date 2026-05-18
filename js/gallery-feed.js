import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const photoCarousel = document.getElementById('photoCarousel');
    if (!photoCarousel) return;

    // Hardcoded fallback data in case database is empty or fails
    const mockData = [
        {
            title: 'Computer Science Lab',
            image_url: 'assets/images/gallery1.png'
        },
        {
            title: 'Campus Environment',
            image_url: 'assets/images/gallery2.png'
        },
        {
            title: 'Student Hackathon',
            image_url: 'assets/images/gallery3.png'
        }
    ];

    try {
        const { data: galleryItems, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('showcase', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Use database items if available, otherwise use mock data
        const itemsToRender = (galleryItems && galleryItems.length > 0) ? galleryItems : mockData;

        let slidesHTML = '';

        itemsToRender.forEach((item, index) => {
            const isActive = index === 0 ? 'active' : '';
            
            // Note: Since we are using free aspect ratio, background-size: cover combined with 
            // background-position: center ensures the image is dynamically centered and fills the carousel.
            slidesHTML += `
                <div class="photo-slide ${isActive}" style="background-image: url('${item.image_url}');">
                    <div class="photo-caption">${item.title}</div>
                </div>
            `;
        });

        // Add the navigation buttons back
        slidesHTML += `
            <button class="photo-nav prev" id="photoPrev"><i class="fas fa-chevron-left"></i></button>
            <button class="photo-nav next" id="photoNext"><i class="fas fa-chevron-right"></i></button>
        `;

        photoCarousel.innerHTML = slidesHTML;

        // ENCAPSULATED DYNAMIC CAROUSEL LOGIC
        let currentSlide = 0;
        const slides = photoCarousel.querySelectorAll('.photo-slide');
        const prevBtn = document.getElementById('photoPrev');
        const nextBtn = document.getElementById('photoNext');
        let timer = null;

        function goToSlide(idx) {
            slides.forEach(s => s.classList.remove('active'));
            currentSlide = (idx + slides.length) % slides.length;
            if (slides[currentSlide]) {
                slides[currentSlide].classList.add('active');
            }
        }

        function startTimer() {
            timer = setInterval(() => goToSlide(currentSlide + 1), 3500);
        }

        function resetTimer() {
            clearInterval(timer);
            startTimer();
        }

        if (slides.length > 0) {
            startTimer();
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
                resetTimer();
            });
            
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
                resetTimer();
            });
        }

    } catch (err) {
        console.error('Error fetching gallery feed:', err);
    }
});
