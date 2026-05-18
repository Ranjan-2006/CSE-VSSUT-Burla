import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Data Lifecycle
    const newsContainers = document.querySelectorAll('.news-scroll');
    if (!newsContainers || newsContainers.length === 0) return;

    // Soft placeholder state
    newsContainers.forEach(container => {
        container.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading latest news...</div>';
    });

    try {
        const { data: newsEvents, error } = await supabase
            .from('news_events')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        newsContainers.forEach(container => {
            container.innerHTML = ''; // clear spinner
            
            if (!newsEvents || newsEvents.length === 0) {
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No news available at the moment.</div>';
                return;
            }

            newsEvents.forEach((event, index) => {
                // 2. The "New" Badge Rule (Top 3)
                const isNew = index < 3;
                const newBadgeHTML = isNew ? '<span class="badge-new" style="background: var(--red); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">New</span>' : '';
                
                // Keep the existing .new-tag class for the container styling if it's new
                const newClass = isNew ? 'new-tag' : '';

                // 3. Date Uniformity
                let formattedDate = 'Unknown Date';
                if (event.date) {
                    const dateObj = new Date(event.date);
                    // format: 18 May 2026
                    formattedDate = dateObj.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                }

                // 4. The Interactive Info Bubble
                const infoBubbleHTML = event.description ? 
                    `<span title="${event.description}" style="cursor: help; margin-left: 8px; font-size: 1.1rem; vertical-align: middle;" data-tooltip="${event.description}">&#x2139;&#xFE0F;</span>` : '';

                // 5. PDF File Link Indicator
                const pdfLinkHTML = event.pdf_url ? 
                    `<a href="${event.pdf_url}" target="_blank" style="margin-left: 8px; text-decoration: none; font-size: 1.1rem; vertical-align: middle;" title="View Document">&#x1F4C4;</a>` : '';

                const itemHTML = `
                    <div class="news-item ${newClass}">
                        <span class="news-date">${formattedDate}${newBadgeHTML}</span>
                        <p>${event.title} ${infoBubbleHTML} ${pdfLinkHTML}</p>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', itemHTML);
            });
        });

    } catch (err) {
        console.error("Error fetching news:", err);
        newsContainers.forEach(container => {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--red);">Failed to load news. Please try again later.</div>';
        });
    }
});
