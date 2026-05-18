import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    let currentEditId = null;
    let allClasses = [];

    // Inject Modals (Student Modal + Manage Classes Modal)
    const modalsHTML = `
    <!-- Student Form Modal -->
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
                <form id="studentForm">
                    <input type="hidden" id="studentExistingPhoto">
                    
                    <div class="student-profile-header">
                        <div class="profile-large-img view-only"><i class="fas fa-user"></i></div>
                        
                        <div class="file-upload-wrapper edit-only" style="padding: 10px; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; overflow: hidden; border: 2px dashed var(--gray-300);">
                            <input type="file" id="studentPhotoInput" accept="image/*" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index: 10;">
                            <span class="file-upload-text" style="font-size: 0.8rem; z-index: 1;"><i class="fas fa-camera"></i></span>
                            <img id="studentPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; z-index: 5;">
                        </div>

                        <div class="student-profile-info view-only">
                            <h3 id="view-name">Student Name</h3>
                            <p>B.Tech Computer Science & Engineering</p>
                            <p style="font-family: monospace; margin-top: 5px; color: var(--blue-600); font-weight: 600;" id="view-reg">Reg No: </p>
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
                                        <!-- Dynamically populated -->
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1; margin: 0;">
                                    <label>Gender <span style="color:red;">*</span></label>
                                    <select class="form-control" id="edit-gender" required>
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
                            <div class="view-only" id="view-mobile"></div>
                            <input type="tel" class="form-control edit-only" id="edit-mobile" required>
                        </div>
                        <div class="info-block">
                            <label>Email Address <span class="edit-only" style="color:red;">*</span></label>
                            <div class="view-only" id="view-email"></div>
                            <input type="email" class="form-control edit-only" id="edit-email" required>
                        </div>
                    </div>

                    <h4 style="margin-top: 25px; margin-bottom: 15px; color: var(--blue-900);">Personal Details</h4>
                    <div class="info-grid">
                        <div class="info-block">
                            <label>Father's Name</label>
                            <div class="view-only" id="view-father"></div>
                            <input type="text" class="form-control edit-only" id="edit-father">
                        </div>
                        <div class="info-block">
                            <label>Mother's Name</label>
                            <div class="view-only" id="view-mother"></div>
                            <input type="text" class="form-control edit-only" id="edit-mother">
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-block" style="grid-column: span 2;">
                            <label>Present Address</label>
                            <div class="view-only" id="view-present"></div>
                            <textarea class="form-control edit-only" id="edit-present" style="min-height: 60px;"></textarea>
                        </div>
                        <div class="info-block" style="grid-column: span 2;">
                            <label>Permanent Address</label>
                            <div class="view-only" id="view-permanent"></div>
                            <textarea class="form-control edit-only" id="edit-permanent" style="min-height: 60px;"></textarea>
                        </div>
                    </div>

                    <div class="edit-only" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; border-top: 1px solid var(--gray-200); padding-top: 20px;">
                        <button type="button" class="btn btn-outline" id="btn-cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-student">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Manage Classes Modal -->
    <div class="admin-modal-overlay" id="manageClassesModal">
        <div class="admin-modal" style="max-width: 500px;">
            <div class="admin-modal-header">
                <h3><i class="fas fa-layer-group"></i> Manage Classes</h3>
                <button class="admin-modal-close" onclick="AdminUtils.closeModal('manageClassesModal')"><i class="fas fa-times"></i></button>
            </div>
            <div class="admin-modal-body">
                <form id="addClassForm" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="newClassInput" class="form-control" placeholder="e.g. 2026" required style="flex: 1;">
                    <button type="submit" class="btn btn-primary">Add Class</button>
                </form>
                <div id="classesList" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    </div>`;
    
    if (!document.getElementById('studentModal')) {
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    // Initialize Cropper for Student Modal
    const photoInput = document.getElementById('studentPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (typeof AdminUtils !== 'undefined' && AdminUtils.openCropper) {
                    AdminUtils.openCropper(file, 1, (blob) => {
                        window.croppedStudentPhotoBlob = blob;
                        const url = window.URL.createObjectURL(blob);
                        const img = document.getElementById('studentPreview');
                        img.src = url;
                        img.style.display = 'block';
                    });
                } else {
                    console.error("Cropper utility not found!");
                }
                e.target.value = ''; // Reset input
            }
        });
    }

    // Load Classes and Generate Layout
    window.loadClassesAndLayout = async () => {
        try {
            const tabsContainer = document.getElementById('dynamic-tabs-container');
            const contentContainer = document.getElementById('dynamic-content-container');
            
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select('*')
                .order('class_year', { ascending: false });

            if (classesError) throw classesError;

            allClasses = classesData || [];

            if (allClasses.length === 0) {
                tabsContainer.innerHTML = '<span style="padding: 10px; color: var(--gray-500);">No classes found. Please manage classes.</span>';
                contentContainer.innerHTML = '';
                return;
            }

            // Populate Add/Edit Form Select Dropdown
            const selectYear = document.getElementById('edit-year');
            selectYear.innerHTML = allClasses.map(c => `<option value="${c.class_year}">Class of ${c.class_year}</option>`).join('');

            // Generate Tabs
            tabsContainer.innerHTML = allClasses.map((c, index) => `
                <button class="admin-tab-btn ${index === 0 ? 'active' : ''}" id="tab-${c.class_year}">Class of ${c.class_year}</button>
            `).join('');

            // Generate Content Areas
            contentContainer.innerHTML = allClasses.map((c, index) => `
                <div class="admin-tab-content ${index === 0 ? 'active' : ''}" id="content-${c.class_year}">
                    <div class="table-responsive">
                        <table class="student-table" id="table-${c.class_year}">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Registration No.</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="6" style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('');

            // Setup Tabs Logic
            const tabBtns = allClasses.map(c => document.getElementById(`tab-${c.class_year}`));
            const tabContents = allClasses.map(c => document.getElementById(`content-${c.class_year}`));
            if (typeof AdminUtils !== 'undefined' && AdminUtils.setupTabs) {
                AdminUtils.setupTabs(tabBtns, tabContents);
            }

            // After layout is built, load actual student data
            window.loadStudents();

        } catch (err) {
            console.error("Error loading layout:", err);
            AdminUtils.showToast("Failed to load classes", "error");
        }
    };

    // Load Students Function
    window.loadStudents = async () => {
        try {
            const { data: students, error } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Clear tables
            allClasses.forEach(c => {
                const tbody = document.querySelector(`#table-${c.class_year} tbody`);
                if(tbody) tbody.innerHTML = '';
            });

            // Attach data globally for editing
            window.studentDataMap = {};

            if (students && students.length > 0) {
                students.forEach(student => {
                    window.studentDataMap[student.id] = student;
                    
                    const tbody = document.querySelector(`#table-${student.class_year} tbody`);
                    if (!tbody) return;

                    const photoHtml = student.photo_url 
                        ? `<img src="${student.photo_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` 
                        : `<div class="student-photo"><i class="fas fa-user"></i></div>`;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="student-photo-td">${photoHtml}</td>
                        <td style="font-family: monospace; font-weight: 600;">${student.reg_no}</td>
                        <td style="font-weight: 600; color: var(--blue-900);">${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.phone}</td>
                        <td>
                            <div class="row-actions">
                                <button class="action-btn" title="View/Edit Profile" onclick="StudentAdmin.openProfileModal(${student.id})"><i class="fas fa-expand-arrows-alt"></i></button>
                                <button class="action-btn delete" title="Delete" onclick="StudentAdmin.deleteStudent(${student.id}, '${student.photo_url || ''}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Handle empty states
            allClasses.forEach(c => {
                const tbody = document.querySelector(`#table-${c.class_year} tbody`);
                if (tbody && tbody.children.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--gray-500); padding: 20px;">No students found for Class of ${c.class_year}.</td></tr>`;
                }
            });

        } catch (err) {
            console.error("Error loading students:", err);
            AdminUtils.showToast("Failed to load students", "error");
        }
    };

    // Manage Classes Functionality
    document.getElementById('btn-manage-classes').addEventListener('click', () => {
        populateManageClassesList();
        AdminUtils.openModal('manageClassesModal');
    });

    document.getElementById('addClassForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('newClassInput');
        const classYear = input.value.trim();
        if (!classYear) return;

        const btn = e.target.querySelector('button');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
            const { error } = await supabase
                .from('classes')
                .insert([{ class_year: classYear }]);
            
            if (error) {
                if (error.code === '23505') throw new Error("This class year already exists.");
                throw error;
            }

            input.value = '';
            AdminUtils.showToast("Class added successfully!");
            await window.loadClassesAndLayout(); // Refresh everything
            populateManageClassesList();

        } catch (err) {
            alert(err.message);
        } finally {
            btn.innerHTML = 'Add Class';
            btn.disabled = false;
        }
    });

    window.deleteClass = async (id, classYear) => {
        AdminUtils.confirmDelete(async () => {
            try {
                // Optional: Check if students exist for this class
                const { count, error: countError } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_year', classYear);
                
                if (countError) throw countError;
                if (count > 0) {
                    alert(`Cannot delete Class of ${classYear} because it contains ${count} students. Please delete or reassign the students first.`);
                    return;
                }

                const { error } = await supabase
                    .from('classes')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                AdminUtils.showToast("Class deleted successfully!");
                await window.loadClassesAndLayout();
                populateManageClassesList();
                
            } catch (err) {
                console.error(err);
                alert("Failed to delete class.");
            }
        }, "Are you sure you want to delete this class?");
    };

    function populateManageClassesList() {
        const list = document.getElementById('classesList');
        if (allClasses.length === 0) {
            list.innerHTML = '<div style="color: var(--gray-500); text-align: center;">No classes added yet.</div>';
            return;
        }
        
        list.innerHTML = allClasses.map(c => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px;">
                <span style="font-weight: 600; color: var(--blue-900);">Class of ${c.class_year}</span>
                <button class="btn btn-outline" style="color: var(--red-500); border-color: var(--red-200); padding: 5px 10px;" onclick="deleteClass(${c.id}, '${c.class_year}')"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }

    // Form Submission (Add/Edit Student)
    document.getElementById('studentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('btn-save-student');
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        try {
            let photoUrl = document.getElementById('studentExistingPhoto').value || null;

            // Handle Photo Upload
            if (window.croppedStudentPhotoBlob) {
                const fileExt = 'png';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('student_photos')
                    .upload(filePath, window.croppedStudentPhotoBlob, {
                        contentType: 'image/png',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('student_photos')
                    .getPublicUrl(filePath);

                photoUrl = publicUrl;
            }

            const studentData = {
                name: document.getElementById('edit-name').value,
                reg_no: document.getElementById('edit-reg').value,
                class_year: document.getElementById('edit-year').value,
                gender: document.getElementById('edit-gender').value,
                phone: document.getElementById('edit-mobile').value,
                email: document.getElementById('edit-email').value,
                father_name: document.getElementById('edit-father').value || null,
                mother_name: document.getElementById('edit-mother').value || null,
                present_address: document.getElementById('edit-present').value || null,
                permanent_address: document.getElementById('edit-permanent').value || null,
                photo_url: photoUrl
            };

            if (currentEditId) {
                const { error } = await supabase
                    .from('students')
                    .update(studentData)
                    .eq('id', currentEditId);
                if (error) throw error;
                AdminUtils.showToast("Student updated successfully!");
            } else {
                const { error } = await supabase
                    .from('students')
                    .insert([studentData]);
                if (error) throw error;
                AdminUtils.showToast("Student added successfully!");
            }

            window.StudentAdmin.toggleEditMode(false);
            AdminUtils.closeModal('studentModal');
            window.loadStudents();

        } catch (err) {
            console.error("Error saving student:", err);
            alert("Error saving: " + err.message);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });

    // Add Cancel Button Logic
    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        if (!currentEditId) {
            AdminUtils.closeModal('studentModal');
        } else {
            window.StudentAdmin.toggleEditMode(false);
        }
    });

    // Add New Student Button Click
    const btnAddStudent = document.getElementById('btn-add-student');
    if (btnAddStudent) {
        btnAddStudent.addEventListener('click', () => {
            if (allClasses.length === 0) {
                alert("Please add at least one Class first before adding a student.");
                return;
            }
            window.StudentAdmin.openAddModal();
        });
    }

    // Attach StudentAdmin globally
    window.StudentAdmin = {
        toggleEditMode: function(isEdit) {
            const modalBody = document.getElementById('studentModalBody');
            const modal = document.getElementById('studentModal');
            
            if (isEdit) {
                modalBody.classList.remove('view-mode');
                modalBody.classList.add('edit-mode');
                modal.querySelector('.view-only').style.display = 'none';
                modal.querySelector('.edit-only').style.display = 'flex';
            } else {
                modalBody.classList.remove('edit-mode');
                modalBody.classList.add('view-mode');
                modal.querySelector('.view-only').style.display = 'flex';
                modal.querySelector('.edit-only').style.display = 'none';
            }
        },

        openProfileModal: function(id) {
            currentEditId = id;
            document.getElementById('studentModalTitle').innerText = 'Edit Student Profile';
            window.croppedStudentPhotoBlob = null;
            
            const student = window.studentDataMap[id];
            if (!student) return;
            
            // Populate View Mode
            document.getElementById('view-name').innerText = student.name;
            document.getElementById('view-reg').innerText = 'Reg No: ' + student.reg_no;
            document.getElementById('view-mobile').innerText = student.phone;
            document.getElementById('view-email').innerText = student.email;
            document.getElementById('view-father').innerText = student.father_name || 'N/A';
            document.getElementById('view-mother').innerText = student.mother_name || 'N/A';
            document.getElementById('view-present').innerText = student.present_address || 'N/A';
            document.getElementById('view-permanent').innerText = student.permanent_address || 'N/A';

            // Populate View Mode Photo
            const viewPhotoContainer = document.querySelector('.profile-large-img.view-only');
            if (student.photo_url) {
                viewPhotoContainer.innerHTML = `<img src="${student.photo_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else {
                viewPhotoContainer.innerHTML = `<i class="fas fa-user"></i>`;
            }

            // Populate Edit Mode
            document.getElementById('edit-name').value = student.name || '';
            document.getElementById('edit-reg').value = student.reg_no || '';
            document.getElementById('edit-year').value = student.class_year || allClasses[0]?.class_year || '';
            document.getElementById('edit-gender').value = student.gender || '';
            document.getElementById('edit-mobile').value = student.phone || '';
            document.getElementById('edit-email').value = student.email || '';
            document.getElementById('edit-father').value = student.father_name || '';
            document.getElementById('edit-mother').value = student.mother_name || '';
            document.getElementById('edit-present').value = student.present_address || '';
            document.getElementById('edit-permanent').value = student.permanent_address || '';
            document.getElementById('studentExistingPhoto').value = student.photo_url || '';
            
            const previewImg = document.getElementById('studentPreview');
            if (student.photo_url) {
                previewImg.src = student.photo_url;
                previewImg.style.display = 'block';
            } else {
                previewImg.style.display = 'none';
                previewImg.src = '';
            }

            this.toggleEditMode(false);
            AdminUtils.openModal('studentModal');
        },

        openAddModal: function() {
            currentEditId = null;
            document.getElementById('studentModalTitle').innerText = 'Add New Student';
            document.getElementById('studentForm').reset();
            document.getElementById('studentPreview').style.display = 'none';
            document.getElementById('studentExistingPhoto').value = '';
            window.croppedStudentPhotoBlob = null;
            
            // Default to first available class if exists
            if(allClasses.length > 0) {
                document.getElementById('edit-year').value = allClasses[0].class_year;
            }

            this.toggleEditMode(true);
            AdminUtils.openModal('studentModal');
        },

        deleteStudent: function(id, photoUrl) {
            AdminUtils.confirmDelete(async () => {
                try {
                    if (photoUrl && photoUrl !== 'null') {
                        const urlObj = new URL(photoUrl);
                        const pathParts = urlObj.pathname.split('/');
                        const fileName = pathParts[pathParts.length - 1];
                        if (fileName) {
                            await supabase.storage.from('student_photos').remove([fileName]);
                        }
                    }

                    const { error } = await supabase
                        .from('students')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    AdminUtils.showToast("Student deleted successfully!");
                    window.loadStudents();
                } catch (err) {
                    console.error("Error deleting:", err);
                    alert("Failed to delete: " + err.message);
                }
            });
        }
    };

    // Initial Load Sequence
    window.loadClassesAndLayout();
});
