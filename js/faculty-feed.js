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

        html += `
            <div class="faculty-card">
                ${photoHtml}
                <h3>${profile.name}</h3>
                <p class="faculty-designation">${profile.designation}</p>
                ${profile.special_role ? `<div class="faculty-role-badge"><i class="fas fa-star"></i> ${profile.special_role}</div>` : ''}
                <div class="faculty-contacts">
                    ${profile.email ? `<div><i class="fas fa-envelope"></i> ${profile.email}</div>` : ''}
                    ${profile.phone ? `<div><i class="fas fa-phone"></i> ${profile.phone}</div>` : ''}
                </div>
                <button class="btn-view-profile" onclick="window.openProfileModal(${profile.id})">
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
    const profile = allProfiles.find(p => p.id === id);
    if (!profile) return;

    const modalOverlay = document.getElementById('facultyProfileModal');
    const modalBody = document.getElementById('modalProfileBody');

    // Header
    const photoHtml = profile.photo_url 
        ? `<img src="${profile.photo_url}" alt="${profile.name}" class="modal-img">`
        : `<div class="modal-img-placeholder"><i class="fas fa-user"></i></div>`;

    document.getElementById('modalProfileHeader').innerHTML = `
        ${photoHtml}
        <div class="modal-header-info">
            <h2>${profile.name}</h2>
            <p>${profile.designation}</p>
            <div class="modal-quick-contacts">
                ${profile.qualification ? `<div><i class="fas fa-graduation-cap"></i> ${profile.qualification}</div>` : ''}
                ${profile.email ? `<div><i class="fas fa-envelope"></i> <a href="mailto:${profile.email}" style="color:inherit;text-decoration:none;">${profile.email}</a></div>` : ''}
                ${profile.phone ? `<div><i class="fas fa-phone"></i> ${profile.phone}</div>` : ''}
            </div>
        </div>
    `;

    // Body Fields Generator
    let bodyHtml = '';
    const addSection = (title, icon, content) => {
        if (content && content.trim() !== '') {
            bodyHtml += `
                <div class="profile-section">
                    <h4><i class="fas fa-${icon}"></i> ${title}</h4>
                    <p>${content}</p>
                </div>
            `;
        }
    };

    addSection('Specialization', 'star', profile.specialization);
    addSection('Experience', 'briefcase', profile.experience ? `${profile.experience} Years` : '');
    addSection('Subjects Teaching', 'book-open', profile.subjects);
    addSection('Research Areas', 'microscope', profile.research_areas);
    addSection('Research Guidance', 'users', profile.research_guidance);
    addSection('Projects & Publications', 'file-alt', profile.publications);
    addSection('Books / Book Chapters', 'book', profile.books);
    addSection('Patents', 'certificate', profile.patents);
    addSection('Awards & Honors', 'award', profile.awards);
    addSection('Seminars Organized', 'chalkboard-teacher', profile.seminars);
    addSection('Administrative Responsibilities', 'tasks', profile.admin_responsibilities);
    addSection('Present Address', 'map-marker-alt', profile.address);

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
