import axios from 'axios';

const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');

export const connectX = (req, res) => {
  const rootUrl = 'https://twitter.com/i/oauth2/authorize';
  const options = {
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID,
    redirect_uri: process.env.X_REDIRECT_URI,
    scope: 'tweet.read tweet.write users.read offline.access',
    state: 'secure_state_string_x',
    code_challenge: 'challenge', // Real OAuth 2.0 PKCE requires proper base64 implementation
    code_challenge_method: 'plain'
  };
  return res.redirect(`${rootUrl}?${new URLSearchParams(options).toString()}`);
};

export const xCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${clientOrigin}/connect?error=x_denied`);

  try {
    // Exchange callback token code here via axios post...
    const fake_access_token = "mock_x_token_secure_hash";

    res.cookie('x_access_token', fake_access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 * 24 * 30
    });
    return res.redirect(`${clientOrigin}/connect`);
  } catch (err) {
    return res.redirect(`${clientOrigin}/connect?error=x_fault`);
  }
};