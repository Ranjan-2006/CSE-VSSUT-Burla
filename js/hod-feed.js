import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const hodCard = document.getElementById('dynamicHodCard');
    if (!hodCard) return;

    try {
        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .eq('special_role', 'Head of Department')
            .limit(1)
            .single();

        if (error) {
            // If no HOD found, error is thrown by single(). Just leave placeholder or hide.
            if (error.code === 'PGRST116') {
                hodCard.innerHTML = `
                    <div class="hod-header" style="margin-bottom: 0;">
                        <div class="hod-avatar" style="background:var(--gray-200);display:flex;align-items:center;justify-content:center;color:var(--gray-400);font-size:1.5rem;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="hod-badge">Head of Department</div>
                            <h3 class="hod-name">Not Assigned</h3>
                            <p class="hod-qual">Please update via Admin Panel</p>
                        </div>
                    </div>`;
            } else {
                throw error;
            }
            return;
        }

        const photoHtml = data.photo_url 
            ? `<img src="${data.photo_url}" alt="HOD Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            : `<div style="background:var(--gray-200);width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--gray-400);font-size:1.5rem;"><i class="fas fa-user"></i></div>`;

        hodCard.innerHTML = `
            <div class="hod-header" style="margin-bottom: 0; cursor: pointer;" onclick="window.location.href='html/faculty.html'">
                <div class="hod-avatar" style="overflow:hidden;">
                    ${photoHtml}
                </div>
                <div>
                    <div class="hod-badge">Head of Department</div>
                    <h3 class="hod-name">${data.name}</h3>
                    <p class="hod-qual">${data.qualification || data.designation}</p>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error fetching HOD:', err);
    }
});
