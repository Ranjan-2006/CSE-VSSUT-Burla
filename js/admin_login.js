/* ===== ADMIN LOGIN JS (UI ONLY) ===== */

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('admin-login-overlay');
    const closeBtn = document.getElementById('closeLoginBtn');
    
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
    const passwordInput = document.getElementById('login-password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
});