import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    // Load Gallery
    window.loadAdminGallery = async () => {
        const listContainer = document.getElementById('admin-gal-list');
        if (!listContainer) return;
        try {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500); grid-column: 1/-1;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

            const { data: gallery, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!gallery || gallery.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500); grid-column: 1/-1;">No photos found. Add some from the Add Photo tab!</div>';
                return;
            }

            let html = '';
            gallery.forEach(item => {
                html += `
                        <div class="gallery-item" data-id="${item.id}">
                            <img src="${item.image_url}" alt="${item.title}" loading="lazy">
                            <div class="gallery-item-actions">
                                <label class="toggle-switch" title="Showcase" style="transform: scale(0.7); transform-origin: left center;">
                                    <input type="checkbox" class="gal-showcase-toggle" data-id="${item.id}" ${item.showcase ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                                <button class="action-btn delete" onclick="deleteGalleryItem('${item.id}', '${item.image_url}')" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: #ef4444; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fas fa-trash"></i></button>
                            </div>
                            <div style="position: absolute; top: 0; left: 0; right: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); padding: 8px; color: white; font-size: 0.8rem; font-weight: 600;">
                                ${item.title}
                            </div>
                        </div>
                    `;
            });

            listContainer.innerHTML = html;
        } catch (err) {
            console.error("Error loading gallery:", err);
            listContainer.innerHTML = '<div style="color: red; padding: 20px; grid-column: 1/-1;">Error loading data.</div>';
        }
    }

    // Expose delete function globally so inline onclick can use it
    window.deleteGalleryItem = async function (id, imageUrl) {
        AdminUtils.confirmDelete(async () => {
            try {
                // Extract filename from URL
                const urlObj = new URL(imageUrl);
                const pathParts = urlObj.pathname.split('/');
                const fileName = pathParts[pathParts.length - 1];

                // 1. Delete from storage
                if (fileName) {
                    await supabase.storage.from('gallery_photos').remove([fileName]);
                }

                // 2. Delete from database
                const { error } = await supabase
                    .from('gallery')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                AdminUtils.showToast("Photo deleted successfully!");
                window.loadAdminGallery();
            } catch (err) {
                console.error("Error deleting:", err);
                alert("Failed to delete photo: " + err.message);
            }
        });
    };

    // Event delegation for interactions
    document.body.addEventListener('click', async (e) => {
        // Trigger Load when clicking "Manage Gallery" tab
        if (e.target && e.target.id === 'tabBtn-gal-modify') {
            window.loadAdminGallery();
        }
    });

    // Handle showcase toggle change
    document.body.addEventListener('change', async (e) => {
        if (e.target && e.target.classList.contains('gal-showcase-toggle')) {
            const itemId = e.target.getAttribute('data-id');
            const isChecked = e.target.checked;
            try {
                const { error } = await supabase
                    .from('gallery')
                    .update({ showcase: isChecked })
                    .eq('id', itemId);
                
                if (error) throw error;
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast(isChecked ? 'Photo added to carousel' : 'Photo removed from carousel', 'success');
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
        if (e.target && e.target.id === 'gal-form') {
            e.preventDefault();

            const form = e.target;
            const submitBtn = document.getElementById('save-gal-btn');

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            try {
                const title = document.getElementById('gal-title').value;
                const desc = document.getElementById('gal-desc').value;
                const photoInput = document.getElementById('gal-photo');

                let publicUrl = null;

                // Storage Pipeline Step
                if (photoInput && photoInput.croppedBlob) {
                    const file = photoInput.croppedBlob;
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `gallery_${timestamp}.jpg`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('gallery_photos')
                        .upload(uniqueFileName, file, { contentType: 'image/jpeg' });

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const { data: publicUrlData } = supabase.storage
                        .from('gallery_photos')
                        .getPublicUrl(uniqueFileName);

                    publicUrl = publicUrlData.publicUrl;
                } else {
                    throw new Error("Please select and crop a photo first.");
                }

                // Database Insert Step
                const showcaseVal = document.getElementById('gal-showcase') ? document.getElementById('gal-showcase').checked : true;
                const { error: dbError } = await supabase
                    .from('gallery')
                    .insert([{
                        title: title,
                        description: desc,
                        image_url: publicUrl,
                        showcase: showcaseVal
                    }]);

                if (dbError) throw dbError;

                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast("Photo saved to gallery!", "success");
                } else {
                    alert("Photo saved to gallery!");
                }

                // Reset everything
                form.reset();
                if (photoInput) {
                    photoInput.croppedBlob = null;
                }
                document.getElementById('galPreview').style.display = 'none';
                document.getElementById('galPreview').src = '';

                // Switch back to Modify tab
                document.getElementById('tabBtn-gal-modify').click();
                window.loadAdminGallery();

            } catch (err) {
                console.error("Error saving gallery item:", err);
                alert("Error saving: " + err.message);
            } finally {
                submitBtn.innerHTML = 'Save Photo';
                submitBtn.disabled = false;
            }
        }
    });
});
