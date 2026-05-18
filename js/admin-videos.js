import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Load Videos
    window.loadAdminVideos = async () => {
        const listContainer = document.getElementById('admin-vid-list');
        if (!listContainer) return;
        
        try {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500); grid-column: 1/-1;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

            const { data: videos, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!videos || videos.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500); grid-column: 1/-1;">No videos found. Add one from the Add Video tab!</div>';
                return;
            }

            let html = '';
            videos.forEach(item => {
                html += `
                    <div class="gallery-item" data-id="${item.id}" style="aspect-ratio: 16/9; position: relative;">
                        <iframe style="width: 100%; height: 100%; pointer-events: none;" src="${item.embed_url}" frameborder="0"></iframe>
                        <div class="gallery-item-actions">
                            <label class="toggle-switch" title="Showcase" style="transform: scale(0.7); transform-origin: left center;">
                                <input type="checkbox" class="vid-showcase-toggle" data-id="${item.id}" ${item.showcase ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <button class="action-btn delete" onclick="deleteVideoItem(${item.id})" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: #ef4444; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fas fa-trash"></i></button>
                        </div>
                        <div style="position: absolute; top: 0; left: 0; right: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); padding: 8px; color: white; font-size: 0.8rem; font-weight: 600;">
                            ${item.message || 'No message'}
                        </div>
                    </div>
                `;
            });

            listContainer.innerHTML = html;
        } catch (err) {
            console.error("Error loading videos:", err);
            listContainer.innerHTML = '<div style="color: red; padding: 20px; grid-column: 1/-1;">Error loading data.</div>';
        }
    };

    // Expose delete function globally so inline onclick can use it
    window.deleteVideoItem = async function (id) {
        AdminUtils.confirmDelete(async () => {
            try {
                const { error } = await supabase
                    .from('videos')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                AdminUtils.showToast("Video deleted successfully!");
                window.loadAdminVideos();
            } catch (err) {
                console.error("Error deleting:", err);
                alert("Failed to delete video: " + err.message);
            }
        });
    };

    // Event delegation for interactions
    document.body.addEventListener('click', async (e) => {
        // Trigger Load when clicking "Manage Videos" tab
        if (e.target && e.target.id === 'tabBtn-vid-modify') {
            window.loadAdminVideos();
        }
    });

    // Handle showcase toggle change
    document.body.addEventListener('change', async (e) => {
        if (e.target && e.target.classList.contains('vid-showcase-toggle')) {
            const itemId = e.target.getAttribute('data-id');
            const isChecked = e.target.checked;
            try {
                const { error } = await supabase
                    .from('videos')
                    .update({ showcase: isChecked })
                    .eq('id', itemId);
                
                if (error) throw error;
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast(isChecked ? 'Video added to main page' : 'Video removed from main page', 'success');
                }
            } catch(err) {
                console.error("Error updating showcase status:", err);
                e.target.checked = !isChecked; // Revert
                alert('Error updating status: ' + err.message);
            }
        }
    });

    // Handle Form Submit (Add)
    document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'vid-form') {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = document.getElementById('save-vid-btn');
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            try {
                let embedUrl = document.getElementById('vid-embed').value.trim();
                const message = document.getElementById('vid-message').value.trim();
                const showcaseVal = document.getElementById('vid-showcase') ? document.getElementById('vid-showcase').checked : true;

                // If user accidentally pasted the whole <iframe> tag, extract the src URL
                if (embedUrl.toLowerCase().includes('<iframe') && embedUrl.includes('src="')) {
                    const srcMatch = embedUrl.match(/src="([^"]+)"/);
                    if (srcMatch && srcMatch[1]) {
                        embedUrl = srcMatch[1];
                    }
                }

                // Make sure it's a valid youtube embed, just a basic check
                if (!embedUrl.includes('youtube.com/embed/')) {
                    alert('Please provide a valid YouTube embed URL (or paste the entire embed code).');
                    submitBtn.innerHTML = 'Save Video';
                    submitBtn.disabled = false;
                    return;
                }

                // Database Insert Step
                const { error: dbError } = await supabase
                    .from('videos')
                    .insert([{
                        embed_url: embedUrl,
                        message: message,
                        showcase: showcaseVal
                    }]);

                if (dbError) throw dbError;

                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast("Video saved!", "success");
                } else {
                    alert("Video saved!");
                }
                
                // Reset everything
                form.reset();
                
                // Switch back to Modify tab
                document.getElementById('tabBtn-vid-modify').click();
                window.loadAdminVideos();

            } catch (err) {
                console.error("Error saving video item:", err);
                alert("Error saving: " + err.message);
            } finally {
                submitBtn.innerHTML = 'Save Video';
                submitBtn.disabled = false;
            }
        }
    });
});
