import { supabase } from './supabase-config.js';

let currentEditId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Setup Page Tabs
    AdminUtils.setupTabs(
        [document.getElementById('tab-fac'), document.getElementById('tab-staff'), document.getElementById('tab-guest')],
        [document.getElementById('content-fac'), document.getElementById('content-staff'), document.getElementById('content-guest')]
    );

    // Initial load
    loadProfiles();

    // Re-load on tab switch to ensure we show the correct data (or just rely on the CSS hiding)
    // Actually, we can load all 3 categories at once.
    
    // Inject Modal HTML
    // Inject Modal HTML
    const modalHTML = `
    <div class="admin-modal-overlay" id="facultyModal">
        <div class="admin-modal" style="max-width: 700px;">
            <div class="admin-modal-header">
                <h3><i class="fas fa-user-edit"></i> <span id="facultyModalTitle">Add Profile</span></h3>
                <button class="admin-modal-close" onclick="AdminUtils.closeModal('facultyModal')"><i class="fas fa-times"></i></button>
            </div>
            <div class="admin-modal-body">
                <form id="facultyForm">
                    
                    <h4 style="margin-top: 0; margin-bottom: 15px; color: var(--blue-900);">Compulsory Fields</h4>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <div style="width: 120px; text-align: center;">
                            <div class="file-upload-wrapper" style="padding: 10px; height: 120px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                <input type="file" id="facPhotoInput" accept="image/*" onchange="
                                    if(this.files[0]) {
                                        AdminUtils.openCropper(this.files[0], 1, (croppedBlob) => {
                                            window.croppedFacultyPhotoBlob = croppedBlob;
                                            const url = window.URL.createObjectURL(croppedBlob);
                                            const img = document.getElementById('facPreview');
                                            img.src = url;
                                            img.style.display = 'block';
                                            const removeBtn = document.getElementById('btn-remove-photo');
                                            if (removeBtn) removeBtn.style.display = 'inline-block';
                                        });
                                    }">
                                <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera"></i></span>
                                <img id="facPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 50%; pointer-events: none;">
                            </div>
                            <small style="color: var(--gray-500); display: block; margin-top: 8px;">Profile Photo</small>
                            <button type="button" class="btn btn-outline" id="btn-remove-photo" style="padding: 4px 10px; font-size: 0.75rem; margin-top: 8px; display: none; font-weight: 500; border-color: var(--gray-300);" onclick="FacultyAdmin.removeModalPhoto()">
                                <i class="fas fa-trash-alt" style="color: var(--red-500);"></i> Remove
                            </button>
                            <input type="hidden" id="facExistingPhoto">
                        </div>
                        <div style="flex: 1;">
                            <div class="form-group">
                                <label>Full Name <span style="color:red;">*</span></label>
                                <input type="text" id="facName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Position / Designation <span style="color:red;">*</span></label>
                                <input type="text" id="facDesignation" class="form-control" required>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Email <span style="color:red;">*</span></label>
                            <input type="email" id="facEmail" class="form-control" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Phone Number <span style="color:red;">*</span></label>
                            <input type="tel" id="facPhone" class="form-control" required>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 20px;">
                        <div class="form-group" id="qualificationGroup" style="flex: 1;">
                            <label>Qualification <span style="color:red;">*</span></label>
                            <textarea id="facQualification" class="form-control" placeholder="e.g. Ph.D, M.Tech" style="min-height: 38px; height: 38px; resize: none;"></textarea>
                        </div>
                    </div>

                    <!-- Optional Fields (Collapsible) -->
                    <div id="optionalFieldsSection" class="form-section collapsed">
                        <div class="form-section-header" onclick="this.parentElement.classList.toggle('collapsed')">
                            <span>Optional Extended Fields (Faculty only)</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="form-section-body">
                            <div class="form-group" style="margin-bottom: 20px; background: var(--blue-50); padding: 15px; border-radius: 8px; border: 1px solid var(--blue-200);">
                                <label style="display: block; color: var(--blue-900); font-weight: 700; margin-bottom: 8px;">Special Role</label>
                                <select id="facSpecialRole" class="form-control">
                                    <option value="">None</option>
                                    <option value="Head of Department">Head of Department</option>
                                    <option value="Head of Programme">Head of Programme</option>
                                    <option value="Faculty Advisor">Faculty Advisor</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Specialization</label>
                                <div class="tag-input-wrapper" style="border: 1px solid var(--gray-300); border-radius: 6px; padding: 6px; display: flex; flex-wrap: wrap; gap: 6px; background: var(--white);">
                                    <div id="specialization-tags" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                                    <input type="text" id="specialization-input" placeholder="Type and press Enter" style="border: none; outline: none; flex: 1; min-width: 150px; font-size: 0.9rem;">
                                </div>
                            </div>
                            
                            <div class="form-group"><label>Experience (Years)</label><input type="number" id="facExperience" class="form-control"></div>
                            
                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Subjects Teaching</label>
                                <div id="subjects-group-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; gap: 10px;">
                                        <select id="subject-level-select" class="form-control" style="flex: 1;">
                                            <option value="Graduate Level">Graduate Level</option>
                                            <option value="Post Graduate Level">Post Graduate Level</option>
                                        </select>
                                        <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem;" onclick="addSubjectsGroup()">Add Group</button>
                                    </div>
                                    <textarea id="subject-list-textarea" class="form-control" placeholder="Enter subjects (one per line)" style="min-height: 60px; font-size: 0.9rem;"></textarea>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Research Areas</label>
                                <div class="tag-input-wrapper" style="border: 1px solid var(--gray-300); border-radius: 6px; padding: 6px; display: flex; flex-wrap: wrap; gap: 6px; background: var(--white);">
                                    <div id="research-areas-tags" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                                    <input type="text" id="research-areas-input" placeholder="Type and press Enter" style="border: none; outline: none; flex: 1; min-width: 150px; font-size: 0.9rem;">
                                </div>
                            </div>

                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Research Guidance</label>
                                <div id="guidance-group-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; gap: 10px;">
                                        <select id="guidance-degree-select" class="form-control" style="width: 120px;">
                                            <option value="Ph.D">Ph.D</option>
                                            <option value="M.Tech">M.Tech</option>
                                            <option value="MCA">MCA</option>
                                        </select>
                                        <input type="text" id="guidance-summary-input" class="form-control" placeholder="Summary (e.g. 11 Awarded, 05 ongoing)" style="flex: 1;">
                                        <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem;" onclick="addGuidanceGroup()">Add</button>
                                    </div>
                                    <textarea id="guidance-candidates-textarea" class="form-control" placeholder="Enter candidates (one per line)" style="min-height: 60px; font-size: 0.9rem;"></textarea>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Awards & Honors</label>
                                <div class="tag-input-wrapper" style="border: 1px solid var(--gray-300); border-radius: 6px; padding: 6px; display: flex; flex-wrap: wrap; gap: 6px; background: var(--white);">
                                    <div id="awards-tags" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                                    <input type="text" id="awards-input" placeholder="Type and press Enter" style="border: none; outline: none; flex: 1; min-width: 150px; font-size: 0.9rem;">
                                </div>
                            </div>

                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Publications</label>
                                <div id="publications-repeater-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; gap: 10px; align-items: flex-start;">
                                    <select id="pub-type-select" class="form-control" style="width: 130px;">
                                        <option value="International">International</option>
                                        <option value="National">National</option>
                                        <option value="Conference">Conference</option>
                                    </select>
                                    <textarea id="pub-citation-textarea" class="form-control" placeholder="Enter publication citation" style="flex: 1; min-height: 48px; font-size: 0.9rem;"></textarea>
                                    <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem; height: 38px;" onclick="addPublicationEntry()">Add</button>
                                </div>
                            </div>

                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Patents</label>
                                <div id="patents-repeater-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; gap: 10px; align-items: flex-start;">
                                    <textarea id="patent-desc-textarea" class="form-control" placeholder="Enter patent description" style="flex: 1; min-height: 48px; font-size: 0.9rem;"></textarea>
                                    <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem; height: 38px;" onclick="addPatentEntry()">Add</button>
                                </div>
                            </div>

                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Books / Book Chapters</label>
                                <div id="books-repeater-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; gap: 10px; align-items: flex-start;">
                                    <textarea id="book-citation-textarea" class="form-control" placeholder="Enter book citation" style="flex: 1; min-height: 48px; font-size: 0.9rem;"></textarea>
                                    <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem; height: 38px;" onclick="addBookEntry()">Add</button>
                                </div>
                            </div>

                            <div class="form-group" style="border: 1px solid var(--gray-200); padding: 12px; border-radius: 8px; background: var(--gray-50);">
                                <label style="font-weight: 700; margin-bottom: 8px; display: block;">Seminars Organized</label>
                                <div id="seminars-repeater-list" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
                                <div style="border-top: 1px dashed var(--gray-300); padding-top: 10px; display: flex; gap: 10px; align-items: flex-start;">
                                    <textarea id="seminar-desc-textarea" class="form-control" placeholder="Enter seminar description" style="flex: 1; min-height: 48px; font-size: 0.9rem;"></textarea>
                                    <button type="button" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.85rem; height: 38px;" onclick="addSeminarEntry()">Add</button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Administrative Responsibilities</label>
                                <div class="tag-input-wrapper" style="border: 1px solid var(--gray-300); border-radius: 6px; padding: 6px; display: flex; flex-wrap: wrap; gap: 6px; background: var(--white);">
                                    <div id="admin-res-tags" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                                    <input type="text" id="admin-res-input" placeholder="Type and press Enter" style="border: none; outline: none; flex: 1; min-width: 150px; font-size: 0.9rem;">
                                </div>
                            </div>

                            <div class="form-group"><label>Present Address</label><textarea id="facAddress" class="form-control" style="min-height: 60px;"></textarea></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="AdminUtils.closeModal('facultyModal')">Cancel</button>
                        <button type="submit" id="facSubmitBtn" class="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Form Submit Handler
    document.getElementById('facultyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('facSubmitBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        try {
            // Determine active category based on active tab
            let category = 'faculty';
            if (document.getElementById('tab-staff').classList.contains('active')) category = 'staff';
            if (document.getElementById('tab-guest').classList.contains('active')) category = 'guest';

            const photoInput = document.getElementById('facPhotoInput');
            let photoUrl = document.getElementById('facExistingPhoto').value;

            // Handle Photo Upload
            if (window.croppedFacultyPhotoBlob) {
                const fileExt = 'png'; // Cropper usually outputs PNG
                const fileName = `${category}-${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('faculty_photos')
                    .upload(fileName, window.croppedFacultyPhotoBlob);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('faculty_photos')
                    .getPublicUrl(fileName);

                photoUrl = publicUrlData.publicUrl;
            }

            const profileData = {
                category: category,
                name: document.getElementById('facName').value,
                designation: document.getElementById('facDesignation').value,
                qualification: document.getElementById('facQualification').value,
                photo_url: photoUrl,
                special_role: document.getElementById('facSpecialRole').value,
                experience: document.getElementById('facExperience').value || '',
                contact: {
                    email: document.getElementById('facEmail').value,
                    phone: document.getElementById('facPhone').value,
                    address: document.getElementById('facAddress').value,
                },
                specialization: window.currentFormArrays.specialization,
                research_areas: window.currentFormArrays.research_areas,
                awards: window.currentFormArrays.awards,
                admin_responsibilities: window.currentFormArrays.admin_responsibilities,
                subjects_taught: window.currentFormArrays.subjects_taught,
                research_guidance: window.currentFormArrays.research_guidance,
                publications: window.currentFormArrays.publications,
                books: window.currentFormArrays.books,
                patents: window.currentFormArrays.patents,
                seminars: window.currentFormArrays.seminars,
            };

            // If this is set as HOD, unset HOD for everyone else
            if (profileData.special_role === 'Head of Department') {
                await supabase.from('faculty').update({ special_role: '' }).eq('special_role', 'Head of Department').neq('id', currentEditId || -1);
            }

            if (currentEditId) {
                const { error } = await supabase
                    .from('faculty')
                    .update(profileData)
                    .eq('id', currentEditId);
                if (error) throw error;
                AdminUtils.showToast('Profile updated successfully!');
            } else {
                const { error } = await supabase
                    .from('faculty')
                    .insert([profileData]);
                if (error) throw error;
                AdminUtils.showToast('Profile created successfully!');
            }

            AdminUtils.closeModal('facultyModal');
            window.croppedFacultyPhotoBlob = null; // Clear it after success
            loadProfiles();

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Add New Button Click
    document.getElementById('btn-add-new').addEventListener('click', () => {
        window.FacultyAdmin.openEditModal(null);
    });

});

async function loadProfiles() {
    try {
        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        const facultyList = document.getElementById('faculty-list');
        const staffList = document.getElementById('staff-list');
        const guestList = document.getElementById('guest-list');

        facultyList.innerHTML = '';
        staffList.innerHTML = '';
        guestList.innerHTML = '';

        data.forEach(profile => {
            const card = createProfileCard(profile);
            if (profile.category === 'faculty') facultyList.innerHTML += card;
            else if (profile.category === 'staff') staffList.innerHTML += card;
            else if (profile.category === 'guest') guestList.innerHTML += card;
        });

        if (facultyList.innerHTML === '') facultyList.innerHTML = '<div class="empty-state">No faculty profiles found.</div>';
        if (staffList.innerHTML === '') staffList.innerHTML = '<div class="empty-state">No staff profiles found.</div>';
        if (guestList.innerHTML === '') guestList.innerHTML = '<div class="empty-state">No guest lecturer profiles found.</div>';

        // Attach data globally for editing
        window.facultyDataMap = window.facultyDataMap || {};
        data.forEach(p => window.facultyDataMap[p.id] = p);

    } catch (error) {
        console.error('Error loading profiles:', error);
        document.getElementById('faculty-list').innerHTML = '<div class="empty-state">Error loading data.</div>';
    }
}

function createProfileCard(profile) {
    const photoHtml = profile.photo_url 
        ? `<img src="${profile.photo_url}" id="avatar-img-${profile.id}" style="width:100%; height:100%; object-fit:cover;">` 
        : `<i class="fas fa-user" id="avatar-placeholder-${profile.id}" style="font-size: 2rem; color: var(--gray-400); margin: 15px 18px;"></i>`;

    const displayRole = profile.category === 'guest' 
        ? (profile.qualification || profile.designation || '') 
        : (profile.designation || '');

    return `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-img-wrap" id="avatar-wrap-${profile.id}">
                    ${photoHtml}
                    <div class="avatar-hover-overlay" onclick="document.getElementById('avatarInput-${profile.id}').click(); event.stopPropagation();" title="Change Avatar">
                        <i class="fas fa-camera"></i>
                    </div>
                    <input type="file" id="avatarInput-${profile.id}" accept="image/*" style="display:none;" onchange="FacultyAdmin.directAvatarChange('${profile.id}', this)">
                </div>
                <div class="profile-info">
                    <h3 class="profile-name">${profile.name} ${profile.special_role ? `<span style="color:#f59e0b; font-size:0.8rem; margin-left:5px;"><i class="fas fa-star"></i> ${profile.special_role}</span>` : ''}</h3>
                    <p class="profile-role">${displayRole}</p>
                </div>
            </div>
            <div class="profile-details">
                <div><i class="fas fa-envelope"></i> ${profile.contact?.email || 'N/A'}</div>
                <div><i class="fas fa-phone"></i> ${profile.contact?.phone || 'N/A'}</div>
            </div>
            <div class="profile-actions">
                <button class="action-btn" title="Edit" onclick="FacultyAdmin.openEditModal('${profile.id}')"><i class="fas fa-pen"></i></button>
                <button class="action-btn delete" title="Delete" onclick="FacultyAdmin.deleteProfile('${profile.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}

// Export to window for inline onclicks
window.FacultyAdmin = {
    openEditModal: function(id) {
        currentEditId = id;
        document.getElementById('facultyForm').reset();
        document.getElementById('facPreview').style.display = 'none';
        document.getElementById('facPhotoInput').value = '';
        document.getElementById('facExistingPhoto').value = '';
        window.croppedFacultyPhotoBlob = null; // Clear old blobs on open
        const removeBtn = document.getElementById('btn-remove-photo');
        if (removeBtn) removeBtn.style.display = 'none';
        
        // Reset currentFormArrays
        window.currentFormArrays = {
            specialization: [],
            research_areas: [],
            awards: [],
            admin_responsibilities: [],
            subjects_taught: [],
            research_guidance: [],
            publications: [],
            books: [],
            patents: [],
            seminars: []
        };
        
        // Determine active tab to conditionally show optional fields
        const isStaff = document.getElementById('tab-staff').classList.contains('active');
        
        if (isStaff) {
            document.getElementById('optionalFieldsSection').style.display = 'none';
            document.getElementById('qualificationGroup').style.display = 'none';
            document.getElementById('facQualification').removeAttribute('required');
            document.getElementById('facultyModalTitle').innerText = id ? 'Edit Staff Profile' : 'Add New Staff';
        } else {
            document.getElementById('optionalFieldsSection').style.display = 'block';
            document.getElementById('qualificationGroup').style.display = 'block';
            document.getElementById('facQualification').setAttribute('required', 'true');
            document.getElementById('facultyModalTitle').innerText = id ? 'Edit Profile' : 'Add New Profile';
        }

        if (id && window.facultyDataMap && window.facultyDataMap[id]) {
            const profile = window.facultyDataMap[id];
            
            let modalDesignation = profile.designation || '';
            let modalQualification = profile.qualification || '';

            // Self-correct guest lecturers who stored qualification in designation field
            if (profile.category === 'guest') {
                if (!modalQualification && modalDesignation) {
                    const lowerDes = modalDesignation.toLowerCase();
                    if (!lowerDes.includes('guest') && !lowerDes.includes('lecturer') && !lowerDes.includes('faculty')) {
                        modalQualification = modalDesignation;
                        modalDesignation = 'Guest Lecturer';
                    }
                }
            }

            document.getElementById('facName').value = profile.name || '';
            document.getElementById('facDesignation').value = modalDesignation;
            document.getElementById('facEmail').value = profile.contact?.email || '';
            document.getElementById('facPhone').value = profile.contact?.phone || '';
            document.getElementById('facQualification').value = modalQualification;
            document.getElementById('facSpecialRole').value = profile.special_role || '';
            document.getElementById('facExperience').value = profile.experience || '';
            document.getElementById('facAddress').value = profile.contact?.address || '';

            // Handle optional array fields
            window.currentFormArrays.specialization = Array.isArray(profile.specialization) ? [...profile.specialization] : [];
            window.currentFormArrays.research_areas = Array.isArray(profile.research_areas) ? [...profile.research_areas] : [];
            window.currentFormArrays.awards = Array.isArray(profile.awards) ? [...profile.awards] : [];
            window.currentFormArrays.admin_responsibilities = Array.isArray(profile.admin_responsibilities) ? [...profile.admin_responsibilities] : [];
            window.currentFormArrays.subjects_taught = Array.isArray(profile.subjects_taught) ? [...profile.subjects_taught] : [];
            window.currentFormArrays.research_guidance = Array.isArray(profile.research_guidance) ? [...profile.research_guidance] : [];
            window.currentFormArrays.publications = Array.isArray(profile.publications) ? [...profile.publications] : [];
            window.currentFormArrays.books = Array.isArray(profile.books) ? [...profile.books] : [];
            window.currentFormArrays.patents = Array.isArray(profile.patents) ? [...profile.patents] : [];
            window.currentFormArrays.seminars = Array.isArray(profile.seminars) ? [...profile.seminars] : [];

            if (profile.photo_url) {
                document.getElementById('facExistingPhoto').value = profile.photo_url;
                const img = document.getElementById('facPreview');
                img.src = profile.photo_url;
                img.style.display = 'block';
                if (removeBtn) removeBtn.style.display = 'inline-block';
            }
        }

        // Initialize and render tag inputs/editors
        initTagInput('specialization-input', 'specialization-tags', 'specialization');
        initTagInput('research-areas-input', 'research-areas-tags', 'research_areas');
        initTagInput('awards-input', 'awards-tags', 'awards');
        initTagInput('admin-res-input', 'admin-res-tags', 'admin_responsibilities');

        renderTags('specialization-tags', 'specialization');
        renderTags('research-areas-tags', 'research_areas');
        renderTags('awards-tags', 'awards');
        renderTags('admin-res-tags', 'admin_responsibilities');

        renderSubjectsTaughtEditor();
        renderGuidanceEditor();
        renderPublicationsEditor();
        renderBooksEditor();
        renderPatentsEditor();
        renderSeminarsEditor();

        AdminUtils.openModal('facultyModal');
    },

    deleteProfile: function(id) {
        AdminUtils.confirmDelete(async () => {
            try {
                // Get the profile to know if we need to delete a photo
                const profile = window.facultyDataMap[id];
                
                // Delete from DB
                const { error } = await supabase
                    .from('faculty')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Attempt to delete photo if it exists (not strictly required to fail if this fails)
                if (profile && profile.photo_url) {
                    try {
                        const urlObj = new URL(profile.photo_url);
                        const pathParts = urlObj.pathname.split('/');
                        const fileName = pathParts[pathParts.length - 1];
                        await supabase.storage.from('faculty_photos').remove([fileName]);
                    } catch (imgErr) {
                        console.warn("Could not delete image from bucket", imgErr);
                    }
                }

                AdminUtils.showToast('Profile deleted successfully');
                loadProfiles();
            } catch (error) {
                console.error('Error deleting profile:', error);
                alert('Failed to delete profile: ' + error.message);
            }
        });
    },

    removeModalPhoto: function() {
        document.getElementById('facPreview').src = '';
        document.getElementById('facPreview').style.display = 'none';
        document.getElementById('facPhotoInput').value = '';
        document.getElementById('facExistingPhoto').value = '';
        window.croppedFacultyPhotoBlob = null;
        const removeBtn = document.getElementById('btn-remove-photo');
        if (removeBtn) removeBtn.style.display = 'none';
    },

    directAvatarChange: function(id, fileInput) {
        if (!fileInput.files || !fileInput.files[0]) return;
        const file = fileInput.files[0];
        const profile = window.facultyDataMap && window.facultyDataMap[id];
        if (!profile) {
            console.error('Profile not found for ID:', id);
            return;
        }

        // Open the cropper
        AdminUtils.openCropper(file, 1, async (croppedBlob) => {
            // Show a loading spinner inside the avatar container
            const avatarWrap = document.getElementById(`avatar-wrap-${id}`);
            const originalHTML = avatarWrap.innerHTML;
            
            // Set loading spinner styling
            avatarWrap.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 50%;">
                    <i class="fas fa-spinner fa-spin" style="color: var(--blue-600); font-size: 1.2rem;"></i>
                </div>
            `;

            try {
                const category = profile.category || 'faculty';
                const fileExt = 'png'; // Cropper outputs PNG
                const fileName = `${category}-${Date.now()}.${fileExt}`;

                // Upload cropped image
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('faculty_photos')
                    .upload(fileName, croppedBlob);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('faculty_photos')
                    .getPublicUrl(fileName);

                const newPhotoUrl = publicUrlData.publicUrl;

                // Update database
                const { error: updateError } = await supabase
                    .from('faculty')
                    .update({ photo_url: newPhotoUrl })
                    .eq('id', id);

                if (updateError) throw updateError;

                // Delete old photo if it exists
                if (profile.photo_url) {
                    try {
                        const urlObj = new URL(profile.photo_url);
                        const pathParts = urlObj.pathname.split('/');
                        const oldFileName = pathParts[pathParts.length - 1];
                        await supabase.storage.from('faculty_photos').remove([oldFileName]);
                    } catch (imgErr) {
                        console.warn("Could not delete old image from bucket", imgErr);
                    }
                }

                AdminUtils.showToast('Avatar updated successfully!');
                
                // Reload list to show updated card
                loadProfiles();

            } catch (error) {
                console.error('Error updating direct avatar:', error);
                AdminUtils.showToast('Failed to update avatar: ' + error.message, 'error');
                // Restore original card html on error
                avatarWrap.innerHTML = originalHTML;
            }
        });

        // Reset the input file so it can trigger change event again if same file is picked
        fileInput.value = '';
    }
};

// Generic tag input manager
window.currentFormArrays = {
    specialization: [],
    research_areas: [],
    awards: [],
    admin_responsibilities: [],
    subjects_taught: [],
    research_guidance: [],
    publications: [],
    books: [],
    patents: [],
    seminars: []
};

window.initTagInput = function(inputId, tagsId, fieldKey) {
    const input = document.getElementById(inputId);
    const tagsContainer = document.getElementById(tagsId);
    
    if (!input || !tagsContainer) return;

    // Remove existing listeners by replacing the element
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = newInput.value.trim();
            if (val && !window.currentFormArrays[fieldKey].includes(val)) {
                window.currentFormArrays[fieldKey].push(val);
                window.renderTags(tagsId, fieldKey);
                newInput.value = '';
            }
        }
    });
};

window.renderTags = function(tagsId, fieldKey) {
    const tagsContainer = document.getElementById(tagsId);
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = window.currentFormArrays[fieldKey].map((val, i) => `
        <span class="tag-chip" style="background: var(--blue-50); color: var(--blue-700); border: 1px solid var(--blue-200); border-radius: 4px; padding: 2px 8px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; margin: 2px;">
            ${val}
            <i class="fas fa-times" style="cursor: pointer; font-size: 0.75rem;" onclick="removeFormArrayTag('${fieldKey}', ${i}, '${tagsId}')"></i>
        </span>
    `).join('');
};

window.removeFormArrayTag = function(fieldKey, index, tagsId) {
    window.currentFormArrays[fieldKey].splice(index, 1);
    window.renderTags(tagsId, fieldKey);
};

window.renderSubjectsTaughtEditor = function() {
    const listContainer = document.getElementById('subjects-group-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.subjects_taught.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No subjects added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.subjects_taught.map((group, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <div style="flex: 1;">
                <strong style="color: var(--blue-900); font-size: 0.9rem;">${group.level}</strong>
                <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 2px;">${group.subjects.join(', ')}</div>
            </div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removeSubjectsGroup(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addSubjectsGroup = function() {
    const levelSelect = document.getElementById('subject-level-select');
    const textarea = document.getElementById('subject-list-textarea');
    if (!levelSelect || !textarea) return;
    
    const level = levelSelect.value;
    const subjects = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
    
    if (subjects.length === 0) {
        alert('Please enter at least one subject.');
        return;
    }
    
    const existing = window.currentFormArrays.subjects_taught.find(g => g.level === level);
    if (existing) {
        existing.subjects = [...new Set([...existing.subjects, ...subjects])];
    } else {
        window.currentFormArrays.subjects_taught.push({ level, subjects });
    }
    
    textarea.value = '';
    window.renderSubjectsTaughtEditor();
};

window.removeSubjectsGroup = function(index) {
    window.currentFormArrays.subjects_taught.splice(index, 1);
    window.renderSubjectsTaughtEditor();
};

window.renderGuidanceEditor = function() {
    const listContainer = document.getElementById('guidance-group-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.research_guidance.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No research guidance added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.research_guidance.map((g, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <div style="flex: 1;">
                <strong style="color: var(--blue-900); font-size: 0.9rem;">${g.degree} — ${g.summary || ''}</strong>
                <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 2px;">Candidates: ${g.candidates.join(', ')}</div>
            </div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removeGuidanceGroup(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addGuidanceGroup = function() {
    const degreeSelect = document.getElementById('guidance-degree-select');
    const summaryInput = document.getElementById('guidance-summary-input');
    const candidatesTextarea = document.getElementById('guidance-candidates-textarea');
    if (!degreeSelect || !summaryInput || !candidatesTextarea) return;
    
    const degree = degreeSelect.value;
    const summary = summaryInput.value.trim();
    const candidates = candidatesTextarea.value.split('\n').map(s => s.trim()).filter(Boolean);
    
    if (!summary && candidates.length === 0) {
        alert('Please enter a summary or at least one candidate.');
        return;
    }
    
    window.currentFormArrays.research_guidance.push({ degree, summary, candidates });
    
    summaryInput.value = '';
    candidatesTextarea.value = '';
    window.renderGuidanceEditor();
};

window.removeGuidanceGroup = function(index) {
    window.currentFormArrays.research_guidance.splice(index, 1);
    window.renderGuidanceEditor();
};

window.renderPublicationsEditor = function() {
    const listContainer = document.getElementById('publications-repeater-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.publications.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No publications added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.publications.map((pub, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1;">
                <span class="tag-chip" style="background: var(--blue-50); color: var(--blue-700); border: 1px solid var(--blue-200); border-radius: 4px; padding: 1px 6px; font-size: 0.75rem; font-weight: 600;">${pub.type}</span>
                <div style="font-size: 0.85rem; color: var(--gray-800); margin-top: 4px; line-height: 1.4;">${pub.citation}</div>
            </div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; margin-top: 2px; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removePublicationEntry(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addPublicationEntry = function() {
    const typeSelect = document.getElementById('pub-type-select');
    const citationTextarea = document.getElementById('pub-citation-textarea');
    if (!typeSelect || !citationTextarea) return;
    
    const type = typeSelect.value;
    const citation = citationTextarea.value.trim();
    
    if (!citation) {
        alert('Please enter a citation.');
        return;
    }
    
    window.currentFormArrays.publications.push({ type, citation });
    citationTextarea.value = '';
    window.renderPublicationsEditor();
};

window.removePublicationEntry = function(index) {
    window.currentFormArrays.publications.splice(index, 1);
    window.renderPublicationsEditor();
};

window.renderBooksEditor = function() {
    const listContainer = document.getElementById('books-repeater-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.books.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No books added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.books.map((book, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; font-size: 0.85rem; color: var(--gray-800); line-height: 1.4;">${book.citation}</div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removeBookEntry(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addBookEntry = function() {
    const textarea = document.getElementById('book-citation-textarea');
    if (!textarea) return;
    
    const citation = textarea.value.trim();
    if (!citation) {
        alert('Please enter a book citation.');
        return;
    }
    
    window.currentFormArrays.books.push({ citation });
    textarea.value = '';
    window.renderBooksEditor();
};

window.removeBookEntry = function(index) {
    window.currentFormArrays.books.splice(index, 1);
    window.renderBooksEditor();
};

window.renderPatentsEditor = function() {
    const listContainer = document.getElementById('patents-repeater-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.patents.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No patents added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.patents.map((p, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; font-size: 0.85rem; color: var(--gray-800); line-height: 1.4;">${p.description}</div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removePatentEntry(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addPatentEntry = function() {
    const textarea = document.getElementById('patent-desc-textarea');
    if (!textarea) return;
    
    const description = textarea.value.trim();
    if (!description) {
        alert('Please enter a patent description.');
        return;
    }
    
    window.currentFormArrays.patents.push({ description });
    textarea.value = '';
    window.renderPatentsEditor();
};

window.removePatentEntry = function(index) {
    window.currentFormArrays.patents.splice(index, 1);
    window.renderPatentsEditor();
};

window.renderSeminarsEditor = function() {
    const listContainer = document.getElementById('seminars-repeater-list');
    if (!listContainer) return;
    
    if (window.currentFormArrays.seminars.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--gray-500); font-style: italic; font-size: 0.9rem;">No seminars added yet.</div>';
        return;
    }
    
    listContainer.innerHTML = window.currentFormArrays.seminars.map((s, i) => `
        <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; font-size: 0.85rem; color: var(--gray-800); line-height: 1.4;">${s.description}</div>
            <button type="button" class="action-btn delete" style="padding: 4px; font-size: 0.8rem; height: auto; width: auto; min-width: unset; border: none; background: transparent; color: var(--red-600);" onclick="removeSeminarEntry(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.addSeminarEntry = function() {
    const textarea = document.getElementById('seminar-desc-textarea');
    if (!textarea) return;
    
    const description = textarea.value.trim();
    if (!description) {
        alert('Please enter a seminar description.');
        return;
    }
    
    window.currentFormArrays.seminars.push({ description });
    textarea.value = '';
    window.renderSeminarsEditor();
};

window.removeSeminarEntry = function(index) {
    window.currentFormArrays.seminars.splice(index, 1);
    window.renderSeminarsEditor();
};