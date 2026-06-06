import axios from 'axios';

// ─── FETCH USER REPOSITORIES ──────────────────────────────────────────────────
export const getUserRepos = async (req, res) => {
  // 1. Grab the secure cookie dropped during authentication
  const token = req.cookies.gh_access_token;

  if (!token) {
    return res.status(401).json({ error: 'User is not authenticated with GitHub' });
  }

  try {
    // 2. Query GitHub's official REST API on behalf of the user
    const githubResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated', // Shows projects worked on most recently first
        per_page: 20,    // Pulls top 20 repositories
      }
    });

    // 3. Filter and map the raw payload down to only the clean data the UI needs
    const cleanRepos = githubResponse.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      owner: repo.owner.login
    }));

    return res.json(cleanRepos);

  } catch (err) {
    console.error('Error fetching repositories from GitHub:', err.message);
    return res.status(500).json({ error: 'Failed to extract GitHub repositories' });
  }
};

// ─── FETCH REAL COMMIT RECORDS ────────────────────────────────────────────────
export const getRepoCommits = async (req, res) => {
  const token = req.cookies.gh_access_token;
  const { repo_name } = req.params; // Captures the dynamic repo name parameter from the URL

  if (!token) {
    return res.status(401).json({ error: 'User is not authenticated with GitHub' });
  }

  try {
    // 1. Fetch the user profile to identify the owner scope of the repository
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    const username = userResponse.data.login;

    console.log(`[GitHub API] Syncing recent commit matrix for: ${username}/${repo_name}`);

    // 2. Query GitHub's commit timelines endpoint
    const commitsResponse = await axios.get(`https://api.github.com/repos/${username}/${repo_name}/commits`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        per_page: 15, // Syncs down the 15 most recent commits
      }
    });

    // 3. Restructure down to the payload architecture expected by DevPost.jsx
    const cleanCommits = commitsResponse.data.map((item, index) => {
      const shortSha = item.sha.substring(0, 7);
      return {
        id: `commit_${index}_${shortSha}`,
        sha: shortSha,
        time: 'Recently', 
        message: item.commit.message || 'No commit message provided',
        files: (index % 3) + 1 // Inline execution mock for altered files count
      };
    });

    return res.json(cleanCommits);

  } catch (err) {
    console.error(`Error fetching commits for ${repo_name}:`, err.message);
    return res.status(err.response?.status || 500).json({ 
      error: `Failed to extract commit records for ${repo_name}` 
    });
  }
};