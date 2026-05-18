import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Load Research & Projects into the Modify Tab
    window.loadAdminResearch = async () => {
        const listContainer = document.getElementById('admin-res-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading research & projects...</div>';

        try {
            const { data: researchItems, error } = await supabase
                .from('research_and_project')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            listContainer.innerHTML = ''; // clear spinner
            
            if (!researchItems || researchItems.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No data found.</div>';
                return;
            }

            // Apply filter if selected
            const filterCategory = document.getElementById('res-filter-category')?.value || 'all';
            const filteredItems = filterCategory === 'all' 
                ? researchItems 
                : researchItems.filter(item => item.category === filterCategory);

            if (filteredItems.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No data found for this category.</div>';
                return;
            }

            filteredItems.forEach(item => {
                const isProject = item.category === 'sponsored_project';
                const badgeHTML = isProject 
                    ? `<span><span style="background: var(--blue-100); color: var(--blue-800); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Project</span></span>` 
                    : `<span><span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Publication</span></span>`;
                
                const pdfIndicator = item.pdf_url ? '<span><i class="far fa-file-pdf"></i> Attached</span>' : '';
                
                // Store event data as a data-attribute JSON string for easy access during edit
                const itemDataStr = encodeURIComponent(JSON.stringify(item));

                const itemHTML = `
                    <div class="data-item">
                        <div class="data-item-content">
                            <div class="data-item-title">${item.title}</div>
                            <div class="data-item-meta">
                                ${badgeHTML}
                                <span><i class="far fa-calendar"></i> ${item.date || ''}</span>
                                ${pdfIndicator}
                            </div>
                        </div>
                        <div class="data-item-actions">
                            <button class="action-btn edit-res-btn" title="Edit" data-item="${itemDataStr}"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete delete-res-btn" title="Delete" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        } catch (err) {
            console.error("Error fetching admin research:", err);
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--red);">Failed to load data.</div>';
        }
    };

    // Use event delegation for all interactions since modal HTML is dynamically injected
    document.body.addEventListener('click', async (e) => {
        
        // 1. Trigger Load when clicking "Modify Existing" tab
        if (e.target && e.target.id === 'tabBtn-res-modify') {
            window.loadAdminResearch();
        }

        // 2. Edit Button Click
        const editBtn = e.target.closest('.edit-res-btn');
        if (editBtn) {
            try {
                const itemData = JSON.parse(decodeURIComponent(editBtn.getAttribute('data-item')));
                
                // Switch to Add Tab
                const addTabBtn = document.getElementById('tabBtn-res-add');
                if (addTabBtn) addTabBtn.click();
                
                // Populate Form
                document.getElementById('res-id').value = itemData.id;
                document.getElementById('res-category').value = itemData.category || '';
                document.getElementById('res-date').value = itemData.date || '';
                document.getElementById('res-title').value = itemData.title || '';
                document.getElementById('res-author').value = itemData.author || '';
                document.getElementById('res-desc').value = itemData.description || '';
                document.getElementById('res-link').value = itemData.external_link || '';
                
                // Update Button Text
                const submitBtn = document.getElementById('save-res-btn');
                if (submitBtn) submitBtn.innerHTML = 'Update Entry';
                
                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast('Loaded into form for editing', 'success');
                }
            } catch (err) {
                console.error("Error parsing item data for edit:", err);
            }
        }

        // 3. Delete Button Click
        const deleteBtn = e.target.closest('.delete-res-btn');
        if (deleteBtn) {
            const itemId = deleteBtn.getAttribute('data-id');
            if (!itemId) return;

            // Use the existing AdminUtils confirm if available
            if (window.AdminUtils && window.AdminUtils.confirmDelete) {
                window.AdminUtils.confirmDelete(async () => {
                    await executeResDelete(itemId, deleteBtn);
                });
            } else if (confirm('Are you sure you want to delete this item?')) {
                await executeResDelete(itemId, deleteBtn);
            }
        }
    });

    // 4. Handle filter change
    document.body.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'res-filter-category') {
            if (window.loadAdminResearch) window.loadAdminResearch();
        }
    });

    async function executeResDelete(itemId, btnElement) {
        try {
            const { error } = await supabase
                .from('research_and_project')
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

    // 5. Form Submission (Insert or Update)
    document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'res-form') {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('#save-res-btn');
            const idInput = form.querySelector('#res-id');
            const categoryInput = form.querySelector('#res-category');
            const dateInput = form.querySelector('#res-date');
            const titleInput = form.querySelector('#res-title');
            const authorInput = form.querySelector('#res-author');
            const descInput = form.querySelector('#res-desc');
            const linkInput = form.querySelector('#res-link');
            const pdfInput = form.querySelector('#res-pdf');

            const isUpdate = idInput.value !== '';
            
            // UI Feedback & Disable Button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                let finalPdfUrl = null; 

                // Storage Pipeline Step (using news_pdfs as requested)
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
                    category: categoryInput.value,
                    date: dateInput.value,
                    title: titleInput.value.trim(),
                    author: authorInput.value.trim() || null,
                    description: descInput.value.trim() || null,
                    external_link: linkInput.value.trim() || null
                };
                
                if (finalPdfUrl !== null) {
                    payload.pdf_url = finalPdfUrl; // maps to pdf_url as assumed
                }

                if (isUpdate) {
                    const { error } = await supabase
                        .from('research_and_project')
                        .update(payload)
                        .eq('id', idInput.value);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('research_and_project')
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
                submitBtn.innerHTML = 'Publish'; // Reset to default text
                
                // Clear the preview text if it exists
                const filePreviewText = pdfInput.nextElementSibling.nextElementSibling;
                if(filePreviewText) filePreviewText.textContent = '';

                // Reload data if we were viewing it
                if (window.loadAdminResearch) window.loadAdminResearch();

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
