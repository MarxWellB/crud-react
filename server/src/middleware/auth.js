import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload; // { sub, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
