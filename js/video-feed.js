import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const videoIframe = document.getElementById('mainVideoIframe');
    const videoMessage = document.getElementById('mainVideoMessage');
    
    if (!videoIframe || !videoMessage) return;

    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .eq('showcase', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let currentVidIndex = 0;
        
        const btnPrev = document.getElementById('videoPrev');
        const btnNext = document.getElementById('videoNext');

        function renderVideo(index) {
            if (videos && videos.length > 0) {
                const video = videos[index];
                videoIframe.src = video.embed_url;
                document.getElementById('mainVideoContainer').style.display = 'block';
                videoMessage.innerHTML = video.message ? video.message : 'No caption provided.';
                
                // Hide buttons if there's only 1 video
                if (videos.length <= 1) {
                    if(btnPrev) btnPrev.style.display = 'none';
                    if(btnNext) btnNext.style.display = 'none';
                } else {
                    if(btnPrev) btnPrev.style.display = 'flex';
                    if(btnNext) btnNext.style.display = 'flex';
                }
            } else {
                document.getElementById('mainVideoContainer').style.display = 'none';
                videoMessage.innerHTML = 'More videos will be updated soon. Stay tuned!';
                if(btnPrev) btnPrev.style.display = 'none';
                if(btnNext) btnNext.style.display = 'none';
            }
        }

        // Initial render
        renderVideo(currentVidIndex);

        // Slideshow Timer Logic
        let vidTimer = null;
        
        function startVidTimer() {
            if (videos && videos.length > 1) {
                vidTimer = setInterval(() => {
                    currentVidIndex = (currentVidIndex + 1) % videos.length;
                    renderVideo(currentVidIndex);
                }, 5000); // Change video every 5 seconds
            }
        }

        function resetVidTimer() {
            if (vidTimer) clearInterval(vidTimer);
            startVidTimer();
        }

        startVidTimer();

        // Navigation Listeners
        if (btnPrev && btnNext) {
            btnPrev.addEventListener('click', () => {
                if (videos && videos.length > 0) {
                    currentVidIndex = (currentVidIndex - 1 + videos.length) % videos.length;
                    renderVideo(currentVidIndex);
                    resetVidTimer();
                }
            });

            btnNext.addEventListener('click', () => {
                if (videos && videos.length > 0) {
                    currentVidIndex = (currentVidIndex + 1) % videos.length;
                    renderVideo(currentVidIndex);
                    resetVidTimer();
                }
            });
        }

    } catch (err) {
        console.error('Error fetching video feed:', err);
    }
});
