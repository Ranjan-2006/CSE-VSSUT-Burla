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
                                        });
                                    }">
                                <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera"></i></span>
                                <img id="facPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 50%;">
                            </div>
                            <small style="color: var(--gray-500); display: block; margin-top: 8px;">Profile Photo</small>
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
                        <div class="form-group" id="qualificationGroup" style="flex: 2;">
                            <label>Qualification <span style="color:red;">*</span></label>
                            <input type="text" id="facQualification" class="form-control" placeholder="e.g. Ph.D, M.Tech">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Gender <span style="color:red;">*</span></label>
                            <select id="facGender" class="form-control" required>
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
                            <div class="form-group" style="margin-bottom: 20px; background: var(--blue-50); padding: 15px; border-radius: 8px; border: 1px solid var(--blue-200);">
                                <label style="display: block; color: var(--blue-900); font-weight: 700; margin-bottom: 8px;">Special Role</label>
                                <select id="facSpecialRole" class="form-control">
                                    <option value="">None</option>
                                    <option value="Head of Department">Head of Department</option>
                                    <option value="Head of Programme">Head of Programme</option>
                                    <option value="Faculty Advisor">Faculty Advisor</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Specialization</label><input type="text" id="facSpecialization" class="form-control"></div>
                            <div class="form-group"><label>Experience (Years)</label><input type="number" id="facExperience" class="form-control"></div>
                            <div class="form-group"><label>Subjects Teaching</label><input type="text" id="facSubjects" class="form-control"></div>
                            <div class="form-group"><label>Research Areas</label><textarea id="facResearchAreas" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Research Guidance</label><textarea id="facResearchGuidance" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Awards & Honors</label><textarea id="facAwards" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Projects & Publications</label><textarea id="facPublications" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Patents</label><textarea id="facPatents" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Books / Book Chapters</label><textarea id="facBooks" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Seminars Organized</label><textarea id="facSeminars" class="form-control" style="min-height: 60px;"></textarea></div>
                            <div class="form-group"><label>Administrative Responsibilities</label><textarea id="facAdminRes" class="form-control" style="min-height: 60px;"></textarea></div>
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
                email: document.getElementById('facEmail').value,
                phone: document.getElementById('facPhone').value,
                qualification: document.getElementById('facQualification').value,
                gender: document.getElementById('facGender').value,
                photo_url: photoUrl,
                specialization: document.getElementById('facSpecialization').value,
                experience: document.getElementById('facExperience').value,
                subjects: document.getElementById('facSubjects').value,
                research_areas: document.getElementById('facResearchAreas').value,
                research_guidance: document.getElementById('facResearchGuidance').value,
                awards: document.getElementById('facAwards').value,
                publications: document.getElementById('facPublications').value,
                patents: document.getElementById('facPatents').value,
                books: document.getElementById('facBooks').value,
                seminars: document.getElementById('facSeminars').value,
                admin_responsibilities: document.getElementById('facAdminRes').value,
                address: document.getElementById('facAddress').value,
                special_role: document.getElementById('facSpecialRole').value,
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
        ? `<img src="${profile.photo_url}" style="width:100%; height:100%; object-fit:cover;">` 
        : `<i class="fas fa-user" style="font-size: 2rem; color: var(--gray-400); margin: 15px 18px;"></i>`;

    return `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-img-wrap">
                    ${photoHtml}
                </div>
                <div class="profile-info">
                    <h3 class="profile-name">${profile.name} ${profile.special_role ? `<span style="color:#f59e0b; font-size:0.8rem; margin-left:5px;"><i class="fas fa-star"></i> ${profile.special_role}</span>` : ''}</h3>
                    <p class="profile-role">${profile.designation}</p>
                </div>
            </div>
            <div class="profile-details">
                <div><i class="fas fa-envelope"></i> ${profile.email || 'N/A'}</div>
                <div><i class="fas fa-phone"></i> ${profile.phone || 'N/A'}</div>
            </div>
            <div class="profile-actions">
                <button class="action-btn" title="Edit" onclick="FacultyAdmin.openEditModal(${profile.id})"><i class="fas fa-pen"></i></button>
                <button class="action-btn delete" title="Delete" onclick="FacultyAdmin.deleteProfile(${profile.id})"><i class="fas fa-trash"></i></button>
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
            
            document.getElementById('facName').value = profile.name || '';
            document.getElementById('facDesignation').value = profile.designation || '';
            document.getElementById('facEmail').value = profile.email || '';
            document.getElementById('facPhone').value = profile.phone || '';
            document.getElementById('facQualification').value = profile.qualification || '';
            document.getElementById('facGender').value = profile.gender || '';
            document.getElementById('facSpecialRole').value = profile.special_role || '';
            document.getElementById('facSpecialization').value = profile.specialization || '';
            document.getElementById('facExperience').value = profile.experience || '';
            document.getElementById('facSubjects').value = profile.subjects || '';
            document.getElementById('facResearchAreas').value = profile.research_areas || '';
            document.getElementById('facResearchGuidance').value = profile.research_guidance || '';
            document.getElementById('facAwards').value = profile.awards || '';
            document.getElementById('facPublications').value = profile.publications || '';
            document.getElementById('facPatents').value = profile.patents || '';
            document.getElementById('facBooks').value = profile.books || '';
            document.getElementById('facSeminars').value = profile.seminars || '';
            document.getElementById('facAdminRes').value = profile.admin_responsibilities || '';
            document.getElementById('facAddress').value = profile.address || '';

            if (profile.photo_url) {
                document.getElementById('facExistingPhoto').value = profile.photo_url;
                const img = document.getElementById('facPreview');
                img.src = profile.photo_url;
                img.style.display = 'block';
            }
        }

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
    }
};