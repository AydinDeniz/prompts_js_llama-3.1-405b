const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('redis');

const app = express();

// Set up Redis for token storage
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window per minute
});

// Apply rate limiting to all routes
app.use(limiter);

// Set up OAuth2 client
const oAuth2Client = new OAuth2Client(
  'your_client_id',
  'your_client_secret',
  'your_redirect_uri'
);

// Generate a new signing key every hour
setInterval(() => {
  const signingKey = crypto.randomBytes(32).toString('base64');
  // Store the new signing key in Redis
  redis.set('signing_key', signingKey);
}, 60 * 60 * 1000); // 1 hour

// Define the token endpoint
app.post('/token', async (req, res) => {
  try {
    const grantType = req.body.grant_type;
    const code = req.body.code;
    const redirectUri = req.body.redirect_uri;
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;

    // Handle authorization code grant type with PKCE
    if (grantType === 'authorization_code') {
      // Verify the authorization code
      const tokenResponse = await oAuth2Client.getToken(code, redirectUri);
      const token = tokenResponse.tokens;

      // Generate a new refresh token
      const refreshToken = uuidv4();

      // Store the refresh token in Redis
      await redis.set(`refresh_token:${refreshToken}`, token.refresh_token);

      // Generate a new access token
      const accessToken = jwt.sign(
        {
          sub: token.sub,
          scope: token.scope,
        },
        await redis.get('signing_key'),
        {
          expiresIn: '1h',
        }
      );

      // Return the access token and refresh token
      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }

    // Handle client credentials grant type
    if (grantType === 'client_credentials') {
      // Verify the client credentials
      if (clientId !== 'your_client_id' || clientSecret !== 'your_client_secret') {
        return res.status(401).json({ error: 'Invalid client credentials' });
      }

      // Generate a new access token
      const accessToken = jwt.sign(
        {
          sub: 'your_service_account',
          scope: 'your_scope',
        },
        await redis.get('signing_key'),
        {
          expiresIn: '1h',
        }
      );

      // Return the access token
      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }
  } catch (error) {
    // Log the error
    console.error(error);

    // Return an error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define the refresh token endpoint
app.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;

    // Verify the refresh token
    const storedRefreshToken = await redis.get(`refresh_token:${refreshToken}`);
    if (!storedRefreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      {
        sub: 'your_user',
        scope: 'your_scope',
      },
      await redis.get('signing_key'),
      {
        expiresIn: '1h',
      }
    );

    // Return the access token
    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    });
  } catch (error) {
    // Log the error
    console.error(error);

    // Return an error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define the role-based access control middleware
const rbacMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the access token
    const decodedToken = jwt.verify(accessToken, await redis.get('signing_key'));
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    // Get the user's role from the decoded token
    const role = decodedToken.role;

    // Check if the user has the required role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Call the next middleware
    next();
  } catch (error) {
    // Log the error
    console.error(error);

    // Return an error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Apply the RBAC middleware to all routes
app.use(rbacMiddleware);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});