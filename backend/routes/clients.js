const express = require('express');

module.exports = (app, db, verifyToken) => {

  // Get all active clients
  app.get('/api/clients/active', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM clients WHERE status = ? ORDER BY created_at DESC');
      const clients = stmt.all('active');
      res.json(clients);
    } catch (error) {
      console.error('Get active clients error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all canceled clients
  app.get('/api/clients/canceled', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM clients WHERE status = ? ORDER BY created_at DESC');
      const clients = stmt.all('canceled');
      res.json(clients);
    } catch (error) {
      console.error('Get canceled clients error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Add new client
  app.post('/api/clients', verifyToken, (req, res) => {
    try {
      const { name, plan, vehicle, model, imei, line, service, date } = req.body;

      // Validate required fields
      if (!name || !plan || !vehicle || !model || !imei || !service || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if IMEI exists in new equipment and move to used
      const checkStmt = db.prepare('SELECT * FROM equipment_new WHERE imei = ?');
      const equipment = checkStmt.get(imei);

      if (!equipment) {
        return res.status(400).json({ message: 'Equipment not found in inventory' });
      }

      // Move equipment from new to used
      const insertUsedStmt = db.prepare('INSERT INTO equipment_used (model, imei, line) VALUES (?, ?, ?)');
      insertUsedStmt.run(equipment.model, equipment.imei, line);

      // Remove from new equipment
      const deleteStmt = db.prepare('DELETE FROM equipment_new WHERE imei = ?');
      deleteStmt.run(imei);

      // If line is provided, mark SIM card as used
      if (line) {
        const updateSimStmt = db.prepare('UPDATE sim_cards SET status = ? WHERE line = ?');
        updateSimStmt.run('used', line);
      }

      // Insert client
      const stmt = db.prepare(`
        INSERT INTO clients (name, plan, vehicle, model, imei, line, service, date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name, plan, vehicle, model, imei, line, service, date, 'active');

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'CREATE_CLIENT', `Created client: ${name}`);

      res.status(201).json({
        message: 'Client created successfully',
        clientId: result.lastInsertRowid
      });

    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update client
  app.put('/api/clients/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;
      const { name, plan, vehicle, model, imei, line, service } = req.body;

      const stmt = db.prepare(`
        UPDATE clients SET name = ?, plan = ?, vehicle = ?, model = ?, imei = ?, line = ?, service = ?
        WHERE id = ? AND status = 'active'
      `);
      const result = stmt.run(name, plan, vehicle, model, imei, line, service, id);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'UPDATE_CLIENT', `Updated client ID: ${id}`);

      res.json({ message: 'Client updated successfully' });

    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Cancel client (move to canceled)
  app.delete('/api/clients/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;
      const { reason, cancelDate } = req.body;

      // Get client info
      const getStmt = db.prepare('SELECT * FROM clients WHERE id = ? AND status = ?');
      const client = getStmt.get(id, 'active');

      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Move equipment back to used inventory
      const insertUsedStmt = db.prepare('INSERT INTO equipment_used (model, imei, line) VALUES (?, ?, ?)');
      insertUsedStmt.run(client.model, client.imei, client.line);

      // Update client status
      const updateStmt = db.prepare('UPDATE clients SET status = ? WHERE id = ?');
      updateStmt.run('canceled', id);

      // Create canceled client record with reason
      const insertCanceledStmt = db.prepare(`
        INSERT INTO clients (name, plan, vehicle, model, imei, line, service, date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertCanceledStmt.run(
        client.name,
        client.plan,
        client.vehicle,
        client.model,
        client.imei,
        client.line,
        `CANCELADO - ${reason}`,
        cancelDate || new Date().toISOString().split('T')[0],
        'canceled'
      );

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'CANCEL_CLIENT', `Canceled client: ${client.name} - Reason: ${reason}`);

      res.json({ message: 'Client canceled successfully' });

    } catch (error) {
      console.error('Cancel client error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Import clients from JSON
  app.post('/api/clients/import', verifyToken, (req, res) => {
    try {
      const clients = req.body;

      if (!Array.isArray(clients)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      const stmt = db.prepare(`
        INSERT INTO clients (name, plan, vehicle, model, imei, line, service, date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let imported = 0;
      for (const client of clients) {
        try {
          stmt.run(
            client.name,
            client.plan,
            client.vehicle,
            client.model,
            client.imei,
            client.line,
            client.service,
            client.date,
            'active'
          );
          imported++;
        } catch (error) {
          console.error('Error importing client:', client, error);
        }
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'IMPORT_CLIENTS', `Imported ${imported} clients`);

      res.json({ message: `Imported ${imported} clients successfully` });

    } catch (error) {
      console.error('Import clients error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

};
