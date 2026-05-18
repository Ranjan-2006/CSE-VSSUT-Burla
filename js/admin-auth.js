import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements based on user requirements
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');
    const loginOverlay = document.getElementById('admin-login-overlay');
    const openBtn = document.getElementById('openAdminLogin');
    
    // Admin management view and logout button
    const adminPanel = document.getElementById('admin-management-panel');
    const logoutBtn = document.getElementById('admin-logout-btn');

    // Handle Open Button click (only when not logged in)
    if (openBtn && loginOverlay) {
        openBtn.addEventListener('click', (e) => {
            // If it doesn't have an href to dashboard, it opens the modal
            if (openBtn.getAttribute('href') === '#') {
                e.preventDefault();
                loginOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // 5. Global Session Observer
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            // Valid active session
            if (loginOverlay) {
                loginOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (adminPanel) adminPanel.style.display = 'block';

            // Transform topbar login button to dashboard link
            if (openBtn) {
                openBtn.innerHTML = '<i class="fas fa-columns"></i> Dashboard';
                openBtn.href = 'html/admin_dashboard.html';
                openBtn.removeAttribute('id'); // So it doesn't trigger modal
                
                // Add Admin to navbar dynamically if not already added
                const navLinks = document.getElementById('nav-links');
                if (navLinks && !document.getElementById('admin-nav-link')) {
                    const adminNav = document.createElement('li');
                    adminNav.id = 'admin-nav-link';
                    adminNav.innerHTML = '<a href="html/admin_dashboard.html" class="nav-link" style="color: var(--gold);">Admin Dashboard</a>';
                    navLinks.insertBefore(adminNav, navLinks.firstChild);
                }
            }
            
            // If on the index page and user just signed in, redirect to dashboard
            // We removed the auto-redirect here so it doesn't force you back to dashboard when you visit Home.
        } else {
            // No session exists
            if (adminPanel) adminPanel.style.display = 'none';
            // Kick user out of admin dashboard pages if no session
            if (window.location.pathname.includes('admin_dashboard') || window.location.pathname.includes('faculty-admin') || window.location.pathname.includes('student-admin')) {
                window.location.href = '../index.html';
            }
        }
    });

    // 2. Form Interception
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) return;

            // 3. UI Feedback
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.style.opacity = '0.8';

            try {
                // 4. Supabase Auth Execution
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    throw error;
                }
                
                // On success, UI transforms
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Redirecting...';
                submitBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                submitBtn.style.color = 'white';
                
                loginForm.reset();
                // Explicitly redirect ONLY when they actively log in through the form
                setTimeout(() => {
                    window.location.href = 'html/admin_dashboard.html';
                }, 1000);

            } catch (error) {
                // Re-enable and reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.opacity = '1';
                
                // Show error message via alert as requested
                alert(`Authentication Failed: ${error.message}`);
                
                // Optional: visual error feedback on button
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid Credentials';
                submitBtn.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                submitBtn.style.color = 'white';
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                }, 3000);
            }
        });
    }

    // 6. Logout Pipeline
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await supabase.auth.signOut();
                window.location.reload();
            } catch (error) {
                console.error("Logout Error:", error);
                alert(`Logout Failed: ${error.message}`);
            }
        });
    }
});
