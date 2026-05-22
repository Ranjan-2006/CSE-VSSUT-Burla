import { supabase } from './supabase-config.js';

let allProfiles = [];

document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('facultyGrid');
    if (!gridContainer) return;

    // Read the category we want to display from the grid container's data attribute
    const category = gridContainer.getAttribute('data-category') || 'faculty';

    try {
        gridContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading profiles...</div>';

        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .eq('category', category)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allProfiles = data || [];
        renderProfiles(gridContainer, allProfiles);

    } catch (err) {
        console.error('Error loading profiles:', err);
        gridContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading profiles. Please try again later.</p></div>';
    }

    // Modal setup
    const modalOverlay = document.getElementById('facultyProfileModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeProfileModal();
        });
    }
});

function renderProfiles(container, profiles) {
    if (profiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>No profiles found for this category yet.</p>
            </div>`;
        return;
    }

    let html = '';
    profiles.forEach(profile => {
        const photoHtml = profile.photo_url 
            ? `<img src="${profile.photo_url}" alt="${profile.name}" class="faculty-img">`
            : `<div class="faculty-img"><i class="fas fa-user"></i></div>`;

        const email = profile.contact?.email || '';
        const phone = profile.contact?.phone || '';

        const displayRole = profile.category === 'guest'
            ? (profile.qualification || profile.designation || '')
            : (profile.designation || '');

        html += `
            <div class="faculty-card">
                ${photoHtml}
                <h3>${profile.name}</h3>
                <p class="faculty-designation">${displayRole}</p>
                ${profile.special_role ? `<div class="faculty-role-badge"><i class="fas fa-star"></i> ${profile.special_role}</div>` : ''}
                <div class="faculty-contacts">
                    ${email ? `<div><i class="fas fa-envelope"></i> ${email}</div>` : ''}
                    ${phone ? `<div><i class="fas fa-phone"></i> ${phone}</div>` : ''}
                </div>
                <button class="btn-view-profile" onclick="window.openProfileModal('${profile.id}')">
                    View Profile <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    });

    // We add a wrapper to keep the CSS grid structure
    container.innerHTML = `<div class="faculty-grid">${html}</div>`;
}

// Make globally available for inline onclick
window.openProfileModal = function(id) {
    const profile = allProfiles.find(p => String(p.id) === String(id));
    if (!profile) return;

    const modalOverlay = document.getElementById('facultyProfileModal');
    const modalBody = document.getElementById('modalProfileBody');

    // Header
    const photoHtml = profile.photo_url 
        ? `<img src="${profile.photo_url}" alt="${profile.name}" class="modal-img">`
        : `<div class="modal-img-placeholder"><i class="fas fa-user"></i></div>`;

    const email = profile.contact?.email || '';
    const phone = profile.contact?.phone || '';
    const address = profile.contact?.address || '';

    document.getElementById('modalProfileHeader').innerHTML = `
        ${photoHtml}
        <div class="modal-header-info">
            <h2>${profile.name}</h2>
            <p>${profile.designation || ''}</p>
            <div class="modal-quick-contacts">
                ${profile.qualification ? `<div><i class="fas fa-graduation-cap"></i> ${profile.qualification}</div>` : ''}
                ${email ? `<div><i class="fas fa-envelope"></i> <a href="mailto:${email}" style="color:inherit;text-decoration:none;">${email}</a></div>` : ''}
                ${phone ? `<div><i class="fas fa-phone"></i> ${phone}</div>` : ''}
            </div>
        </div>
    `;

    // Body Fields Generator
    let bodyHtml = '';

    function createCollapsibleSection(title, icon, contentHtml, isCollapsedByDefault = true) {
        const collapsedClass = isCollapsedByDefault ? 'collapsed' : '';
        return `
            <div class="profile-section ${collapsedClass}">
                <h4 onclick="this.parentElement.classList.toggle('collapsed')">
                    <i class="${icon}"></i> ${title}
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </h4>
                <div class="profile-section-content">
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    // Specialization
    if (Array.isArray(profile.specialization) && profile.specialization.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.specialization.map((s, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${s}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Specialization', 'fas fa-star', content, false); // Keep first section expanded for better UX
    }

    // Experience (plain string)
    if (profile.experience) {
        const content = `<p style="line-height:1.6;margin:0;">${profile.experience} Years</p>`;
        bodyHtml += createCollapsibleSection('Experience', 'fas fa-briefcase', content, false); // Keep short info expanded
    }

    // Subjects taught (array of {level, subjects})
    if (Array.isArray(profile.subjects_taught) && profile.subjects_taught.length > 0) {
        let subjectsHtml = profile.subjects_taught.map((group, i) => {
            const level = group.level || 'Level';
            const subs = Array.isArray(group.subjects) ? group.subjects : [];
            return `
                <div key="${i}" style="margin-bottom: 12px; ${i === profile.subjects_taught.length - 1 ? 'margin-bottom:0;' : ''}">
                    <h5 style="margin: 0 0 5px 0; color: var(--gray-800); font-size: 0.95rem; font-weight: 600;">${level}</h5>
                    <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                        ${subs.map((s, j) => `<li key="${j}" style="margin-bottom: 6px; padding-left: 4px;">${s}</li>`).join('')}
                    </ol>
                </div>
            `;
        }).join('');
        bodyHtml += createCollapsibleSection('Subjects Teaching', 'fas fa-book-open', subjectsHtml);
    }

    // Research Areas
    if (Array.isArray(profile.research_areas) && profile.research_areas.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.research_areas.map((s, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${s}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Research Areas', 'fas fa-microscope', content);
    }

    // Research Guidance
    if (Array.isArray(profile.research_guidance) && profile.research_guidance.length > 0) {
        let rgHtml = profile.research_guidance.map((g, i) => {
            const heading = `${g.degree || ''}${g.summary ? ' — ' + g.summary : ''}`.trim();
            const candidates = Array.isArray(g.candidates) ? g.candidates : [];
            return `
                <div key="${i}" style="margin-bottom: 12px; ${i === profile.research_guidance.length - 1 ? 'margin-bottom:0;' : ''}">
                    <h5 style="margin: 0 0 5px 0; color: var(--gray-800); font-size: 0.95rem; font-weight: 600;">${heading}</h5>
                    <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                        ${candidates.map((c, j) => `<li key="${j}" style="margin-bottom: 6px; padding-left: 4px;">${c}</li>`).join('')}
                    </ol>
                </div>
            `;
        }).join('');
        bodyHtml += createCollapsibleSection('Research Guidance', 'fas fa-user-graduate', rgHtml);
    }

    // Publications grouped
    if (Array.isArray(profile.publications) && profile.publications.length > 0) {
        const grouped = profile.publications.reduce((acc, pub) => {
            if (pub && pub.type) {
                acc[pub.type] = acc[pub.type] || [];
                acc[pub.type].push(pub.citation || '');
            }
            return acc;
        }, {});
        
        let pubsHtml = ['International', 'National', 'Conference']
            .filter(t => grouped[t]?.length > 0)
            .map((t, idx) => {
                return `
                    <div key="${t}" style="margin-bottom: 12px; ${idx === 2 ? 'margin-bottom:0;' : ''}">
                        <h5 style="margin: 0 0 5px 0; color: var(--gray-800); font-size: 0.95rem; font-weight: 600;">${t} Publications (${grouped[t].length})</h5>
                        <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                            ${grouped[t].map((c, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${c}</li>`).join('')}
                        </ol>
                    </div>
                `;
            }).join('');
            
        if (pubsHtml) {
            bodyHtml += createCollapsibleSection('Publications', 'fas fa-file-alt', pubsHtml);
        }
    }

    // Books
    if (Array.isArray(profile.books) && profile.books.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.books.map((b, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${b.citation || ''}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Books / Book Chapters', 'fas fa-book', content);
    }

    // Patents
    if (Array.isArray(profile.patents) && profile.patents.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.patents.map((p, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${p.description || ''}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Patents', 'fas fa-certificate', content);
    }

    // Awards
    if (Array.isArray(profile.awards) && profile.awards.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.awards.map((s, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${s}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Awards & Honors', 'fas fa-award', content);
    }

    // Seminars
    if (Array.isArray(profile.seminars) && profile.seminars.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.seminars.map((s, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${s.description || ''}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Seminars Organized', 'fas fa-chalkboard-teacher', content);
    }

    // Administrative Responsibilities
    if (Array.isArray(profile.admin_responsibilities) && profile.admin_responsibilities.length > 0) {
        const content = `
            <ol style="padding-left: 18px; line-height: 1.6; margin: 0; color: var(--gray-700);">
                ${profile.admin_responsibilities.map((s, i) => `<li key="${i}" style="margin-bottom: 8px; padding-left: 4px;">${s}</li>`).join('')}
            </ol>
        `;
        bodyHtml += createCollapsibleSection('Administrative Responsibilities', 'fas fa-tasks', content);
    }

    // Present Address
    if (address) {
        const content = `<p style="line-height:1.6;margin:0;">${address}</p>`;
        bodyHtml += createCollapsibleSection('Present Address', 'fas fa-map-marker-alt', content, false); // Keep short info expanded
    }

    if (bodyHtml === '') {
        bodyHtml = '<div style="text-align:center; color:var(--gray-500); padding: 40px 0;"><i>No additional detailed information provided.</i></div>';
    }

    modalBody.innerHTML = bodyHtml;

    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

window.closeProfileModal = function() {
    const modalOverlay = document.getElementById('facultyProfileModal');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

function formatToNumberedList(rawText) {
    if (!rawText || String(rawText).trim() === "") return "";

    let cleanText = String(rawText).trim();

    // 1. Remove generic headers that act as garbage lines
    let lines = cleanText.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
    lines = lines.filter(l => !/^(?:International|National)\s*(?:Publications|Journals|Conferences)$/i.test(l));

    let mergedLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Detect if this line explicitly starts with a number or bullet
        let hasListMarker = /^(\d+\.|-|\*)\s+/.test(line);
        // Clean the list marker
        line = line.replace(/^(\d+\.|-|\*)\s*/, '');

        if (mergedLines.length === 0) {
            mergedLines.push(line);
            continue;
        }

        let prevLine = mergedLines[mergedLines.length - 1];

        // HEURISTICS TO MERGE BROKEN LINES (fixing scraper artifacts):
        // A. Does this line start with a punctuation mark? (e.g. , "A Novel...")
        let startsWithPunctuation = /^[,."”’]/.test(line);
        
        // B. Did the previous line end with a connector or comma?
        let prevEndsWithConnector = /([,&]|and|with)$/i.test(prevLine);

        // If it shouldn't be a forced new list item AND it looks like it belongs to the previous line, merge it.
        if (!hasListMarker && (startsWithPunctuation || prevEndsWithConnector)) {
            // Merge them neatly
            if (startsWithPunctuation && line.startsWith(',')) {
                mergedLines[mergedLines.length - 1] = prevLine + line; // Don't add extra space before comma
            } else {
                mergedLines[mergedLines.length - 1] = prevLine + " " + line;
            }
        } else {
            // It's a valid, standalone line
            mergedLines.push(line);
        }
    }

    // Filter out any resulting lines that are way too short to be meaningful
    let validItems = mergedLines.filter(item => item.length > 10);

    // If there's only 0 or 1 item, don't create a list, just return a paragraph
    if (validItems.length <= 1) {
        let singleText = validItems.length === 1 ? validItems[0] : cleanText;
        return `<p style="line-height: 1.6; margin: 0;">${singleText.replace(/\n/g, '<br>')}</p>`;
    }

    // Create list items
    let listHtml = validItems
        .map(item => `<li style="margin-bottom: 12px; padding-left: 4px;">${item}</li>`)
        .join("");

    // Wrap in ordered list
    return `<ol style="padding-left: 18px; line-height: 1.6; margin: 5px 0 0 0; color: var(--gray-700);">
                ${listHtml}
            </ol>`;
}