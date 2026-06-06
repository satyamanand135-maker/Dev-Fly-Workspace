// backend/src/controllers/linkedin.js
import axios from 'axios';

// 🚨 Notice the 'export' keyword right before 'const'
export const connectLinkedIn = (req, res) => {
  const rootUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  
  const options = {
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    state: 'secure_random_state_string', 
    scope: 'openid profile email', 
  };

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
};

// 🚨 Notice the 'export' keyword here too
export const linkedinCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('http://localhost:5173/connect?error=auth_failed');
  }

  try {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = response.data;

    // Save the token in a cookie so frontend can see it
    res.cookie('li_access_token', access_token, {
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 * 24 * 30 // 30 Days
    });

    return res.redirect('http://localhost:5173/connect');

  } catch (error) {
    console.error('LinkedIn OAuth Processing Error:', error.response?.data || error.message);
    return res.redirect('http://localhost:5173/connect?error=server_fault');
  }
};