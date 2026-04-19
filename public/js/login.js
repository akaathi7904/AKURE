/* =====================================================
   AKURE – Login / Register Page (login.js)
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  AKURE.hidePageLoader();

  // If already logged in → redirect
  const session = await AKURE.getSession();
  if (session) {
    const redirect = AKURE.getUrlParam('redirect') || '/';
    window.location.href = redirect;
    return;
  }

  // ── Tab Switching ─────────────────────────────────
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const panelLogin  = document.getElementById('panel-login');
  const panelReg    = document.getElementById('panel-register');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');    tabLogin.setAttribute('aria-selected', true);
    tabRegister.classList.remove('active'); tabRegister.setAttribute('aria-selected', false);
    panelLogin.classList.remove('hidden');
    panelReg.classList.add('hidden');
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');  tabRegister.setAttribute('aria-selected', true);
    tabLogin.classList.remove('active');  tabLogin.setAttribute('aria-selected', false);
    panelReg.classList.remove('hidden');
    panelLogin.classList.add('hidden');
  });

  // ── Login Form ─────────────────────────────────────
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) { errEl.textContent = 'Please enter your email and password.'; return; }

    btn.textContent = 'Logging in…';
    btn.classList.add('btn--loading');

    try {
      await AKURE.login(email, password);
      AKURE.showToast('Welcome back! 🌿', 'success');
      const redirect = AKURE.getUrlParam('redirect') || '/';
      setTimeout(() => window.location.href = redirect, 800);
    } catch (err) {
      errEl.textContent = err.message || 'Login failed. Check your credentials.';
      btn.textContent = 'Login';
      btn.classList.remove('btn--loading');
    }
  });

  // ── Register Form ──────────────────────────────────
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = document.getElementById('register-btn');
    const errEl = document.getElementById('register-error');
    errEl.textContent = '';

    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
    if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

    btn.textContent = 'Creating Account…';
    btn.classList.add('btn--loading');

    try {
      await AKURE.register(email, password, name);
      AKURE.showToast('Account created! Please check your email to confirm. 🌿', 'success');
      errEl.style.color = 'var(--color-success)';
      errEl.textContent = 'Registration successful! Check your inbox for a confirmation email.';
      btn.textContent = 'Create Account';
      btn.classList.remove('btn--loading');
    } catch (err) {
      errEl.textContent = err.message || 'Registration failed. Please try again.';
      btn.textContent = 'Create Account';
      btn.classList.remove('btn--loading');
    }
  });

  // ── Forgot Password ────────────────────────────────
  document.getElementById('forgot-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
      document.getElementById('login-error').textContent = 'Enter your email above first.';
      return;
    }
    try {
      const client = AKURE.getSupabaseClient();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login.html',
      });
      if (error) throw error;
      AKURE.showToast('Password reset email sent! 📧', 'success');
    } catch (err) {
      AKURE.showToast(err.message || 'Failed to send reset email', 'error');
    }
  });
});
