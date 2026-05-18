import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const photosGrid = document.getElementById('photos-grid');
    const videosGrid = document.getElementById('videos-grid');
    
    // Lightbox elements
    const modal = document.getElementById('lightbox-modal');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    let photos = [];
    let currentPhotoIndex = 0;

    // ----- FETCH PHOTOS -----
    if (photosGrid) {
        photosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--blue-500);"></i></div>';
        
        try {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            photos = data || [];

            if (photos.length === 0) {
                photosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gray-500); padding: 20px;">No photos available in the gallery.</div>';
            } else {
                let html = '';
                photos.forEach((photo, index) => {
                    html += `
                        <div class="gallery-img-card" style="position: relative; aspect-ratio: 4/3; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s;" onclick="openLightbox(${index})">
                            <img src="${photo.image_url}" alt="${photo.title || 'Gallery Image'}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 15px; color: white; transform: translateY(100%); transition: transform 0.3s;" class="img-overlay">
                                <h4 style="margin: 0; font-size: 1rem;">${photo.title || ''}</h4>
                            </div>
                        </div>
                    `;
                });
                photosGrid.innerHTML = html;

                // Add hover effect via CSS injected here
                const style = document.createElement('style');
                style.textContent = `
                    .gallery-img-card:hover { transform: translateY(-5px); }
                    .gallery-img-card:hover img { transform: scale(1.05); }
                    .gallery-img-card:hover .img-overlay { transform: translateY(0); }
                `;
                document.head.appendChild(style);
            }
        } catch (err) {
            console.error("Error fetching photos:", err);
            photosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--red-500); padding: 20px;">Error loading photos.</div>';
        }
    }

    // ----- FETCH VIDEOS -----
    if (videosGrid) {
        videosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--blue-500);"></i></div>';
        
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const videos = data || [];

            if (videos.length === 0) {
                videosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gray-500); padding: 20px;">No videos available in the gallery.</div>';
            } else {
                let html = '';
                videos.forEach(video => {
                    html += `
                        <div class="video-card" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: var(--white);">
                            <div style="aspect-ratio: 16/9; width: 100%;">
                                <iframe style="width: 100%; height: 100%;" src="${video.embed_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                            <div style="padding: 15px;">
                                <p style="margin: 0; font-weight: 600; color: var(--blue-900);">${video.message || 'Video'}</p>
                            </div>
                        </div>
                    `;
                });
                videosGrid.innerHTML = html;
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
            videosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--red-500); padding: 20px;">Error loading videos.</div>';
        }
    }

    // ----- LIGHTBOX LOGIC -----
    window.openLightbox = (index) => {
        if (!photos.length || !modal) return;
        currentPhotoIndex = index;
        updateLightboxImage();
        modal.style.display = 'flex';
        // small delay to allow display: flex to apply before opacity transition
        setTimeout(() => modal.style.opacity = '1', 10);
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    };

    const closeLightbox = () => {
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    };

    const updateLightboxImage = () => {
        if (!photos.length) return;
        const photo = photos[currentPhotoIndex];
        lightboxImg.src = photo.image_url;
        lightboxCaption.innerText = photo.title || '';
    };

    const nextPhoto = (e) => {
        if(e) e.stopPropagation();
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        updateLightboxImage();
    };

    const prevPhoto = (e) => {
        if(e) e.stopPropagation();
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
        updateLightboxImage();
    };

    // Event Listeners for Lightbox
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextPhoto);
    if (prevBtn) prevBtn.addEventListener('click', prevPhoto);

    // Close when clicking outside image
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal && modal.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        }
    });

});
