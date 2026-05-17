// student_admin.js - Logic for Student Directory Management

document.addEventListener('DOMContentLoaded', () => {
    
    // Setup Page Tabs
    AdminUtils.setupTabs(
        [document.getElementById('tab-2025'), document.getElementById('tab-2024'), document.getElementById('tab-2023')],
        [document.getElementById('content-2025'), document.getElementById('content-2024'), document.getElementById('content-2023')]
    );

    // Create a generic table row
    function createStudentRow(reg, name, email, phone) {
        return `
            <tr>
                <td class="student-photo-td">
                    <div class="student-photo"><i class="fas fa-user"></i></div>
                </td>
                <td style="font-family: monospace; font-weight: 600;">${reg}</td>
                <td style="font-weight: 600; color: var(--blue-900);">${name}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>
                    <div class="row-actions">
                        <button class="action-btn" title="View/Edit Profile" onclick="StudentAdmin.openProfileModal(this)"><i class="fas fa-expand-arrows-alt"></i></button>
                        <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('tr').remove(); AdminUtils.showToast('Student deleted'); })"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Populate mock data
    const tbody2025 = document.querySelector('#table-2025 tbody');
    if (tbody2025) {
        tbody2025.innerHTML = 
            createStudentRow('2102040011', 'Aarav Sharma', 'aarav21@vssut.ac.in', '+91 9876543210') +
            createStudentRow('2102040015', 'Priya Patel', 'priya21@vssut.ac.in', '+91 8765432109') +
            createStudentRow('2102040028', 'Rohan Das', 'rohan21@vssut.ac.in', '+91 7654321098');
    }

    // Inject Modal HTML (Handles both View and Edit modes via CSS classes)
    const modalHTML = `
    <div class="admin-modal-overlay" id="studentModal">
        <div class="admin-modal" style="max-width: 800px;">
            
            <div class="admin-modal-header view-only">
                <h3><i class="fas fa-user-graduate"></i> Student Profile</h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="StudentAdmin.toggleEditMode(true)"><i class="fas fa-pen"></i> Edit Profile</button>
                    <button class="admin-modal-close" onclick="AdminUtils.closeModal('studentModal')"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <div class="admin-modal-header edit-only">
                <h3><i class="fas fa-user-edit"></i> <span id="studentModalTitle">Edit Student Profile</span></h3>
                <button class="admin-modal-close" onclick="AdminUtils.closeModal('studentModal')"><i class="fas fa-times"></i></button>
            </div>

            <div class="admin-modal-body" id="studentModalBody">
                <form id="studentForm" onsubmit="event.preventDefault(); AdminUtils.showToast('Profile saved successfully!'); StudentAdmin.toggleEditMode(false);">
                    
                    <div class="student-profile-header">
                        <div class="profile-large-img view-only"><i class="fas fa-user"></i></div>
                        <div class="file-upload-wrapper edit-only" style="padding: 10px; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <input type="file" accept="image/*" onchange="
                                if(this.files[0]) {
                                    const url = URL.createObjectURL(this.files[0]);
                                    const img = document.getElementById('studentPreview');
                                    img.src = url;
                                    img.style.display = 'block';
                                }">
                            <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera"></i></span>
                            <img id="studentPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 50%;">
                        </div>

                        <div class="student-profile-info view-only">
                            <h3 id="view-name">Aarav Sharma</h3>
                            <p>B.Tech Computer Science & Engineering</p>
                            <p style="font-family: monospace; margin-top: 5px; color: var(--blue-600); font-weight: 600;" id="view-reg">Reg No: 2102040011</p>
                        </div>
                        
                        <div class="student-profile-info edit-only" style="flex: 1;">
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Full Name <span style="color:red;">*</span></label>
                                <input type="text" class="form-control" id="edit-name" required>
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div class="form-group" style="flex: 1; margin: 0;">
                                    <label>Registration Number <span style="color:red;">*</span></label>
                                    <input type="text" class="form-control" id="edit-reg" required>
                                </div>
                                <div class="form-group" style="flex: 1; margin: 0;">
                                    <label>Assigned Class Year <span style="color:red;">*</span></label>
                                    <select class="form-control" id="edit-year" required>
                                        <option value="2025">Class of 2025</option>
                                        <option value="2024">Class of 2024</option>
                                        <option value="2023">Class of 2023</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1; margin: 0;">
                                    <label>Gender <span style="color:red;">*</span></label>
                                    <select class="form-control" required>
                                        <option value="" disabled selected>Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 style="margin-top: 0; margin-bottom: 15px; color: var(--blue-900);">Contact Details</h4>
                    <div class="info-grid">
                        <div class="info-block">
                            <label>Mobile Number <span class="edit-only" style="color:red;">*</span></label>
                            <div class="view-only" id="view-mobile">+91 9876543210</div>
                            <input type="tel" class="form-control edit-only" id="edit-mobile" required>
                        </div>
                        <div class="info-block">
                            <label>Email Address <span class="edit-only" style="color:red;">*</span></label>
                            <div class="view-only" id="view-email">aarav21@vssut.ac.in</div>
                            <input type="email" class="form-control edit-only" id="edit-email" required>
                        </div>
                    </div>

                    <h4 style="margin-top: 25px; margin-bottom: 15px; color: var(--blue-900);">Personal Details</h4>
                    <div class="info-grid">
                        <div class="info-block">
                            <label>Father's Name <span class="edit-only" style="color:red;">*</span></label>
                            <div class="view-only" id="view-father">Ramesh Sharma</div>
                            <input type="text" class="form-control edit-only" id="edit-father" required>
                        </div>
                        <div class="info-block">
                            <label>Mother's Name <span class="edit-only" style="color:red;">*</span></label>
                            <div class="view-only" id="view-mother">Sunita Sharma</div>
                            <input type="text" class="form-control edit-only" id="edit-mother" required>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-block" style="grid-column: span 2;">
                            <label>Present Address</label>
                            <div class="view-only" id="view-present">Hostel Anuradha, VSSUT Campus, Burla</div>
                            <textarea class="form-control edit-only" id="edit-present" style="min-height: 60px;"></textarea>
                        </div>
                        <div class="info-block" style="grid-column: span 2;">
                            <label>Permanent Address</label>
                            <div class="view-only" id="view-permanent">123 Market Street, Bhubaneswar, Odisha</div>
                            <textarea class="form-control edit-only" id="edit-permanent" style="min-height: 60px;"></textarea>
                        </div>
                    </div>

                    <div class="edit-only" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; border-top: 1px solid var(--gray-200); padding-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="StudentAdmin.toggleEditMode(false)">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add New Button Click
    document.getElementById('btn-add-student').addEventListener('click', () => {
        StudentAdmin.openAddModal();
    });

});

const StudentAdmin = {
    // Switch modal between view mode and edit mode
    toggleEditMode: function(isEdit) {
        const modalBody = document.getElementById('studentModalBody');
        const modal = document.getElementById('studentModal');
        
        if (isEdit) {
            modalBody.classList.remove('view-mode');
            modalBody.classList.add('edit-mode');
            modal.querySelector('.view-only').style.display = 'none'; // header
            modal.querySelector('.edit-only').style.display = 'flex'; // header
        } else {
            modalBody.classList.remove('edit-mode');
            modalBody.classList.add('view-mode');
            modal.querySelector('.view-only').style.display = 'flex'; // header
            modal.querySelector('.edit-only').style.display = 'none'; // header
        }
    },

    openProfileModal: function(btnContext) {
        document.getElementById('studentModalTitle').innerText = 'Edit Student Profile';
        
        // Mock data population based on row clicked
        const row = btnContext.closest('tr');
        const reg = row.children[1].innerText;
        const name = row.children[2].innerText;
        const email = row.children[3].innerText;
        const mobile = row.children[4].innerText;
        
        document.getElementById('view-name').innerText = name;
        document.getElementById('view-reg').innerText = 'Reg No: ' + reg;
        document.getElementById('view-mobile').innerText = mobile;
        document.getElementById('view-email').innerText = email;
        
        document.getElementById('edit-name').value = name;
        document.getElementById('edit-reg').value = reg;
        document.getElementById('edit-mobile').value = mobile;
        document.getElementById('edit-email').value = email;

        // Default to view mode when opening an existing profile
        this.toggleEditMode(false);
        AdminUtils.openModal('studentModal');
    },

    openAddModal: function() {
        document.getElementById('studentModalTitle').innerText = 'Add New Student';
        document.getElementById('studentForm').reset();
        document.getElementById('studentPreview').style.display = 'none';
        
        // Default to edit mode when adding a new profile
        this.toggleEditMode(true);
        
        // Hide the cancel button since there is no view state to return to
        document.querySelector('.edit-only button.btn-outline').onclick = () => {
            AdminUtils.closeModal('studentModal');
        };

        AdminUtils.openModal('studentModal');
    }
};
