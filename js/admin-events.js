import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Load News into the Modify Tab
    window.loadAdminNews = async () => {
        const listContainer = document.getElementById('admin-news-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading news & events...</div>';

        try {
            const { data: newsEvents, error } = await supabase
                .from('news_events')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            listContainer.innerHTML = ''; // clear spinner
            
            if (!newsEvents || newsEvents.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No data found.</div>';
                return;
            }

            newsEvents.forEach(event => {
                let formattedDate = 'Unknown Date';
                if (event.date) {
                    const dateObj = new Date(event.date);
                    formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                }

                const pdfIndicator = event.pdf_url ? '<span><i class="far fa-file-pdf"></i> Attached</span>' : '';
                
                // Store event data as a data-attribute JSON string for easy access during edit
                const eventDataStr = encodeURIComponent(JSON.stringify(event));

                const itemHTML = `
                    <div class="data-item">
                        <div class="data-item-content">
                            <div class="data-item-title">${event.title}</div>
                            <div class="data-item-meta">
                                <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                                ${pdfIndicator}
                            </div>
                        </div>
                        <div class="data-item-actions">
                            <button class="action-btn edit-news-btn" title="Edit" data-event="${eventDataStr}"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete delete-news-btn" title="Delete" data-id="${event.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        } catch (err) {
            console.error("Error fetching admin news:", err);
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--red);">Failed to load data.</div>';
        }
    };

    // Use event delegation for all interactions since modal HTML is dynamically injected
    document.body.addEventListener('click', async (e) => {
        
        // 1. Trigger Load when clicking "Modify Existing" tab
        if (e.target && e.target.id === 'tabBtn-news-modify') {
            window.loadAdminNews();
        }

        // 2. Edit Button Click
        const editBtn = e.target.closest('.edit-news-btn');
        if (editBtn) {
            try {
                const eventData = JSON.parse(decodeURIComponent(editBtn.getAttribute('data-event')));
                
                // Switch to Add Tab
                const addTabBtn = document.getElementById('tabBtn-news-add');
                if (addTabBtn) addTabBtn.click();
                
                // Populate Form
                document.getElementById('event-id').value = eventData.id;
                document.getElementById('event-date').value = eventData.date || '';
                document.getElementById('event-title').value = eventData.title || '';
                document.getElementById('event-desc').value = eventData.description || '';
                
                // Update Button Text
                const submitBtn = document.getElementById('save-event-btn');
                if (submitBtn) submitBtn.innerHTML = 'Update Entry';
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast('Loaded into form for editing', 'success');
                }
            } catch (err) {
                console.error("Error parsing event data for edit:", err);
            }
        }

        // 3. Delete Button Click
        const deleteBtn = e.target.closest('.delete-news-btn');
        if (deleteBtn) {
            const eventId = deleteBtn.getAttribute('data-id');
            if (!eventId) return;

            // Use the existing AdminUtils confirm if available
            if (window.AdminUtils && window.AdminUtils.confirmDelete) {
                window.AdminUtils.confirmDelete(async () => {
                    await executeDelete(eventId, deleteBtn);
                });
            } else if (confirm('Are you sure you want to delete this item?')) {
                await executeDelete(eventId, deleteBtn);
            }
        }
    });

    async function executeDelete(eventId, btnElement) {
        try {
            const { error } = await supabase
                .from('news_events')
                .delete()
                .eq('id', eventId);
                
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

    // 4. Form Submission (Insert or Update)
    document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'event-upload-form') {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('#save-event-btn');
            const idInput = form.querySelector('#event-id');
            const dateInput = form.querySelector('#event-date');
            const titleInput = form.querySelector('#event-title');
            const descInput = form.querySelector('#event-desc');
            const pdfInput = form.querySelector('#event-pdf');

            const isUpdate = idInput.value !== '';
            
            // UI Feedback & Disable Button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                let finalPdfUrl = null; // Will remain null if not updated (meaning we don't overwrite existing URL unless specified)
                // Note: For a robust system, you'd fetch the old URL to preserve it if no new file is uploaded.
                // For simplicity here, if it's an update and no file is chosen, we omit pdf_url from the payload
                // so Supabase leaves the existing value untouched.

                // Storage Pipeline Step
                if (pdfInput && pdfInput.files && pdfInput.files.length > 0) {
                    const file = pdfInput.files[0];
                    const timestamp = new Date().getTime();
                    // Sanitize file name
                    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                    const uniqueFileName = `${timestamp}_${sanitizedName}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('news_pdfs')
                        .upload(uniqueFileName, file);

                    if (uploadError) throw uploadError;

                    // Generate public URL
                    const { data: publicUrlData } = supabase.storage
                        .from('news_pdfs')
                        .getPublicUrl(uniqueFileName);
                    
                    finalPdfUrl = publicUrlData.publicUrl;
                }

                // Database Write Transaction Step
                const payload = {
                    date: dateInput.value,
                    title: titleInput.value.trim(),
                    description: descInput.value.trim() || null
                };
                
                if (finalPdfUrl !== null) {
                    payload.pdf_url = finalPdfUrl;
                }

                if (isUpdate) {
                    const { error } = await supabase
                        .from('news_events')
                        .update(payload)
                        .eq('id', idInput.value);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('news_events')
                        .insert([payload]);
                    if (error) throw error;
                }

                // Success
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast(isUpdate ? 'Event updated successfully!' : 'Event published successfully!', 'success');
                } else {
                    alert(isUpdate ? 'Event updated successfully!' : 'Event published successfully!');
                }
                
                // Reset everything
                form.reset();
                idInput.value = '';
                submitBtn.innerHTML = 'Publish'; // Reset to default text
                
                // Clear the preview text if it exists
                const filePreviewText = pdfInput.nextElementSibling.nextElementSibling;
                if(filePreviewText) filePreviewText.textContent = '';

                // Reload data if we were viewing it
                if (window.loadAdminNews) window.loadAdminNews();

            } catch (err) {
                console.error("Upload Error:", err);
                alert(`Error saving event: ${err.message}`);
                submitBtn.innerHTML = originalBtnText; // only restore original on error
            } finally {
                submitBtn.disabled = false;
            }
        }
    });
});
