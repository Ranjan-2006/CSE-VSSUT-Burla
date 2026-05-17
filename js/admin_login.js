/* ===== ADMIN LOGIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const openBtn = document.getElementById('openAdminLogin');
    const closeBtn = document.getElementById('closeLoginBtn');
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('adminSession') === 'active';

    // Open Login Screen or Redirect to Dashboard
    if (openBtn) {
        if (isLoggedIn) {
            // User is logged in, change topbar button to Dashboard
            openBtn.innerHTML = '<i class="fas fa-columns"></i> Dashboard';
            openBtn.href = 'html/admin_dashboard.html';
            openBtn.removeAttribute('id'); // Remove id so it doesn't trigger login popup
            
            // Add Admin to navbar dynamically
            const navLinks = document.getElementById('nav-links');
            if (navLinks) {
                const adminNav = document.createElement('li');
                adminNav.innerHTML = '<a href="html/admin_dashboard.html" class="nav-link" style="color: var(--gold);">Admin Dashboard</a>';
                navLinks.insertBefore(adminNav, navLinks.firstChild);
            }
        } else if (loginScreen) {
            // User is NOT logged in, bind login popup
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginScreen.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        }
    }


    // Close Login Screen
    if (closeBtn && loginScreen) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginScreen.classList.remove('active');
            // Wait for animation to finish before allowing scroll again
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 800);
        });
    }

    // Toggle Password Visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // Login Form Submission simulation
    const loginForm = document.getElementById('adminLoginForm');
    const loginBtn = document.getElementById('loginBtn');

    // Base64 encoded credentials to prevent casual inspection
    // username: "admin.cse" -> YWRtaW4uY3Nl
    // password: "admin_cse_123" -> YWRtaW5fY3NlXzEyMw==
    const validUserEncoded = 'YWRtaW4uY3Nl';
    const validPassEncoded = 'YWRtaW5fY3NlXzEyMw==';

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userVal = document.getElementById('username').value;
            const passVal = document.getElementById('password').value;
            
            // Simple visual feedback for the user
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            loginBtn.style.opacity = '0.8';
            loginBtn.disabled = true;

            try {
                const userEncoded = btoa(userVal);
                const passEncoded = btoa(passVal);
                
                // Simulate network delay for realistic UX
                setTimeout(() => {
                    if (userEncoded === validUserEncoded && passEncoded === validPassEncoded) {
                        // Success State
                        loginBtn.innerHTML = '<i class="fas fa-check-circle"></i> Redirecting...';
                        loginBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                        loginBtn.style.color = 'white';
                        
                        setTimeout(() => {
                            localStorage.setItem('adminSession', 'active');
                            window.location.href = 'html/admin_dashboard.html';
                        }, 1000);
                        
                    } else {
                        // Error State
                        loginBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid Credentials';
                        loginBtn.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                        loginBtn.style.color = 'white';
                        
                        // Reset after a few seconds
                        setTimeout(() => {
                            loginBtn.innerHTML = originalText;
                            loginBtn.style.background = '';
                            loginBtn.style.color = '';
                            loginBtn.style.opacity = '1';
                            loginBtn.disabled = false;
                        }, 3000);
                    }
                }, 1000);
                
            } catch (error) {
                console.error("Hashing failed", error);
                loginBtn.innerHTML = originalText;
                loginBtn.style.opacity = '1';
                loginBtn.disabled = false;
            }
        });
    }
});