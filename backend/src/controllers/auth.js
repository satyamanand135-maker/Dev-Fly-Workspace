// backend/src/controllers/auth.js
import axios from 'axios';

export const githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided from GitHub' });
  }

  try {
    // 1. Exchange temporary code for an access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      return res.status(400).json({ error: error_description });
    }

    // 2. Securely drop the access token into an HTTP-only cookie
    res.cookie('gh_access_token', access_token, {
      httpOnly: true, // Prevents client-side scripts from reading this cookie
      secure: process.env.NODE_ENV === 'production', // Only sends over HTTPS in prod
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
    });

    // 3. Smooth redirect back to your Vite frontend's connect page
    const clientOrigin = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    return res.redirect(`${clientOrigin}/connect`);

  } catch (err) {
    console.error('OAuth Exchange Error:', err.message);
    return res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
};