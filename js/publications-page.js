import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const pubContainer = document.getElementById('publications-list-container');
    if (!pubContainer) return;

    pubContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--blue-600);"></i><p style="margin-top: 10px;">Loading publications...</p></div>';

    try {
        const { data, error } = await supabase
            .from('research_and_project')
            .select('*')
            .eq('category', 'publication')
            .order('date', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            pubContainer.innerHTML = `
                <div class="empty-state" style="text-align:center; padding: 40px;">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 20px;"></i>
                    <p>No publication records found.</p>
                </div>
            `;
            return;
        }

        // Group by year
        const grouped = {};
        data.forEach(item => {
            let year = 'Unknown Year';
            if (item.date) {
                // assume date is YYYY-MM-DD or contains year
                const d = new Date(item.date);
                if (!isNaN(d.getTime())) {
                    year = d.getFullYear().toString();
                } else if (item.date.match(/\d{4}/)) {
                    year = item.date.match(/\d{4}/)[0];
                }
            }
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(item);
        });

        // Sort years descending
        const sortedYears = Object.keys(grouped).sort((a, b) => {
            if (a === 'Unknown Year') return 1;
            if (b === 'Unknown Year') return -1;
            return parseInt(b) - parseInt(a);
        });

        let html = '<div class="publications-wrapper" style="background: var(--white); padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">';
        
        sortedYears.forEach(year => {
            html += `
                <div class="year-section" style="margin-bottom: 40px;">
                    <h3 style="color: var(--blue-800); border-bottom: 2px solid var(--blue-100); padding-bottom: 10px; margin-bottom: 20px; font-size: 1.5rem;">
                        <i class="far fa-calendar-alt" style="color: var(--blue-500); margin-right: 8px;"></i> ${year}
                    </h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
            `;
            
            grouped[year].forEach(item => {
                const authorPrefix = item.author ? `<strong style="color: var(--blue-700);">${item.author}</strong> — ` : '';
                const pdfLinkHTML = item.pdf_url ? `<a href="${item.pdf_url}" target="_blank" style="margin-left: 8px; color: var(--red-600);" title="View PDF Document"><i class="far fa-file-pdf"></i> PDF</a>` : '';
                const externalLinkHTML = item.external_link ? `<a href="${item.external_link}" target="_blank" style="margin-left: 8px; color: var(--blue-600);" title="External Link"><i class="fas fa-external-link-alt"></i> Link</a>` : '';
                
                html += `
                    <li style="margin-bottom: 16px; padding-left: 24px; position: relative; line-height: 1.6; color: var(--gray-700);">
                        <i class="fas fa-circle" style="position: absolute; left: 0; top: 8px; font-size: 0.4rem; color: var(--blue-500);"></i>
                        ${authorPrefix}"${item.title}" ${item.description ? `<br><small style="color: var(--gray-500); display: block; margin-top: 4px;">${item.description}</small>` : ''}
                        <div style="margin-top: 6px; font-size: 0.85rem;">${pdfLinkHTML} ${externalLinkHTML}</div>
                    </li>
                `;
            });
            
            html += `</ul></div>`;
        });

        html += '</div>';
        pubContainer.innerHTML = html;

    } catch (err) {
        console.error('Error fetching publications:', err);
        pubContainer.innerHTML = '<div style="text-align: center; color: var(--red-500); padding: 40px;">Error loading publications.</div>';
    }
});
