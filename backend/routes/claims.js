const express = require('express');

module.exports = (app, db, verifyToken) => {

  // Get all claims
  app.get('/api/claims', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM claims ORDER BY created_at DESC');
      const claims = stmt.all();
      res.json(claims);
    } catch (error) {
      console.error('Get claims error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get claim by ID
  app.get('/api/claims/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('SELECT * FROM claims WHERE id = ?');
      const claim = stmt.get(id);

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      res.json(claim);

    } catch (error) {
      console.error('Get claim error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create new claim
  app.post('/api/claims', verifyToken, (req, res) => {
    try {
      const {
        client,
        vehicle_model,
        incident_location,
        incident_date,
        report_time,
        operation_hours,
        operation_minutes,
        recovery_location,
        report
      } = req.body;

      // Validate required fields
      if (!client || !vehicle_model || !incident_location || !incident_date || !report_time || !recovery_location || !report) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const stmt = db.prepare(`
        INSERT INTO claims (
          client, vehicle_model, incident_location, incident_date, report_time,
          operation_hours, operation_minutes, recovery_location, report
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        client,
        vehicle_model,
        incident_location,
        incident_date,
        report_time,
        operation_hours || 0,
        operation_minutes || 0,
        recovery_location,
        report
      );

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'CREATE_CLAIM', `Created claim for client: ${client}`);

      res.status(201).json({
        message: 'Claim created successfully',
        claimId: result.lastInsertRowid
      });

    } catch (error) {
      console.error('Create claim error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update claim
  app.put('/api/claims/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;
      const {
        client,
        vehicle_model,
        incident_location,
        incident_date,
        report_time,
        operation_hours,
        operation_minutes,
        recovery_location,
        report
      } = req.body;

      const stmt = db.prepare(`
        UPDATE claims SET
          client = ?, vehicle_model = ?, incident_location = ?, incident_date = ?,
          report_time = ?, operation_hours = ?, operation_minutes = ?,
          recovery_location = ?, report = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        client,
        vehicle_model,
        incident_location,
        incident_date,
        report_time,
        operation_hours || 0,
        operation_minutes || 0,
        recovery_location,
        report,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'UPDATE_CLAIM', `Updated claim ID: ${id}`);

      res.json({ message: 'Claim updated successfully' });

    } catch (error) {
      console.error('Update claim error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete claim
  app.delete('/api/claims/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;

      const stmt = db.prepare('DELETE FROM claims WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'DELETE_CLAIM', `Deleted claim ID: ${id}`);

      res.json({ message: 'Claim deleted successfully' });

    } catch (error) {
      console.error('Delete claim error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Search claims
  app.get('/api/claims/search/:query', verifyToken, (req, res) => {
    try {
      const { query } = req.params;
      const searchTerm = `%${query}%`;

      const stmt = db.prepare(`
        SELECT * FROM claims
        WHERE client LIKE ? OR vehicle_model LIKE ? OR incident_location LIKE ?
        ORDER BY created_at DESC
      `);

      const claims = stmt.all(searchTerm, searchTerm, searchTerm);
      res.json(claims);

    } catch (error) {
      console.error('Search claims error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get claims by date range
  app.get('/api/claims/date/:start/:end', verifyToken, (req, res) => {
    try {
      const { start, end } = req.params;

      const stmt = db.prepare(`
        SELECT * FROM claims
        WHERE incident_date BETWEEN ? AND ?
        ORDER BY incident_date DESC
      `);

      const claims = stmt.all(start, end);
      res.json(claims);

    } catch (error) {
      console.error('Get claims by date error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Export claims to JSON
  app.get('/api/claims/export', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM claims ORDER BY created_at DESC');
      const claims = stmt.all();

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'EXPORT_CLAIMS', `Exported ${claims.length} claims`);

      res.json({
        export_date: new Date().toISOString(),
        total_claims: claims.length,
        claims: claims
      });

    } catch (error) {
      console.error('Export claims error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

};