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
        <div class="admin-modal-overlay" id="deleteConfirmModal">
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
    }
};

// Global click handler to close modals when clicking on the overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-modal-overlay')) {
        AdminUtils.closeModal(e.target.id);
    }
});
