import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Load Alumni into the Modify Tab
    window.loadAdminAlumni = async () => {
        const listContainer = document.getElementById('admin-al-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading alumni data...</div>';

        try {
            const { data: alumniItems, error } = await supabase
                .from('alumni')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            listContainer.innerHTML = ''; // clear spinner
            
            if (!alumniItems || alumniItems.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No alumni found.</div>';
                return;
            }

            alumniItems.forEach(item => {
                // Store event data as a data-attribute JSON string for easy access during edit
                const itemDataStr = encodeURIComponent(JSON.stringify(item));

                const photoHTML = item.photo_url 
                    ? `<img src="${item.photo_url}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`
                    : `<div style="width: 50px; height: 50px; background: var(--gray-200); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--gray-500);"><i class="fas fa-user"></i></div>`;

                const itemHTML = `
                    <div class="data-item">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            ${photoHTML}
                            <div>
                                <div class="data-item-title">${item.name}</div>
                                <div class="data-item-meta">
                                    <span>${item.designation}</span>
                                    <span>Batch ${item.batch_year}</span>
                                </div>
                            </div>
                        </div>
                        <div class="data-item-actions">
                            <label class="toggle-switch" title="Showcase">
                                <input type="checkbox" class="al-showcase-toggle" data-id="${item.id}" ${item.showcase ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <button class="action-btn edit-al-btn" title="Edit" data-item="${itemDataStr}"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete delete-al-btn" title="Delete" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        } catch (err) {
            console.error("Error fetching admin alumni:", err);
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--red);">Failed to load alumni data.</div>';
        }
    };

    // Event delegation for interactions
    document.body.addEventListener('click', async (e) => {
        
        // 1. Trigger Load when clicking "Modify Existing" tab
        if (e.target && e.target.id === 'tabBtn-al-modify') {
            window.loadAdminAlumni();
        }

        // 2. Edit Button Click
        const editBtn = e.target.closest('.edit-al-btn');
        if (editBtn) {
            try {
                const itemData = JSON.parse(decodeURIComponent(editBtn.getAttribute('data-item')));
                
                // Switch to Add Tab
                const addTabBtn = document.getElementById('tabBtn-al-add');
                if (addTabBtn) addTabBtn.click();
                
                // Populate Form
                document.getElementById('al-id').value = itemData.id;
                document.getElementById('al-name').value = itemData.name || '';
                document.getElementById('al-desig').value = itemData.designation || '';
                document.getElementById('al-batch').value = itemData.batch_year || '';
                document.getElementById('al-gender').value = itemData.gender || '';
                document.getElementById('al-quote').value = itemData.quote || '';
                document.getElementById('al-showcase').checked = itemData.showcase !== false; // default true if undefined
                
                // Photo Preview
                const imgPreview = document.getElementById('alumniPreview');
                if (imgPreview && itemData.photo_url) {
                    imgPreview.src = itemData.photo_url;
                    imgPreview.style.display = 'block';
                } else if (imgPreview) {
                    imgPreview.src = '';
                    imgPreview.style.display = 'none';
                }
                
                // Update Button Text
                const submitBtn = document.getElementById('save-al-btn');
                if (submitBtn) submitBtn.innerHTML = 'Update Entry';
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast('Loaded into form for editing', 'success');
                }
            } catch (err) {
                console.error("Error parsing item data for edit:", err);
            }
        }

        // 3. Delete Button Click
        const deleteBtn = e.target.closest('.delete-al-btn');
        if (deleteBtn) {
            const itemId = deleteBtn.getAttribute('data-id');
            if (!itemId) return;

            if (window.AdminUtils && window.AdminUtils.confirmDelete) {
                window.AdminUtils.confirmDelete(async () => {
                    await executeAlDelete(itemId, deleteBtn);
                });
            } else if (confirm('Are you sure you want to delete this alumni?')) {
                await executeAlDelete(itemId, deleteBtn);
            }
        }
    });
    
    // Showcase Toggle Change
    document.body.addEventListener('change', async (e) => {
        if (e.target && e.target.classList.contains('al-showcase-toggle')) {
            const itemId = e.target.getAttribute('data-id');
            const isChecked = e.target.checked;
            try {
                const { error } = await supabase
                    .from('alumni')
                    .update({ showcase: isChecked })
                    .eq('id', itemId);
                if (error) throw error;
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast(isChecked ? 'Added to showcase' : 'Removed from showcase', 'success');
                }
            } catch(err) {
                console.error("Error updating showcase status:", err);
                e.target.checked = !isChecked; // Revert
                alert('Error updating status: ' + err.message);
            }
        }
    });

    async function executeAlDelete(itemId, btnElement) {
        try {
            const { error } = await supabase
                .from('alumni')
                .delete()
                .eq('id', itemId);
                
            if (error) throw error;
            
            // Remove item from DOM
            btnElement.closest('.data-item').remove();
            
            if (window.AdminUtils && window.AdminUtils.showToast) {
                window.AdminUtils.showToast('Item deleted successfully', 'success');
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert(`Error deleting item: ${err.message}`);
        }
    }

    // Form Submission (Insert or Update)
    document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'al-form') {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('#save-al-btn');
            const idInput = form.querySelector('#al-id');
            
            const isUpdate = idInput.value !== '';
            
            // UI Feedback & Disable Button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                let finalPhotoUrl = null; 
                const photoInput = form.querySelector('#al-photo');

                // Storage Pipeline Step
                if (photoInput && photoInput.croppedBlob) {
                    const file = photoInput.croppedBlob;
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `cropped_${timestamp}.jpg`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('alumni_photos')
                        .upload(uniqueFileName, file, { contentType: 'image/jpeg' });

                    if (uploadError) throw uploadError;

                    // Generate public URL
                    const { data: publicUrlData } = supabase.storage
                        .from('alumni_photos')
                        .getPublicUrl(uniqueFileName);
                    
                    finalPhotoUrl = publicUrlData.publicUrl;
                } else if (isUpdate) {
                     // If updating and no new file, try to preserve old one.
                     // A cleaner way is just to not include photo_url in update if null, unless they explicitly removed it, which we don't have a button for right now.
                }

                // Database Write Transaction Step
                const payload = {
                    name: form.querySelector('#al-name').value.trim(),
                    designation: form.querySelector('#al-desig').value.trim(),
                    batch_year: form.querySelector('#al-batch').value.trim(),
                    gender: form.querySelector('#al-gender').value,
                    quote: form.querySelector('#al-quote').value.trim() || null,
                    showcase: form.querySelector('#al-showcase').checked
                };
                
                if (finalPhotoUrl !== null) {
                    payload.photo_url = finalPhotoUrl;
                }

                if (isUpdate) {
                    const { error } = await supabase
                        .from('alumni')
                        .update(payload)
                        .eq('id', idInput.value);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('alumni')
                        .insert([payload]);
                    if (error) throw error;
                }

                // Success
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast(isUpdate ? 'Entry updated successfully!' : 'Entry published successfully!', 'success');
                } else {
                    alert(isUpdate ? 'Entry updated successfully!' : 'Entry published successfully!');
                }
                
                // Reset everything
                form.reset();
                idInput.value = '';
                if(photoInput) {
                    photoInput.croppedBlob = null;
                }
                submitBtn.innerHTML = 'Save Profile'; // Reset to default text
                
                const imgPreview = document.getElementById('alumniPreview');
                if(imgPreview) {
                    imgPreview.src = '';
                    imgPreview.style.display = 'none';
                }

                // Reload data if we were viewing it
                if (window.loadAdminAlumni) window.loadAdminAlumni();

            } catch (err) {
                console.error("Upload Error:", err);
                alert(`Error saving entry: ${err.message}`);
                submitBtn.innerHTML = originalBtnText; // only restore original on error
            } finally {
                submitBtn.disabled = false;
            }
        }
    });
});
