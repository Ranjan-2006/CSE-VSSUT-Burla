import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Load Courses
    window.loadAdminCourses = async () => {
        const listContainer = document.getElementById('admin-course-list');
        if (!listContainer) return;
        
        try {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

            const { data: courses, error } = await supabase
                .from('course_structures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!courses || courses.length === 0) {
                listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No course structures found. Add one from the Add tab!</div>';
                return;
            }

            let html = '';
            courses.forEach(item => {
                const progDisplay = item.programme === 'ug' ? 'Undergraduate (B.Tech)' : 'Postgraduate (M.Tech/MCA)';
                
                html += `
                    <div class="data-item" data-id="${item.id}">
                        <div class="data-item-content">
                            <div class="data-item-title">${item.title}</div>
                            <div class="data-item-meta">${progDisplay}</div>
                            <div style="margin-top: 5px;">
                                <a href="${item.pdf_url}" target="_blank" style="color: var(--blue-600); font-size: 0.85rem; text-decoration: none;"><i class="fas fa-external-link-alt"></i> View PDF</a>
                            </div>
                        </div>
                        <div class="data-item-actions">
                            <button class="action-btn delete" onclick="deleteCourseItem('${item.id}', '${item.pdf_url}')" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });

            listContainer.innerHTML = html;
        } catch (err) {
            console.error("Error loading courses:", err);
            listContainer.innerHTML = '<div style="color: red; padding: 20px;">Error loading data.</div>';
        }
    };

    // Delete Course
    window.deleteCourseItem = async function(id, pdfUrl) {
        AdminUtils.confirmDelete(async () => {
            try {
                // Extract filename from URL to delete from storage
                const urlObj = new URL(pdfUrl);
                const pathParts = urlObj.pathname.split('/');
                const fileName = pathParts[pathParts.length - 1];

                if (fileName) {
                    await supabase.storage.from('course_pdfs').remove([fileName]);
                }

                // Delete from DB
                const { error } = await supabase
                    .from('course_structures')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                AdminUtils.showToast("Course structure deleted successfully!");
                window.loadAdminCourses();
            } catch (err) {
                console.error("Error deleting:", err);
                alert("Failed to delete course: " + err.message);
            }
        });
    };

    // Event delegation for interactions
    document.body.addEventListener('click', async (e) => {
        // Trigger Load when clicking "Manage Courses" tab
        if (e.target && e.target.id === 'tabBtn-course-modify') {
            window.loadAdminCourses();
        }
    });

    // Handle Form Submit
    document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'course-form') {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = document.getElementById('save-course-btn');
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            try {
                const prog = document.getElementById('course-prog').value;
                const title = document.getElementById('course-title').value;
                const pdfInput = document.getElementById('course-pdf');

                if (!prog) {
                    throw new Error("Please select a programme first.");
                }

                if (!pdfInput.files || pdfInput.files.length === 0) {
                    throw new Error("Please select a PDF file.");
                }

                const file = pdfInput.files[0];
                if (file.type !== 'application/pdf') {
                    throw new Error("Only PDF files are allowed.");
                }

                const fileExt = file.name.split('.').pop();
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                // Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from('course_pdfs')
                    .upload(uniqueFileName, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: publicUrlData } = supabase.storage
                    .from('course_pdfs')
                    .getPublicUrl(uniqueFileName);
                
                const publicUrl = publicUrlData.publicUrl;

                // Insert into Database
                const { error: dbError } = await supabase
                    .from('course_structures')
                    .insert([{
                        programme: prog,
                        title: title,
                        pdf_url: publicUrl
                    }]);

                if (dbError) throw dbError;

                if (window.AdminUtils && window.AdminUtils.showToast) {
                    window.AdminUtils.showToast("Course Structure saved successfully!", "success");
                } else {
                    alert("Saved successfully!");
                }
                
                form.reset();
                document.querySelectorAll('.prog-card-select').forEach(c => c.classList.remove('selected'));
                document.getElementById('course-prog').value = '';
                const fileText = form.querySelector('.file-upload-text');
                if(fileText) {
                    fileText.innerHTML = '<i class="fas fa-file-pdf"></i> Click to browse or drag PDF here';
                }
                
                document.getElementById('tabBtn-course-modify').click();
                window.loadAdminCourses();

            } catch (err) {
                console.error("Error saving course:", err);
                alert(err.message);
            } finally {
                submitBtn.innerHTML = 'Upload & Save';
                submitBtn.disabled = false;
            }
        }
    });
});
