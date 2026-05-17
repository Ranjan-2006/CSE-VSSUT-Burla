// admin_modals.js - Modal injection and handling for Admin Dashboard

const AdminModals = {
    // State to track if a modal has been injected
    loaded: {
        news: false,
        research: false,
        alumni: false,
        gallery: false,
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
                            <form id="newsAddForm" onsubmit="event.preventDefault(); AdminUtils.showToast('News published successfully!'); this.reset();">
                                <div class="form-group">
                                    <label>Date</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="date" class="form-control" required style="flex: 1;">
                                        <button type="button" class="btn btn-outline" onclick="this.previousElementSibling.valueAsDate = new Date()">Today</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Title <span style="color:red;">*</span></label>
                                    <input type="text" class="form-control" placeholder="Enter news title" required>
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea class="form-control" placeholder="Write description here..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Attach PDF (Optional)</label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" accept=".pdf" onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                        <span class="file-upload-text">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            Click to browse or drag PDF here
                                        </span>
                                        <div class="file-preview"></div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="button" class="btn btn-outline" onclick="AdminUtils.showToast('Draft saved successfully', 'success')">Save Draft</button>
                                    <button type="submit" class="btn btn-primary">Publish</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-news-modify">
                            <div class="data-list">
                                <div class="data-item">
                                    <div class="data-item-content">
                                        <div class="data-item-title">Ph.D Open Defense Viva-Voce of Ms. Swaty Dash</div>
                                        <div class="data-item-meta">
                                            <span><i class="far fa-calendar"></i> 13 Nov 2025</span>
                                            <span><i class="far fa-file-pdf"></i> Attached</span>
                                        </div>
                                    </div>
                                    <div class="data-item-actions">
                                        <label class="toggle-switch" title="Publish/Unpublish">
                                            <input type="checkbox" checked onchange="AdminUtils.showToast(this.checked ? 'Published' : 'Unpublished', 'success')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn" title="Edit" onclick="AdminUtils.showToast('Loaded into form for editing', 'success'); document.getElementById('tabBtn-news-add').click();"><i class="fas fa-pen"></i></button>
                                        <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div class="data-item">
                                    <div class="data-item-content">
                                        <div class="data-item-title">Annual Technical Symposium — TechFusion 2025</div>
                                        <div class="data-item-meta">
                                            <span><i class="far fa-calendar"></i> Oct 2025</span>
                                        </div>
                                    </div>
                                    <div class="data-item-actions">
                                        <label class="toggle-switch" title="Publish/Unpublish">
                                            <input type="checkbox" checked onchange="AdminUtils.showToast(this.checked ? 'Published' : 'Unpublished', 'success')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn" title="Edit" onclick="AdminUtils.showToast('Loaded into form for editing', 'success'); document.getElementById('tabBtn-news-add').click();"><i class="fas fa-pen"></i></button>
                                        <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
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
                            <form onsubmit="event.preventDefault(); AdminUtils.showToast('Entry added successfully!'); this.reset();">
                                <div class="form-group">
                                    <label>Category <span style="color:red;">*</span></label>
                                    <select class="form-control" required>
                                        <option value="" disabled selected>Select category...</option>
                                        <option value="sponsored">Sponsored Project</option>
                                        <option value="publication">Publication</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date / Year</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="date" class="form-control" style="flex: 1;">
                                        <button type="button" class="btn btn-outline" onclick="this.previousElementSibling.valueAsDate = new Date()">Today</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Title <span style="color:red;">*</span></label>
                                    <input type="text" class="form-control" placeholder="Enter project or publication title" required>
                                </div>
                                <div class="form-group">
                                    <label>Description / Authors</label>
                                    <textarea class="form-control" placeholder="Enter details..." style="min-height: 80px;"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>External Link (URL)</label>
                                    <input type="url" class="form-control" placeholder="https://...">
                                </div>
                                <div class="form-group">
                                    <label>Attach PDF (Optional)</label>
                                    <div class="file-upload-wrapper" style="padding: 15px;">
                                        <input type="file" accept=".pdf" onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                        <span class="file-upload-text">Click to browse or drag PDF here</span>
                                        <div class="file-preview"></div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="button" class="btn btn-outline" onclick="AdminUtils.showToast('Draft saved successfully', 'success')">Save Draft</button>
                                    <button type="submit" class="btn btn-primary">Publish</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-res-modify">
                            <div style="margin-bottom: 15px;">
                                <select class="form-control" style="width: auto;">
                                    <option value="all">All Categories</option>
                                    <option value="sponsored">Sponsored Projects</option>
                                    <option value="publication">Publications</option>
                                </select>
                            </div>
                            <div class="data-list">
                                <div class="data-item">
                                    <div class="data-item-content">
                                        <div class="data-item-title">Funded project on AI-based Smart Surveillance System</div>
                                        <div class="data-item-meta">
                                            <span><span style="background: var(--blue-100); color: var(--blue-800); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Project</span></span>
                                            <span>DST Funded · 2024</span>
                                        </div>
                                    </div>
                                    <div class="data-item-actions">
                                        <label class="toggle-switch">
                                            <input type="checkbox" checked onchange="AdminUtils.showToast(this.checked ? 'Published' : 'Unpublished', 'success')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn" title="Edit" onclick="AdminUtils.showToast('Loaded into form for editing', 'success'); document.getElementById('tabBtn-res-add').click();"><i class="fas fa-pen"></i></button>
                                        <button class="action-btn delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div class="data-item">
                                    <div class="data-item-content">
                                        <div class="data-item-title">Multiprocessor Task Scheduling Optimization...</div>
                                        <div class="data-item-meta">
                                            <span><span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Publication</span></span>
                                            <span>International Journal</span>
                                        </div>
                                    </div>
                                    <div class="data-item-actions">
                                        <label class="toggle-switch">
                                            <input type="checkbox" checked onchange="AdminUtils.showToast(this.checked ? 'Published' : 'Unpublished', 'success')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn" title="Edit" onclick="AdminUtils.showToast('Loaded into form for editing', 'success'); document.getElementById('tabBtn-res-add').click();"><i class="fas fa-pen"></i></button>
                                        <button class="action-btn delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
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
                            <form onsubmit="event.preventDefault(); AdminUtils.showToast('Alumni added successfully!'); this.reset(); document.getElementById('alumniPreview').src = ''; document.getElementById('alumniPreview').style.display = 'none';">
                                <div style="display: flex; gap: 20px;">
                                    <div style="flex: 1;">
                                        <div class="form-group">
                                            <label>Name <span style="color:red;">*</span></label>
                                            <input type="text" class="form-control" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Current Post / Designation <span style="color:red;">*</span></label>
                                            <input type="text" class="form-control" required>
                                        </div>
                                        <div style="display: flex; gap: 15px;">
                                            <div class="form-group" style="flex: 1;">
                                                <label>Batch / Passing Year <span style="color:red;">*</span></label>
                                                <input type="text" class="form-control" placeholder="e.g. 2018" required>
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
                                    </div>
                                    <div style="width: 150px;">
                                        <label style="font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 8px;">Photo</label>
                                        <div class="file-upload-wrapper" style="padding: 10px; height: 150px; display: flex; align-items: center; justify-content: center;">
                                            <input type="file" accept="image/*" onchange="
                                                if(this.files[0]) {
                                                    const url = URL.createObjectURL(this.files[0]);
                                                    const img = document.getElementById('alumniPreview');
                                                    img.src = url;
                                                    img.style.display = 'block';
                                                }">
                                            <span class="file-upload-text" style="font-size: 0.8rem;"><i class="fas fa-camera" style="font-size: 1.5rem;"></i> Upload</span>
                                            <img id="alumniPreview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; display: none; border-radius: 6px;">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Message / Quote (Optional)</label>
                                    <textarea class="form-control" style="min-height: 60px;"></textarea>
                                </div>
                                <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                                    <input type="checkbox" id="showcaseToggle" checked style="width: 18px; height: 18px; cursor: pointer;">
                                    <label for="showcaseToggle" style="margin: 0; cursor: pointer;">Showcase on public webpage</label>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                    <button type="submit" class="btn btn-primary">Save Profile</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-al-modify">
                            <div class="data-list">
                                <div class="data-item">
                                    <div style="display: flex; align-items: center; gap: 16px;">
                                        <div style="width: 50px; height: 50px; background: var(--gray-200); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--gray-500);"><i class="fas fa-user"></i></div>
                                        <div>
                                            <div class="data-item-title">Jane Doe</div>
                                            <div class="data-item-meta">
                                                <span>Software Engineer at Google</span>
                                                <span>Batch 2018</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="data-item-actions">
                                        <label class="toggle-switch" title="Showcase">
                                            <input type="checkbox" checked onchange="AdminUtils.showToast(this.checked ? 'Added to showcase' : 'Removed from showcase', 'success')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn" title="Edit" onclick="AdminUtils.showToast('Loaded into form for editing', 'success'); document.getElementById('tabBtn-al-add').click();"><i class="fas fa-pen"></i></button>
                                        <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
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
                .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
                .gallery-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: var(--gray-200); }
                .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
                .gallery-item-actions { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); padding: 6px; display: flex; justify-content: space-between; align-items: center; opacity: 0; transition: opacity 0.2s; }
                .gallery-item:hover .gallery-item-actions { opacity: 1; }
                .gallery-checkbox { position: absolute; top: 8px; left: 8px; z-index: 2; width: 18px; height: 18px; cursor: pointer; }
            </style>
            <div class="admin-modal-overlay" id="galleryAdminModal">
                <div class="admin-modal" style="max-width: 900px;">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-images"></i> Manage Gallery</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('galleryAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="admin-tabs" style="padding: 0 24px;">
                        <button class="admin-tab-btn active" id="tabBtn-gal-add">Upload Photos</button>
                        <button class="admin-tab-btn" id="tabBtn-gal-modify">Manage Gallery</button>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Add Tab -->
                        <div class="admin-tab-content active" id="tabContent-gal-add">
                            <form onsubmit="event.preventDefault(); AdminUtils.showToast('Photos uploaded successfully!'); this.reset();">
                                <div class="form-group">
                                    <label>Upload Photos (Multiple allowed)</label>
                                    <div class="file-upload-wrapper" style="padding: 40px;">
                                        <input type="file" accept="image/*" multiple onchange="AdminUtils.showToast(this.files.length + ' photos selected', 'success')">
                                        <span class="file-upload-text">
                                            <i class="fas fa-images"></i>
                                            Click to browse or drag images here
                                        </span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 20px;">
                                    <div class="form-group" style="flex: 1;">
                                        <label>Album / Event Tag</label>
                                        <input type="text" class="form-control" placeholder="e.g. TechFusion 2025">
                                    </div>
                                    <div class="form-group" style="flex: 1;">
                                        <label>Date</label>
                                        <input type="date" class="form-control">
                                    </div>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                                    <button type="submit" class="btn btn-primary">Upload to Gallery</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Modify Tab -->
                        <div class="admin-tab-content" id="tabContent-gal-modify">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; align-items: center;">
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="checkbox" id="selectAllGallery" style="cursor: pointer;" onchange="
                                        document.querySelectorAll('.gallery-checkbox').forEach(cb => cb.checked = this.checked);
                                    ">
                                    <label for="selectAllGallery" style="margin:0; cursor:pointer;">Select All</label>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="AdminUtils.showToast('Selected visibility toggled', 'success')">Toggle Visibility</button>
                                    <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="AdminUtils.confirmDelete(() => { AdminUtils.showToast('Selected photos deleted'); })">Delete Selected</button>
                                </div>
                            </div>
                            <div class="gallery-grid">
                                <div class="gallery-item">
                                    <input type="checkbox" class="gallery-checkbox">
                                    <img src="../assets/gallery/photo1.jpg" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+'" loading="lazy">
                                    <div class="gallery-item-actions">
                                        <label class="toggle-switch" style="transform: scale(0.6); transform-origin: left center;">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn delete" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <!-- Mock more images -->
                                ${Array(7).fill(`
                                <div class="gallery-item">
                                    <input type="checkbox" class="gallery-checkbox">
                                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+" loading="lazy">
                                    <div class="gallery-item-actions">
                                        <label class="toggle-switch" style="transform: scale(0.6); transform-origin: left center;">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <button class="action-btn delete" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>`).join('')}
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

    // 5. Course Structure
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
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3><i class="fas fa-book"></i> Update Course Structure</h3>
                        <button class="admin-modal-close" onclick="AdminUtils.closeModal('courseAdminModal')"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="admin-modal-body">
                        <form onsubmit="event.preventDefault(); AdminUtils.showToast('Course structure updated successfully!'); this.reset(); document.querySelectorAll('.prog-card-select').forEach(c=>c.classList.remove('selected'));">
                            
                            <div class="form-group">
                                <label>Step 1: Choose Programme</label>
                                <div class="prog-selection">
                                    <div class="prog-card-select" onclick="document.querySelectorAll('.prog-card-select').forEach(c=>c.classList.remove('selected')); this.classList.add('selected'); document.getElementById('selectedProg').value='ug';">
                                        <i class="fas fa-laptop-code"></i>
                                        <h4>Undergraduate (B.Tech)</h4>
                                    </div>
                                    <div class="prog-card-select" onclick="document.querySelectorAll('.prog-card-select').forEach(c=>c.classList.remove('selected')); this.classList.add('selected'); document.getElementById('selectedProg').value='pg';">
                                        <i class="fas fa-code"></i>
                                        <h4>Postgraduate (M.Tech/MCA)</h4>
                                    </div>
                                </div>
                                <input type="hidden" id="selectedProg" required>
                            </div>

                            <div class="form-group">
                                <label>Step 2: Course Title <span style="color:red;">*</span></label>
                                <input type="text" class="form-control" placeholder="e.g. B.Tech CSE — Scheme & Syllabus 2024" required>
                            </div>

                            <div class="form-group">
                                <label>Step 3: Upload Syllabus PDF <span style="color:red;">*</span></label>
                                <div class="file-upload-wrapper">
                                    <input type="file" accept=".pdf" required onchange="this.nextElementSibling.nextElementSibling.textContent = this.files[0] ? this.files[0].name : ''">
                                    <span class="file-upload-text">
                                        <i class="fas fa-file-pdf"></i>
                                        Click to browse or drag PDF here
                                    </span>
                                    <div class="file-preview"></div>
                                </div>
                            </div>
                            
                            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="replaceExisting" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <label for="replaceExisting" style="margin: 0; cursor: pointer;">Replace existing syllabus file for this programme</label>
                            </div>

                            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                        
                        <hr style="border: 0; border-top: 1px solid var(--gray-200); margin: 30px 0;">
                        
                        <h4 style="margin-bottom: 15px; color: var(--blue-900);">Current Uploads</h4>
                        <div class="data-list">
                            <div class="data-item">
                                <div class="data-item-content">
                                    <div class="data-item-title">B.Tech CSE Syllabus 2023</div>
                                    <div class="data-item-meta">Undergraduate</div>
                                </div>
                                <div class="data-item-actions">
                                    <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-content">
                                    <div class="data-item-title">M.Tech AI & ML Syllabus 2022</div>
                                    <div class="data-item-meta">Postgraduate</div>
                                </div>
                                <div class="data-item-actions">
                                    <button class="action-btn delete" title="Delete" onclick="AdminUtils.confirmDelete(() => { this.closest('.data-item').remove(); AdminUtils.showToast('Item deleted'); })"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.injectHTML(html);
            this.loaded.courseStructure = true;
        }
        AdminUtils.openModal('courseAdminModal');
    }
};
