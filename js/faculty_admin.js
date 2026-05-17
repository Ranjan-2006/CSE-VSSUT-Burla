// faculty_admin.js - Logic for Faculty & Staff Management

document.addEventListener('DOMContentLoaded', () => {
    
    // Setup Page Tabs
    AdminUtils.setupTabs(
        [document.getElementById('tab-fac'), document.getElementById('tab-staff'), document.getElementById('tab-guest')],
        [document.getElementById('content-fac'), document.getElementById('content-staff'), document.getElementById('content-guest')]
    );

    // Mock Data rendering
    const facultyList = document.getElementById('faculty-list');
    const staffList = document.getElementById('staff-list');
    const guestList = document.getElementById('guest-list');

    // Create a generic profile card
    function createProfileCard(name, role, email, phone) {
        return `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-img-wrap">
                        <i class="fas fa-user" style="font-size: 2rem; color: var(--gray-400); margin: 15px 18px;"></i>
                    </div>
                    <div class="profile-info">
                        <h3 class="profile-name">${name}</h3>
                        <p class="profile-role">${role}</p>
                    </div>
                </div>
                <div class="profile-details">
                    <div><i class="fas fa-envelope"></i> ${email}</div>
                    <div><i class="fas fa-phone"></i> ${phone}</div>
                </div>
                <div class="profile-actions">
                    <button class="action-btn" title="Edit" onclick="FacultyAdmin.openEditModal(this)"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.profile-card').remove(); AdminUtils.showToast('Profile deleted'); })"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    // Populate mock data
    if (facultyList) {
        facultyList.innerHTML = 
            createProfileCard('Dr. Satyabrata Das', 'Professor & Head', 'sbdas_cse@vssut.ac.in', '+91 9437158332') +
            createProfileCard('Dr. Amiya Kumar Rath', 'Professor', 'amiya_cse@vssut.ac.in', '+91 9437340050') +
            createProfileCard('Dr. Manas Ranjan Kabat', 'Professor', 'mrkabat_cse@vssut.ac.in', '+91 9437033785');
    }

    if (staffList) {
        staffList.innerHTML = 
            createProfileCard('Mr. Rajesh Kumar', 'System Administrator', 'sysadmin@vssut.ac.in', '+91 9876543210');
    }

    if (guestList) {
        guestList.innerHTML = 
            createProfileCard('Dr. Anita Sharma', 'Guest Lecturer', 'anita_guest@vssut.ac.in', '+91 9123456789');
    }

    // Inject Modal HTML
    const modalHTML = `
    <div class="admin-modal-overlay" id="facultyModal">
        <div class="admin-modal" style="max-width: 700px;">
            <div class="admin-modal-header">
                <h3><i class="fas fa-user-edit"></i> <span id="facultyModalTitle">Add Profile</span></h3>
                <button class="admin-modal-close" onclick="AdminUtils.closeModal('facultyModal')"><i class="fas fa-times"></i></button>
            </div>
            <div class="admin-modal-body">
                <form id="facultyForm" onsubmit="event.preventDefault(); AdminUtils.showToast('Profile saved successfully!'); AdminUtils.closeModal('facultyModal');">
                    
                    <h4 style="margin-top: 0; margin-bottom: 15px; color: var(--blue-900);">Compulsory Fields</h4>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <div style="width: 120px; text-align: center;">
                            <div class="file-upload-wrapper" style="padding: 10px; height: 120px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                <input type="file" accept="image/*" onchange="
                                    if(this.files[0]) {
                                        const url = URL.createObjectURL(this.files[0]);
                                        const img = document.getElementById('facPreview');
                                        img.src = url;
                                        img.style.display = 'block';
                                    }">
                                <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera"></i></span>
                                <img id="facPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 50%;">
                            </div>
                            <small style="color: var(--gray-500); display: block; margin-top: 8px;">Profile Photo</small>
                        </div>
                        <div style="flex: 1;">
                            <div class="form-group">
                                <label>Full Name <span style="color:red;">*</span></label>
                                <input type="text" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Position / Designation <span style="color:red;">*</span></label>
                                <input type="text" class="form-control" required>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Email <span style="color:red;">*</span></label>
                            <input type="email" class="form-control" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Phone Number <span style="color:red;">*</span></label>
                            <input type="tel" class="form-control" required>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 20px;">
                        <div class="form-group" id="qualificationGroup" style="flex: 2;">
                            <label>Qualification <span style="color:red;">*</span></label>
                            <input type="text" class="form-control" placeholder="e.g. Ph.D, M.Tech">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Gender <span style="color:red;">*</span></label>
                            <select class="form-control" required>
                                <option value="" disabled selected>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <!-- Optional Fields (Collapsible) -->
                    <div id="optionalFieldsSection" class="form-section collapsed">
                        <div class="form-section-header" onclick="this.parentElement.classList.toggle('collapsed')">
                            <span>Optional Extended Fields (Faculty only)</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="form-section-body">
                            <div class="form-group"><label>Specialization</label><input type="text" class="form-control"></div>
                            <div class="form-group"><label>Experience (Years)</label><input type="number" class="form-control"></div>
                            <div class="form-group"><label>Subjects Teaching</label><input type="text" class="form-control"></div>
                            <div class="form-group"><label>Research Areas</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Research Guidance</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Awards & Honors</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Projects & Publications</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Patents</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Books / Book Chapters</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Seminars Organized</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Administrative Responsibilities</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Present Address</label><textarea class="form-control" style="min-height: 60px;"></textarea></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="AdminUtils.closeModal('facultyModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add New Button Click
    document.getElementById('btn-add-new').addEventListener('click', () => {
        FacultyAdmin.openEditModal(null);
    });

});

const FacultyAdmin = {
    openEditModal: function(editButtonContext) {
        document.getElementById('facultyForm').reset();
        document.getElementById('facPreview').style.display = 'none';
        
        // Determine active tab to conditionally show optional fields
        const isStaff = document.getElementById('tab-staff').classList.contains('active');
        
        if (isStaff) {
            document.getElementById('optionalFieldsSection').style.display = 'none';
            document.getElementById('qualificationGroup').style.display = 'none';
            document.getElementById('facultyModalTitle').innerText = editButtonContext ? 'Edit Staff Profile' : 'Add New Staff';
        } else {
            document.getElementById('optionalFieldsSection').style.display = 'block';
            document.getElementById('qualificationGroup').style.display = 'block';
            document.getElementById('facultyModalTitle').innerText = editButtonContext ? 'Edit Profile' : 'Add New Profile';
        }

        AdminUtils.openModal('facultyModal');
    }
};
