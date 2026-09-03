import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('alumni-page-grid');
    const searchInput = document.getElementById('alumniSearchInput');
    const batchFilter = document.getElementById('alumniBatchFilter');

    if (!gridContainer) return;

    gridContainer.innerHTML = '<div style="text-align: center; padding: 60px; grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--blue-600);"></i><p style="margin-top: 15px; color: var(--gray-600);">Loading distinguished alumni...</p></div>';

    const fallbackData = [
        {
            id: 1,
            name: "Jane Doe",
            designation: "Senior Engineer at Google",
            batch_year: "2018",
            quote: "VSSUT gave me the foundation to build my career in technology.",
            photo_url: null,
            showcase: true
        },
        {
            id: 2,
            name: "John Smith",
            designation: "Data Scientist at Microsoft",
            batch_year: "2019",
            quote: "The faculty's guidance shaped my problem-solving skills.",
            photo_url: null,
            showcase: true
        },
        {
            id: 3,
            name: "Alice Johnson",
            designation: "Startup Founder & CEO",
            batch_year: "2020",
            quote: "The research environment here is second to none.",
            photo_url: null,
            showcase: true
        },
        {
            id: 4,
            name: "Rahul Sharma",
            designation: "Principal Architect at Amazon",
            batch_year: "2015",
            quote: "Hands-on projects in CSE labs set the trajectory for my engineering career.",
            photo_url: null,
            showcase: false
        },
        {
            id: 5,
            name: "Priyanka Mishra",
            designation: "AI Research Scientist at Meta",
            batch_year: "2017",
            quote: "The mentorship at VSSUT instilled confidence to pursue advanced research.",
            photo_url: null,
            showcase: false
        },
        {
            id: 6,
            name: "Siddharth Verma",
            designation: "Director of Engineering at Uber",
            batch_year: "2014",
            quote: "VSSUT teaches resilience and practical problem solving under constraints.",
            photo_url: null,
            showcase: false
        }
    ];

    let allAlumni = [];

    try {
        const { data, error } = await supabase
            .from('alumni')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        allAlumni = (data && data.length > 0) ? data : fallbackData;
    } catch (err) {
        console.warn("Using fallback alumni data:", err);
        allAlumni = fallbackData;
    }

    // Populate Batch Filter options
    if (batchFilter) {
        const batches = Array.from(new Set(allAlumni.map(a => a.batch_year).filter(Boolean)))
            .sort((a, b) => b - a);
        batches.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = `Batch ${b}`;
            batchFilter.appendChild(opt);
        });
    }

    function renderList(items) {
        if (!items || items.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--white); border-radius: 16px; border: 1px dashed var(--gray-300);">
                    <i class="fas fa-user-graduate" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--blue-900); margin-bottom: 8px;">No Alumni Found</h3>
                    <p style="color: var(--gray-500);">Try adjusting your search query or batch filter.</p>
                </div>
            `;
            return;
        }

        let html = '';
        items.forEach(alumni => {
            const avatarHTML = alumni.photo_url
                ? `<img src="${alumni.photo_url}" alt="${alumni.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 16px; border: 3px solid #e0e7ff; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" onerror="this.outerHTML='<div style=\\'width: 100px; height: 100px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 46px; margin-bottom: 16px; border: 3px solid #e2e8f0;\\'><i class=\\'fas fa-user-graduate\\'></i></div>'">`
                : `<div style="width: 100px; height: 100px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 46px; margin-bottom: 16px; border: 3px solid #e2e8f0;"><i class="fas fa-user-graduate"></i></div>`;

            const batchBadge = alumni.batch_year
                ? `<span style="background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px;"><i class="fas fa-graduation-cap"></i> Batch ${alumni.batch_year}</span>`
                : `<span style="background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px;"><i class="fas fa-graduation-cap"></i> Distinguished Alumnus</span>`;

            const quoteSection = alumni.quote
                ? `<p style="font-size: 0.86rem; color: var(--gray-600); font-style: italic; line-height: 1.5; margin-top: auto; padding-top: 14px; border-top: 1px dashed var(--gray-200); width: 100%;">"${alumni.quote}"</p>`
                : '';

            html += `
                <div class="alumni-modal-card" style="background: var(--white); border-radius: 16px; padding: 28px 22px 22px;">
                    ${avatarHTML}
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--blue-950); margin-bottom: 6px;">${alumni.name}</h3>
                    <p style="font-size: 0.92rem; color: var(--blue-700); font-weight: 500; margin-bottom: 10px; line-height: 1.4;">${alumni.designation || 'Distinguished Alumnus'}</p>
                    ${batchBadge}
                    ${quoteSection}
                </div>
            `;
        });

        gridContainer.innerHTML = html;
    }

    function applyFilters() {
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const selectedBatch = batchFilter ? batchFilter.value : 'all';

        const filtered = allAlumni.filter(item => {
            const matchesQuery = !query ||
                (item.name || '').toLowerCase().includes(query) ||
                (item.designation || '').toLowerCase().includes(query) ||
                (item.batch_year || '').toString().toLowerCase().includes(query) ||
                (item.quote || '').toLowerCase().includes(query);

            const matchesBatch = selectedBatch === 'all' || item.batch_year == selectedBatch;

            return matchesQuery && matchesBatch;
        });

        renderList(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (batchFilter) batchFilter.addEventListener('change', applyFilters);

    renderList(allAlumni);
});
