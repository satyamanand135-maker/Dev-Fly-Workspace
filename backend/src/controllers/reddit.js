import axios from 'axios';

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export const connectReddit = (req, res) => {
  const rootUrl = 'https://www.reddit.com/api/v1/authorize';
  const options = {
    client_id: process.env.REDDIT_CLIENT_ID,
    response_type: 'code',
    state: 'secure_state_string_reddit',
    redirect_uri: process.env.REDDIT_REDIRECT_URI,
    duration: 'permanent',
    scope: 'submit identity'
  };
  return res.redirect(`${rootUrl}?${new URLSearchParams(options).toString()}`);
};

export const redditCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${clientOrigin}/connect?error=reddit_denied`);

  try {
    // Exchange callback token code here via axios post...
    const fake_access_token = "mock_reddit_token_secure_hash";

    res.cookie('reddit_access_token', fake_access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 * 24 * 30
    });
    return res.redirect(`${clientOrigin}/connect`);
  } catch (err) {
    return res.redirect(`${clientOrigin}/connect?error=reddit_fault`);
  }
};