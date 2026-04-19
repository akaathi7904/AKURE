const { createClient } = require('@supabase/supabase-js');

// Creates a per-request Supabase client from the user's JWT
const createUserClient = (token) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const supabaseUser = createUserClient(token);
    const { data: { user }, error } = await supabaseUser.auth.getUser();
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.user = user;
    req.userClient = supabaseUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

module.exports = authMiddleware;
