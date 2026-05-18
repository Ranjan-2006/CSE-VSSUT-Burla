import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('students-grid-container');
    const modal = document.getElementById('classModal');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--blue-600);"></i><p style="margin-top: 10px;">Loading student classes...</p></div>';

    let grouped = {};

    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('class_year', { ascending: false })
            .order('name', { ascending: true });

        if (error) throw error;
        const allStudents = data || [];

        if (allStudents.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center; padding: 40px;">
                    <i class="fas fa-users-class" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 20px;"></i>
                    <p>No student records found.</p>
                </div>
            `;
            return;
        }

        // Group by year
        allStudents.forEach(student => {
            const year = student.class_year || 'Unknown';
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(student);
        });

        const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; justify-content: center;">';
        
        sortedYears.forEach(year => {
            const studentCount = grouped[year].length;
            html += `
                <div class="class-card" onclick="openClassModal('${year}')" style="background: var(--white); border-radius: 12px; padding: 30px 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: pointer; border: 1px solid var(--gray-100); transition: transform 0.3s, box-shadow 0.3s;">
                    <div style="width: 70px; height: 70px; background: var(--blue-50); color: var(--blue-600); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 15px;">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <h3 style="color: var(--blue-900); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; margin-bottom: 8px;">Class of ${year}</h3>
                    <p style="color: var(--gray-500); font-size: 0.95rem; margin: 0; font-weight: 500;">${studentCount} Students Enrolled</p>
                    <div style="margin-top: 20px;">
                        <span style="color: var(--blue-600); font-size: 0.9rem; font-weight: 600;">View Roster <i class="fas fa-arrow-right" style="margin-left: 5px; font-size: 0.8rem;"></i></span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

        // Add some hover styles for the cards
        const style = document.createElement('style');
        style.textContent = `
            .class-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                border-color: var(--blue-200) !important;
            }
        `;
        document.head.appendChild(style);

    } catch (err) {
        console.error("Error fetching students:", err);
        container.innerHTML = '<div style="text-align: center; color: var(--red-500); padding: 40px;">Error loading students.</div>';
    }

    // Modal Logic
    window.openClassModal = (year) => {
        if (!modal) return;
        
        const students = grouped[year] || [];
        
        document.getElementById('cm-title').innerText = `Class of ${year} - Student Roster`;
        
        let listHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <thead>
                    <tr style="background: var(--gray-50); border-bottom: 2px solid var(--gray-200);">
                        <th style="padding: 12px 15px; text-align: left; color: var(--gray-600); font-size: 0.9rem; width: 60px;">#</th>
                        <th style="padding: 12px 15px; text-align: left; color: var(--gray-600); font-size: 0.9rem;">Registration No.</th>
                        <th style="padding: 12px 15px; text-align: left; color: var(--gray-600); font-size: 0.9rem;">Student Name</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (students.length === 0) {
            listHtml += `<tr><td colspan="3" style="padding: 20px; text-align: center; color: var(--gray-500);">No students found.</td></tr>`;
        } else {
            students.forEach((student, index) => {
                listHtml += `
                    <tr style="border-bottom: 1px solid var(--gray-100);">
                        <td style="padding: 12px 15px; color: var(--gray-500); font-size: 0.9rem;">${index + 1}</td>
                        <td style="padding: 12px 15px; color: var(--blue-600); font-family: monospace; font-weight: 600; font-size: 1rem;">${student.reg_no}</td>
                        <td style="padding: 12px 15px; color: var(--gray-800); font-weight: 500;">${student.name}</td>
                    </tr>
                `;
            });
        }
        
        listHtml += `</tbody></table>`;
        document.getElementById('cm-list').innerHTML = listHtml;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeClassModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeClassModal();
        });
    }
});
