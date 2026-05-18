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
    // Determine correct dashboard path based on current page location
    const isSubpage = window.location.pathname.includes('/html/');
    const dashboardPath = isSubpage ? 'admin_dashboard.html' : 'html/admin_dashboard.html';

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
                openBtn.href = dashboardPath;
                openBtn.removeAttribute('id'); // So it doesn't trigger modal
                
                // Add Admin to navbar dynamically if not already added
                const navLinks = document.getElementById('nav-links');
                if (navLinks && !document.getElementById('admin-nav-link')) {
                    const adminNav = document.createElement('li');
                    adminNav.id = 'admin-nav-link';
                    adminNav.innerHTML = `<a href="${dashboardPath}" class="nav-link" style="color: var(--gold);">Admin Dashboard</a>`;
                    navLinks.insertBefore(adminNav, navLinks.firstChild);
                }
            }
            
            // Initialize Session Manager if not already running
            if (!window.sessionManagerRunning) {
                initSessionManager();
                window.sessionManagerRunning = true;
            }
        } else {
            // No session exists
            if (adminPanel) adminPanel.style.display = 'none';
            // Kick user out of admin dashboard pages if no session
            if (window.location.pathname.includes('admin_dashboard') || window.location.pathname.includes('faculty-admin') || window.location.pathname.includes('student-admin')) {
                window.location.href = isSubpage ? '../index.html' : 'index.html';
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
                    window.location.href = dashboardPath;
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
    
    // --- Session Manager Logic ---
    function initSessionManager() {
        // Limits
        const HARD_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
        const IDLE_WARNING_MS = 10 * 60 * 1000;   // 10 mins
        const IDLE_LOGOUT_MS = 15 * 60 * 1000;    // 15 mins (10 + 5)
        
        let lastActivityTime = Date.now();
        
        // Track session start in sessionStorage (so it persists across page reloads in same tab)
        if (!sessionStorage.getItem('adminSessionStart')) {
            sessionStorage.setItem('adminSessionStart', Date.now().toString());
        }
        
        // Activity events to reset idle timer
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove'];
        
        const resetIdleTime = () => {
            lastActivityTime = Date.now();
            if (document.getElementById('sessionWarningModal')) {
                document.getElementById('sessionWarningModal').classList.remove('active');
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, resetIdleTime, false);
        });

        // Add Warning Modal HTML if not exists
        if (!document.getElementById('sessionWarningModal')) {
            const warningHTML = `
            <div class="admin-modal-overlay" id="sessionWarningModal" style="z-index: 99999;">
                <div class="admin-modal" style="max-width: 450px; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #f59e0b; margin-bottom: 20px;"></i>
                    <h2 style="margin: 0 0 10px 0; color: var(--blue-900);">Are you still there?</h2>
                    <p style="color: var(--gray-600); margin-bottom: 25px;">You have been inactive for a while. For security reasons, you will be automatically logged out in 5 minutes unless you interact with the page.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('sessionWarningModal').classList.remove('active')">I'm still here</button>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', warningHTML);
        }

        // Timer Check every second
        setInterval(async () => {
            const now = Date.now();
            const sessionStart = parseInt(sessionStorage.getItem('adminSessionStart') || now.toString());
            const idleTime = now - lastActivityTime;
            const totalSessionTime = now - sessionStart;

            // 1. Hard Limit Check (2 hours)
            if (totalSessionTime >= HARD_LIMIT_MS) {
                alert("Session expired: 2-hour maximum limit reached. Please log in again.");
                sessionStorage.removeItem('adminSessionStart');
                await supabase.auth.signOut();
                window.location.reload();
                return;
            }

            // 2. Idle Logout Check (15 mins)
            if (idleTime >= IDLE_LOGOUT_MS) {
                alert("You have been automatically logged out due to inactivity.");
                sessionStorage.removeItem('adminSessionStart');
                await supabase.auth.signOut();
                window.location.reload();
                return;
            }

            // 3. Idle Warning Check (10 mins)
            if (idleTime >= IDLE_WARNING_MS && idleTime < IDLE_LOGOUT_MS) {
                const modal = document.getElementById('sessionWarningModal');
                if (modal && !modal.classList.contains('active')) {
                    modal.classList.add('active');
                }
            }
        }, 1000);
    }
});
