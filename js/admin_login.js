/* ===== ADMIN LOGIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const openBtn = document.getElementById('openAdminLogin');
    const closeBtn = document.getElementById('closeLoginBtn');
    
    // Open Login Screen
    if (openBtn && loginScreen) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginScreen.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
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

    // Login Form Submission simulation
    const loginForm = document.getElementById('adminLoginForm');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple visual feedback for the user
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            loginBtn.style.opacity = '0.8';
            loginBtn.disabled = true;

            // Simulate authentication delay
            setTimeout(() => {
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
            }, 1500);
        });
    }
});