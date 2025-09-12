const express = require('express');

module.exports = (app, db, verifyToken) => {

  // Get all logs
  app.get('/api/logs', verifyToken, (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const stmt = db.prepare(`
        SELECT * FROM logs
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      const logs = stmt.all(parseInt(limit), parseInt(offset));
      res.json(logs);

    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get logs by user
  app.get('/api/logs/user/:email', verifyToken, (req, res) => {
    try {
      const { email } = req.params;
      const { limit = 50 } = req.query;

      const stmt = db.prepare(`
        SELECT * FROM logs
        WHERE user_email = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);

      const logs = stmt.all(email, parseInt(limit));
      res.json(logs);

    } catch (error) {
      console.error('Get user logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get logs by action type
  app.get('/api/logs/action/:action', verifyToken, (req, res) => {
    try {
      const { action } = req.params;
      const { limit = 50 } = req.query;

      const stmt = db.prepare(`
        SELECT * FROM logs
        WHERE action = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);

      const logs = stmt.all(action, parseInt(limit));
      res.json(logs);

    } catch (error) {
      console.error('Get action logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get logs by date range
  app.get('/api/logs/date/:start/:end', verifyToken, (req, res) => {
    try {
      const { start, end } = req.params;

      const stmt = db.prepare(`
        SELECT * FROM logs
        WHERE DATE(timestamp) BETWEEN ? AND ?
        ORDER BY timestamp DESC
      `);

      const logs = stmt.all(start, end);
      res.json(logs);

    } catch (error) {
      console.error('Get date logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Search logs
  app.get('/api/logs/search/:query', verifyToken, (req, res) => {
    try {
      const { query } = req.params;
      const searchTerm = `%${query}%`;

      const stmt = db.prepare(`
        SELECT * FROM logs
        WHERE action LIKE ? OR details LIKE ? OR user_email LIKE ?
        ORDER BY timestamp DESC
        LIMIT 100
      `);

      const logs = stmt.all(searchTerm, searchTerm, searchTerm);
      res.json(logs);

    } catch (error) {
      console.error('Search logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get log statistics
  app.get('/api/logs/stats', verifyToken, (req, res) => {
    try {
      // Total logs count
      const totalStmt = db.prepare('SELECT COUNT(*) as total FROM logs');
      const total = totalStmt.get().total;

      // Logs by action
      const actionStmt = db.prepare(`
        SELECT action, COUNT(*) as count
        FROM logs
        GROUP BY action
        ORDER BY count DESC
      `);
      const actions = actionStmt.all();

      // Logs by user
      const userStmt = db.prepare(`
        SELECT user_email, COUNT(*) as count
        FROM logs
        GROUP BY user_email
        ORDER BY count DESC
      `);
      const users = userStmt.all();

      // Recent activity (last 7 days)
      const recentStmt = db.prepare(`
        SELECT COUNT(*) as recent
        FROM logs
        WHERE timestamp >= datetime('now', '-7 days')
      `);
      const recent = recentStmt.get().recent;

      res.json({
        total_logs: total,
        logs_by_action: actions,
        logs_by_user: users,
        recent_activity: recent
      });

    } catch (error) {
      console.error('Get log stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Manual log entry (for admin purposes)
  app.post('/api/logs', verifyToken, (req, res) => {
    try {
      const { action, details } = req.body;

      if (!action) {
        return res.status(400).json({ message: 'Action is required' });
      }

      const stmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      const result = stmt.run(req.user.email, action, details || '');

      res.status(201).json({
        message: 'Log entry created',
        logId: result.lastInsertRowid
      });

    } catch (error) {
      console.error('Create log error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete old logs (cleanup - admin only)
  app.delete('/api/logs/cleanup/:days', verifyToken, (req, res) => {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { days } = req.params;
      const daysNum = parseInt(days);

      if (isNaN(daysNum) || daysNum < 1) {
        return res.status(400).json({ message: 'Invalid number of days' });
      }

      const stmt = db.prepare("DELETE FROM logs WHERE timestamp < datetime('now', '-? days')");
      const result = stmt.run(daysNum);

      // Log the cleanup action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'CLEANUP_LOGS', `Deleted ${result.changes} logs older than ${daysNum} days`);

      res.json({
        message: 'Old logs cleaned up',
        deleted_count: result.changes
      });

    } catch (error) {
      console.error('Cleanup logs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

};