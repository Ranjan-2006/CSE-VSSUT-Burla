// admin_modals.js - Modal injection and handling for Admin Dashboard

const AdminModals = {
    // State to track if a modal has been injected
    loaded: {
        news: false,
        research: false,
        alumni: false,
        gallery: false,
        videos: false,
        courseStructure: false
    },

    // Inject HTML string into the body
    injectHTML: function(htmlString) {
        document.body.insertAdjacentHTML('beforeend', htmlString);
    },

    // 1. News & Events
    openNews: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.news) {
            const html = `
            <div class="admin-modal-overlay" id="newsAdminModal">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-newspaper"></i> Manage News & Events</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('newsAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-news-add">Add New</button>
                        <button class="admin-tab-btn" id="tabBtn-news-modify">Modify Existing</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-news-add">
                            <form id="event-upload-form">
                                <input type="hidden" id="event-id">
                                <div class="form-group">
                                    <label>Date</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="date" id="event-date" class="form-control" required style="flex: 1;">
                                        <button type="button" class="btn btn-outline" onclick="this.previousElementSibling.valueAsDate = new Date()">Today</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Title <span style="color:red;">*</span></label>
                                    <input type="text" id="event-title" class="form-control" placeholder="Enter news title" required>
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea id="event-desc" class="form-control" placeholder="Write description here..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Attach PDF (Optional)</label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" id="event-pdf" accept=".pdf" onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                        <span class="file-upload-text">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            Click to browse or drag PDF here
                                        </span>
                                        <div class="file-preview"></div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="button" class="btn btn-outline" onclick="AdminUtils.showToast('Draft saved successfully', 'success')">Save Draft</button>
                                    <button type="submit" id="save-event-btn" class="btn btn-primary">Publish</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-news-modify">
                            <div class="data-list" id="admin-news-list">
                                <div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading news & events...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            
            // Setup Tabs
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-news-add'), document.getElementById('tabBtn-news-modify')],
                [document.getElementById('tabContent-news-add'), document.getElementById('tabContent-news-modify')]
            );
            
            this.loaded.news = true;
        }
        AdminUtils.openModal('newsAdminModal');
    },

    // 2. Research & Development
    openResearch: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.research) {
            const html = `
            <div class="admin-modal-overlay" id="resAdminModal">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-flask"></i> Manage Research & Development</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('resAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-res-add">Add New</button>
                        <button class="admin-tab-btn" id="tabBtn-res-modify">Modify Existing</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-res-add">
                            <form id="res-form">
                                <input type="hidden" id="res-id">
                                <div class="form-group">
                                    <label>Category <span style="color:red;">*</span></label>
                                    <select id="res-category" class="form-control" required>
                                        <option value="" disabled selected>Select category...</option>
                                        <option value="sponsored_project">Sponsored Project</option>
                                        <option value="publication">Publication</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date / Year <span style="color:red;">*</span></label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="date" id="res-date" class="form-control" required style="flex: 1;">
                                        <button type="button" class="btn btn-outline" onclick="this.previousElementSibling.valueAsDate = new Date()">Today</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Title <span style="color:red;">*</span></label>
                                    <input type="text" id="res-title" class="form-control" placeholder="Enter project or publication title" required>
                                </div>
                                <div class="form-group">
                                    <label>Author(s)</label>
                                    <input type="text" id="res-author" class="form-control" placeholder="Enter author names...">
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea id="res-desc" class="form-control" placeholder="Enter details..." style="min-height: 80px;"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>External Link (URL)</label>
                                    <input type="url" id="res-link" class="form-control" placeholder="https://...">
                                </div>
                                <div class="form-group">
                                    <label>Attach PDF (Optional)</label>
                                    <div class="file-upload-wrapper" style="padding: 15px;">
                                        <input type="file" id="res-pdf" accept=".pdf" onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                        <span class="file-upload-text">Click to browse or drag PDF here</span>
                                        <div class="file-preview"></div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="button" class="btn btn-outline" onclick="AdminUtils.showToast('Draft saved successfully', 'success')">Save Draft</button>
                                    <button type="submit" id="save-res-btn" class="btn btn-primary">Publish</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-res-modify">
                            <div style="margin-bottom: 15px;">
                                <select class="form-control" id="res-filter-category" style="width: auto;">
                                    <option value="all">All Categories</option>
                                    <option value="sponsored_project">Sponsored Projects</option>
                                    <option value="publication">Publications</option>
                                </select>
                            </div>
                            <div class="data-list" id="admin-res-list">
                                <div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-spinner fa-spin"></i> Loading research & projects...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-res-add'), document.getElementById('tabBtn-res-modify')],
                [document.getElementById('tabContent-res-add'), document.getElementById('tabContent-res-modify')]
            );
            this.loaded.research = true;
        }
        AdminUtils.openModal('resAdminModal');
    },

    // 3. Distinguished Alumni
    openAlumni: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.alumni) {
            const html = `
            <div class="admin-modal-overlay" id="alumniAdminModal">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-user-graduate"></i> Manage Alumni</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('alumniAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-al-add">Add New</button>
                        <button class="admin-tab-btn" id="tabBtn-al-modify">Modify Existing</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-al-add">
                            <form id="al-form" onsubmit="return false;">
                                <input type="hidden" id="al-id" value="">
                                <div style="display: flex; gap: 20px; align-items: flex-start;">
                                    <div style="flex: 1;">
                                        <div class="form-group">
                                            <label>Full Name <span style="color:red;">*</span></label>
                                            <input type="text" id="al-name" class="form-control" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Current Post / Designation <span style="color:red;">*</span></label>
                                            <input type="text" id="al-desig" class="form-control" required>
                                        </div>
                                        <div style="display: flex; gap: 15px;">
                                            <div class="form-group" style="flex: 1;">
                                                <label>Batch / Passing Year <span style="color:red;">*</span></label>
                                                <input type="text" id="al-batch" class="form-control" placeholder="e.g. 2018" required>
                                            </div>
                                            <div class="form-group" style="flex: 1;">
                                                <label>Gender <span style="color:red;">*</span></label>
                                                <select id="al-gender" class="form-control" required>
                                                    <option value="" disabled selected>Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="width: 150px;">
                                        <label style="font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 8px;">Photo</label>
                                        <div class="file-upload-wrapper" style="padding: 10px; height: 150px; display: flex; align-items: center; justify-content: center;">
                                            <input type="file" id="al-photo" accept="image/*" onchange="
                                                if(this.files[0]) {
                                                    AdminUtils.openCropper(this.files[0], 1, (croppedBlob) => {
                                                        const url = window.URL.createObjectURL(croppedBlob);
                                                        const img = document.getElementById('alumniPreview');
                                                        img.src = url;
                                                        img.style.display = 'block';
                                                        document.getElementById('al-photo').croppedBlob = croppedBlob;
                                                    });
                                                }">
                                            <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera" style="font-size: 1.5rem;"></i> Upload</span>
                                            <img id="alumniPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 6px;">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Message / Quote (Optional)</label>
                                    <textarea id="al-quote" class="form-control" style="min-height: 60px;"></textarea>
                                </div>
                                <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                                    <input type="checkbox" id="al-showcase" checked style="width: 18px; height: 18px; cursor: pointer;">
                                    <label for="al-showcase" style="margin: 0; cursor: pointer;">Showcase on public webpage</label>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="submit" id="save-al-btn" class="btn btn-primary">Save Profile</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-al-modify">
                            <div class="data-list" id="admin-al-list">
                                <!-- Dynamic items loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-al-add'), document.getElementById('tabBtn-al-modify')],
                [document.getElementById('tabContent-al-add'), document.getElementById('tabContent-al-modify')]
            );
            this.loaded.alumni = true;
        }
        AdminUtils.openModal('alumniAdminModal');
    },

    // 4. Photo Gallery
    openGallery: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.gallery) {
            const html = `
            <style>
                .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
                .gallery-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9; background: var(--gray-200); }
                .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
                .gallery-item-actions { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); padding: 8px; display: flex; justify-content: flex-end; align-items: center; opacity: 0; transition: opacity 0.2s; }
                .gallery-item:hover .gallery-item-actions { opacity: 1; }
            </style>
            <div class="admin-modal-overlay" id="galleryAdminModal">
                <div class="admin-modal" style="max-width: 800px;">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-images"></i> Manage Photo Gallery</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('galleryAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-gal-add">Add Photo</button>
                        <button class="admin-tab-btn" id="tabBtn-gal-modify">Manage Gallery</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-gal-add">
                            <form id="gal-form" onsubmit="return false;">
                                <input type="hidden" id="gal-id" value="">
                                <div style="display: flex; gap: 20px; align-items: flex-start;">
                                    <div style="flex: 1;">
                                        <div class="form-group">
                                            <label>Photo Title <span style="color:red;">*</span></label>
                                            <input type="text" id="gal-title" class="form-control" required placeholder="e.g. Computer Science Lab">
                                        </div>
                                        <div class="form-group">
                                            <label>Description (Optional)</label>
                                            <textarea id="gal-desc" class="form-control" placeholder="Short description of the photo..."></textarea>
                                        </div>
                                    </div>
                                    <div style="width: 200px;">
                                        <label style="font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 8px;">Photo Upload <span style="color:red;">*</span></label>
                                        <div class="file-upload-wrapper" style="padding: 10px; height: 150px; display: flex; align-items: center; justify-content: center;">
                                            <input type="file" id="gal-photo" accept="image/*" onchange="
                                                if(this.files[0]) {
                                                    // Pass NaN to allow free aspect ratio crop
                                                    AdminUtils.openCropper(this.files[0], NaN, (croppedBlob) => {
                                                        const url = window.URL.createObjectURL(croppedBlob);
                                                        const img = document.getElementById('galPreview');
                                                        img.src = url;
                                                        img.style.display = 'block';
                                                        document.getElementById('gal-photo').croppedBlob = croppedBlob;
                                                    });
                                                }">
                                            <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera" style="font-size: 1.5rem;"></i> Upload</span>
                                            <img id="galPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 6px;">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                                    <input type="checkbox" id="gal-showcase" checked style="width: 18px; height: 18px; cursor: pointer;">
                                    <label for="gal-showcase" style="margin: 0; cursor: pointer;">Showcase in public carousel</label>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="submit" id="save-gal-btn" class="btn btn-primary">Save Photo</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-gal-modify">
                            <div class="gallery-grid" id="admin-gal-list">
                                <!-- Dynamic items loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-gal-add'), document.getElementById('tabBtn-gal-modify')],
                [document.getElementById('tabContent-gal-add'), document.getElementById('tabContent-gal-modify')]
            );
            this.loaded.gallery = true;
        }
        AdminUtils.openModal('galleryAdminModal');
    },

    // 5. Video Gallery
    openVideos: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.videos) {
            const html = `
            <style>
                .vid-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
            </style>
            <div class="admin-modal-overlay" id="videosAdminModal">
                <div class="admin-modal" style="max-width: 800px;">
                    <div class="admin-modal-header">
                        <h3><i class="fab fa-youtube"></i> Manage Video Gallery</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('videosAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-vid-add">Add Video</button>
                        <button class="admin-tab-btn" id="tabBtn-vid-modify">Manage Videos</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-vid-add">
                            <form id="vid-form" onsubmit="return false;">
                                <div class="form-group">
                                    <label>YouTube Embed URL <span style="color:red;">*</span></label>
                                    <input type="text" id="vid-embed" class="form-control" required placeholder='e.g. https://www.youtube.com/embed/zoRDYDfsPCU'>
                                    <small style="color: var(--gray-500); display: block; margin-top: 5px;">Copy the src attribute from the YouTube embed code.</small>
                                </div>
                                <div class="form-group">
                                    <label>Message / Caption (Optional)</label>
                                    <textarea id="vid-message" class="form-control" placeholder="Short description or message..."></textarea>
                                </div>
                                <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                                    <input type="checkbox" id="vid-showcase" checked style="width: 18px; height: 18px; cursor: pointer;">
                                    <label for="vid-showcase" style="margin: 0; cursor: pointer;">Showcase on main page</label>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="submit" id="save-vid-btn" class="btn btn-primary">Save Video</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-vid-modify">
                            <div class="vid-grid" id="admin-vid-list">
                                <!-- Dynamic items loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-vid-add'), document.getElementById('tabBtn-vid-modify')],
                [document.getElementById('tabContent-vid-add'), document.getElementById('tabContent-vid-modify')]
            );
            this.loaded.videos = true;
        }
        AdminUtils.openModal('videosAdminModal');
    },

    // 6. Course Structure
    openCourseStructure: function(e) {
        if(e) e.preventDefault();
        
        if (!this.loaded.courseStructure) {
            const html = `
            <style>
                .prog-selection { display: flex; gap: 16px; margin-bottom: 24px; }
                .prog-card-select { flex: 1; border: 2px solid var(--gray-200); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
                .prog-card-select:hover { border-color: var(--blue-300); background: var(--blue-50); }
                .prog-card-select.selected { border-color: var(--blue-600); background: var(--blue-50); }
                .prog-card-select i { font-size: 2rem; color: var(--blue-600); margin-bottom: 10px; }
                .prog-card-select h4 { margin: 0; color: var(--blue-900); }
            </style>
            <div class="admin-modal-overlay" id="courseAdminModal">
                <div class="admin-modal" style="max-width: 800px;">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-book"></i> Manage Course Structure</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('courseAdminModal')"><i class="fas fa-times"></i></button>
                    </div>

                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-course-add">Add Course Structure</button>
                        <button class="admin-tab-btn" id="tabBtn-course-modify">Manage Courses</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-course-add">
                            <form id="course-form" onsubmit="return false;">
                                
                                <div class="form-group">
                                    <label>Step 1: Choose Programme <span style="color:red;">*</span></label>
                                    <div class="prog-selection">
                                        <div class="prog-card-select" onclick="document.querySelectorAll('.prog-card-select').forEach(c=>c.classList.remove('selected')); this.classList.add('selected'); document.getElementById('course-prog').value='ug';">
                                            <i class="fas fa-laptop-code"></i>
                                            <h4>Undergraduate (B.Tech)</h4>
                                        </div>
                                        <div class="prog-card-select" onclick="document.querySelectorAll('.prog-card-select').forEach(c=>c.classList.remove('selected')); this.classList.add('selected'); document.getElementById('course-prog').value='pg';">
                                            <i class="fas fa-code"></i>
                                            <h4>Postgraduate (M.Tech/MCA)</h4>
                                        </div>
                                    </div>
                                    <input type="hidden" id="course-prog" required>
                                </div>

                                <div class="form-group">
                                    <label>Step 2: Course Title / Academic Year <span style="color:red;">*</span></label>
                                    <input type="text" id="course-title" class="form-control" placeholder="e.g. B.Tech CSE — Scheme & Syllabus 2024" required>
                                </div>

                                <div class="form-group">
                                    <label>Step 3: Upload Syllabus PDF <span style="color:red;">*</span></label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" id="course-pdf" accept=".pdf" required onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                        <span class="file-upload-text">
                                            <i class="fas fa-file-pdf"></i>
                                            Click to browse or drag PDF here
                                        </span>
                                        <div class="file-preview"></div>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="submit" id="save-course-btn" class="btn btn-primary">Upload & Save</button>
                                </div>
                            </form>
                        </div>

                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-course-modify">
                            <div class="data-list" id="admin-course-list">
                                <!-- Dynamic items loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            AdminUtils.setupTabs(
                [document.getElementById('tabBtn-course-add'), document.getElementById('tabBtn-course-modify')],
                [document.getElementById('tabContent-course-add'), document.getElementById('tabContent-course-modify')]
            );
            this.loaded.courseStructure = true;
        }
        AdminUtils.openModal('courseAdminModal');
    }
};
