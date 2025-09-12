const express = require('express');

module.exports = (app, db, bcrypt, jwt, JWT_SECRET, verifyToken) => {

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Register endpoint (for admin to create users)
  app.post('/api/auth/register', verifyToken, async (req, res) => {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { email, password, role = 'viewer' } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
      const result = stmt.run(email, hashedPassword, role);

      res.status(201).json({
        message: 'User created successfully',
        userId: result.lastInsertRowid
      });

    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      console.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user info
  app.get('/api/auth/me', verifyToken, (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  });

  // Logout (client-side token removal)
  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

};
