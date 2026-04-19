/* =====================================================
   AKURE – Auth Module (auth.js)
   Uses Supabase JS Client (loaded via CDN in HTML)
   ===================================================== */

// Supabase is loaded via CDN <script> in every HTML page
// The client is initialized once here
let _supabase = null;


// Ensure the stub wrapper handles methods to avoid null exceptions
const mockAuthClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => { throw new Error('Supabase is not configured yet.'); },
    signUp: async () => { throw new Error('Supabase is not configured yet.'); },
    signOut: async () => { throw new Error('Supabase is not configured yet.'); },
    resetPasswordForEmail: async () => { throw new Error('Supabase is not configured yet.'); },
    onAuthStateChange: () => {},
  }
};

function getSupabaseClient() {
  if (!_supabase) {
    const SUPABASE_URL  = window.__AKURE_ENV__?.SUPABASE_URL  || '';
    const SUPABASE_ANON = window.__AKURE_ENV__?.SUPABASE_ANON || '';
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      console.warn('[AKURE] Supabase env vars missing. Auth features disabled.');
      return mockAuthClient;
    }
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _supabase;
}

async function getSession() {
  const client = getSupabaseClient();
  if (!client || !client.auth) return null;
  
  try {
    const { data } = await client.auth.getSession();
    return data?.session || null;
  } catch (err) {
    console.warn('[AKURE] Supabase session error:', err.message);
    return null;
  }
}

async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

async function login(email, password) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function register(email, password, fullName) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

async function logout() {
  const client = getSupabaseClient();
  await client.auth.signOut();
  window.location.href = '/login.html';
}

// Listen for auth state changes (called once per page)
function onAuthChange(callback) {
  const client = getSupabaseClient();
  if (!client) return;
  client.auth.onAuthStateChange((_event, session) => callback(session));
}

// Redirect to login if no session
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
  return session;
}

// Export
window.AKURE = window.AKURE || {};
Object.assign(window.AKURE, {
  getSupabaseClient, getSession, getUser,
  login, register, logout, onAuthChange, requireAuth,
});

