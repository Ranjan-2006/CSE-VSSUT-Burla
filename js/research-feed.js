import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Target Main Containers
    const pubContainer = document.getElementById('res-pubs');
    const projContainer = document.getElementById('res-proj');
    
    // 2. Target Modal Containers
    const pubModalBody = document.querySelector('#pubModal .modal-body');
    const projModalBody = document.querySelector('#projModal .modal-body');

    if (!pubContainer && !projContainer) return;

    // Preserve the "View All" buttons if they exist
    const viewPubBtnHTML = pubContainer ? (pubContainer.querySelector('#viewPubBtn')?.outerHTML || '<a href="#" class="btn-text" id="viewPubBtn">View All Publications <i class="fas fa-arrow-right"></i></a>') : '';
    const viewProjBtnHTML = projContainer ? (projContainer.querySelector('#viewProjBtn')?.outerHTML || '<a href="#" class="btn-text" id="viewProjBtn">View All Projects <i class="fas fa-arrow-right"></i></a>') : '';

    // Soft placeholder state
    if (pubContainer) pubContainer.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading publications...</div>';
    if (projContainer) projContainer.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';

    let allPublications = [];
    let allProjects = [];

    // Function to render HTML for a single item
    const renderItem = (item, isAccent = false, isModal = false) => {
        const authorPrefix = item.author ? `${item.author} — ` : '';
        
        // Interactive Icons (PDF, Description, External Link)
        const infoBubbleHTML = item.description ? 
            `<span title="${item.description}" style="cursor: help; margin-left: 8px; font-size: 1.1rem; vertical-align: middle;" data-tooltip="${item.description}">&#x2139;&#xFE0F;</span>` : '';

        const pdfLinkHTML = item.pdf_url ? 
            `<a href="${item.pdf_url}" target="_blank" style="margin-left: 8px; text-decoration: none; font-size: 1.1rem; vertical-align: middle;" title="View Document">&#x1F4C4;</a>` : '';
            
        const externalLinkHTML = item.external_link ? 
            `<a href="${item.external_link}" target="_blank" style="margin-left: 8px; text-decoration: none; font-size: 1.1rem; vertical-align: middle;" title="External Link">&#x1F517;</a>` : '';

        if (isModal) {
            // Render slightly differently for modal (similar to news modal)
            let formattedDate = item.date || 'Unknown Date';
            if (item.date) {
                const dateObj = new Date(item.date);
                formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            return `
                <div class="news-item">
                    <span class="news-date">${formattedDate}</span>
                    <p>${authorPrefix}"${item.title}" ${infoBubbleHTML} ${pdfLinkHTML} ${externalLinkHTML}</p>
                </div>
            `;
        }

        return `
            <div class="pub-item">
                <div class="pub-dot ${isAccent ? 'accent' : ''}"></div>
                <div>
                    <p class="pub-title">${authorPrefix}"${item.title}" ${infoBubbleHTML} ${pdfLinkHTML} ${externalLinkHTML}</p>
                </div>
            </div>
        `;
    };

    try {
        const { data: researchItems, error } = await supabase
            .from('research_and_project')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        allPublications = researchItems ? researchItems.filter(item => item.category === 'publication') : [];
        allProjects = researchItems ? researchItems.filter(item => item.category === 'sponsored_project') : [];

        // --- RENDER PUBLICATIONS ---
        if (pubContainer) {
            if (allPublications.length === 0) {
                pubContainer.innerHTML = '<div style="padding: 20px; color: var(--gray-500);">No publications available yet.</div>';
                if (pubModalBody) pubModalBody.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No publications available.</div>';
            } else {
                // 1. Render limited feed
                let mainHtml = '';
                allPublications.slice(0, 4).forEach(item => mainHtml += renderItem(item, false, false));
                if (allPublications.length > 4) {
                    mainHtml += viewPubBtnHTML;
                }
                pubContainer.innerHTML = mainHtml;

                // 2. Render all in modal
                if (pubModalBody) {
                    let modalHtml = '';
                    allPublications.forEach(item => modalHtml += renderItem(item, false, true));
                    pubModalBody.innerHTML = modalHtml;
                }
            }
        }

        // --- RENDER PROJECTS ---
        if (projContainer) {
            if (allProjects.length === 0) {
                projContainer.innerHTML = '<div style="padding: 20px; color: var(--gray-500);">No sponsored projects available yet.</div>';
                if (projModalBody) projModalBody.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No projects available.</div>';
            } else {
                // 1. Render limited feed
                let mainHtml = '';
                allProjects.slice(0, 4).forEach(item => mainHtml += renderItem(item, true, false));
                if (allProjects.length > 4) {
                    mainHtml += viewProjBtnHTML;
                }
                projContainer.innerHTML = mainHtml;

                // 2. Render all in modal
                if (projModalBody) {
                    let modalHtml = '';
                    allProjects.forEach(item => modalHtml += renderItem(item, true, true));
                    projModalBody.innerHTML = modalHtml;
                }
            }
        }

    } catch (err) {
        console.error("Error fetching research data:", err);
        if (pubContainer) pubContainer.innerHTML = '<div style="padding: 20px; color: var(--red);">Failed to load publications.</div>';
        if (projContainer) projContainer.innerHTML = '<div style="padding: 20px; color: var(--red);">Failed to load projects.</div>';
    }

    // Event Delegation for "View All" buttons to open Modals
    document.body.addEventListener('click', (e) => {
        const pubBtn = e.target.closest('#viewPubBtn');
        const projBtn = e.target.closest('#viewProjBtn');
        
        if (pubBtn) {
            e.preventDefault();
            const modal = document.getElementById('pubModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        if (projBtn) {
            e.preventDefault();
            const modal = document.getElementById('projModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
});
