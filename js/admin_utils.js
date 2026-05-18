// admin_utils.js - Shared utilities for the Admin Panel

// Ensure global toast container exists
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Inject generic Delete Confirmation Modal HTML
    if (!document.getElementById('deleteConfirmModal')) {
        const deleteModalHTML = `
        <div class="admin-modal-overlay" id="deleteConfirmModal" style="z-index: 9999;">
            <div class="admin-modal" style="max-width: 400px;">
                <div class="admin-modal-header">
                    <h3><i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> Confirm Delete</h3>
                    <button class="admin-modal-close" onclick="AdminUtils.closeModal('deleteConfirmModal')"><i class="fas fa-times"></i></button>
                </div>
                <div class="admin-modal-body">
                    <p id="deleteConfirmMsg">Are you sure you want to delete this item? This action cannot be undone.</p>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn btn-outline" onclick="AdminUtils.closeModal('deleteConfirmModal')">Cancel</button>
                    <button class="btn btn-danger" id="deleteConfirmBtn">Delete</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', deleteModalHTML);
    }

    // Inject Cropper Modal HTML
    if (!document.getElementById('cropModal')) {
        const cropModalHTML = `
        <div class="admin-modal-overlay" id="cropModal" style="z-index: 10000;">
            <div class="admin-modal" style="max-width: 600px; width: 100%;">
                <div class="admin-modal-header">
                    <h3><i class="fas fa-crop-alt"></i> Crop Image</h3>
                    <button class="admin-modal-close" id="cropModalCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="admin-modal-body" style="height: 400px; display: flex; justify-content: center; align-items: center; background: #000; padding: 0;">
                    <img id="cropperImage" style="max-width: 100%; max-height: 100%; display: block;">
                </div>
                <div class="admin-modal-footer">
                    <button class="btn btn-outline" id="cropCancelBtn">Cancel</button>
                    <button class="btn btn-primary" id="cropSaveBtn">Apply Crop</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', cropModalHTML);
    }
});

const AdminUtils = {
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'warning'
     */
    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-times-circle';
        if (type === 'warning') icon = 'fa-exclamation-circle';

        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    },

    /**
     * Open an admin modal by ID
     * @param {string} modalId 
     */
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close an admin modal by ID
     * @param {string} modalId 
     */
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Show confirmation modal before executing a delete action
     * @param {string} message - Custom message (optional)
     * @param {Function} onConfirm - Callback if confirmed
     */
    confirmDelete: function(onConfirm, message = "Are you sure you want to delete this item? This action cannot be undone.") {
        document.getElementById('deleteConfirmMsg').innerText = message;
        
        const confirmBtn = document.getElementById('deleteConfirmBtn');
        
        // Remove old event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.closeModal('deleteConfirmModal');
        });

        this.openModal('deleteConfirmModal');
    },

    /**
     * Set up tabs within a modal/page
     * @param {NodeList} tabBtns 
     * @param {NodeList} tabContents 
     */
    setupTabs: function(tabBtns, tabContents) {
        tabBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                tabContents[index].classList.add('active');
            });
        });
    },

    /**
     * Open the universal image cropper
     * @param {File} file - The file to crop
     * @param {number} aspectRatio - e.g. 1 for square, 16/9 for landscape
     * @param {Function} onCropComplete - Callback receiving the cropped Blob
     */
    openCropper: function(file, aspectRatio, onCropComplete) {
        const imageElement = document.getElementById('cropperImage');
        const modal = document.getElementById('cropModal');
        const saveBtn = document.getElementById('cropSaveBtn');
        const cancelBtn = document.getElementById('cropCancelBtn');
        const closeBtn = document.getElementById('cropModalCloseBtn');

        if (!imageElement || !modal) {
            console.error('Cropper UI not found. Ensure Cropper HTML is injected.');
            return;
        }

        // Clean up previous instance if exists
        if (this.currentCropper) {
            this.currentCropper.destroy();
            this.currentCropper = null;
        }

        // Load image data
        const objectUrl = URL.createObjectURL(file);
        
        imageElement.onload = () => {
            // Wait slightly for modal CSS transitions to ensure image has layout dimensions
            setTimeout(() => {
                if (this.currentCropper) {
                    this.currentCropper.destroy();
                }
                this.currentCropper = new Cropper(imageElement, {
                    aspectRatio: aspectRatio,
                    viewMode: 1,
                    autoCropArea: 1,
                    background: false,
                    zoomable: true,
                });
            }, 100); // 100ms delay to allow modal to become fully visible
        };
        
        imageElement.src = objectUrl;

        // Reset handlers
        const cleanup = () => {
            if (this.currentCropper) {
                this.currentCropper.destroy();
                this.currentCropper = null;
            }
            imageElement.src = '';
            URL.revokeObjectURL(objectUrl);
            this.closeModal('cropModal');
        };

        const handleSave = () => {
            try {
                if (!this.currentCropper) {
                    alert("Cropper not initialized yet. Please wait a second and try again.");
                    return;
                }
                
                // Change button text to show it's working
                newSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                newSaveBtn.disabled = true;

                const canvas = this.currentCropper.getCroppedCanvas({
                    maxWidth: 1024,
                    maxHeight: 1024
                });
                
                if (!canvas) {
                    alert("Failed to get cropped canvas. Image might be invalid.");
                    newSaveBtn.innerHTML = 'Apply Crop';
                    newSaveBtn.disabled = false;
                    return;
                }
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        alert("Failed to compress image.");
                        newSaveBtn.innerHTML = 'Apply Crop';
                        newSaveBtn.disabled = false;
                        return;
                    }

                    try {
                        onCropComplete(blob);
                    } catch (e) {
                        alert("Error updating thumbnail: " + e.message);
                    }
                    cleanup();
                    newSaveBtn.innerHTML = 'Apply Crop';
                    newSaveBtn.disabled = false;
                }, file.type || 'image/jpeg', 0.9);
            } catch (err) {
                alert("An unexpected error occurred: " + err.message);
                newSaveBtn.innerHTML = 'Apply Crop';
                newSaveBtn.disabled = false;
            }
        };

        const handleCancel = () => {
            cleanup();
        };

        // We must clone buttons to strip old event listeners
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', handleSave);

        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', handleCancel);
        
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', handleCancel);

        this.openModal('cropModal');
    }
};

// Global click handler to close modals when clicking on the overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-modal-overlay')) {
        AdminUtils.closeModal(e.target.id);
    }
});
