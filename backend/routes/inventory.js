const express = require('express');

module.exports = (app, db, verifyToken) => {

  // Get all new equipment
  app.get('/api/inventory/new', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM equipment_new ORDER BY created_at DESC');
      const equipment = stmt.all();
      res.json(equipment);
    } catch (error) {
      console.error('Get new equipment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all used equipment
  app.get('/api/inventory/used', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM equipment_used ORDER BY created_at DESC');
      const equipment = stmt.all();
      res.json(equipment);
    } catch (error) {
      console.error('Get used equipment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all SIM cards
  app.get('/api/inventory/sim-cards', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM sim_cards ORDER BY created_at DESC');
      const simCards = stmt.all();
      res.json(simCards);
    } catch (error) {
      console.error('Get SIM cards error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get lost equipment
  app.get('/api/inventory/lost', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM lost_equipment ORDER BY created_at DESC');
      const lostEquipment = stmt.all();
      res.json(lostEquipment);
    } catch (error) {
      console.error('Get lost equipment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Add new equipment
  app.post('/api/inventory/equipment', verifyToken, (req, res) => {
    try {
      const { model, imei } = req.body;

      if (!model || !imei) {
        return res.status(400).json({ message: 'Model and IMEI are required' });
      }

      const stmt = db.prepare('INSERT INTO equipment_new (model, imei) VALUES (?, ?)');
      const result = stmt.run(model, imei);

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'ADD_EQUIPMENT', `Added new equipment: ${model} - ${imei}`);

      res.status(201).json({
        message: 'Equipment added successfully',
        equipmentId: result.lastInsertRowid
      });

    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ message: 'IMEI already exists' });
      }
      console.error('Add equipment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Add SIM card
  app.post('/api/inventory/sim-card', verifyToken, (req, res) => {
    try {
      const { line, status = 'available' } = req.body;

      if (!line) {
        return res.status(400).json({ message: 'Line number is required' });
      }

      const stmt = db.prepare('INSERT INTO sim_cards (line, status) VALUES (?, ?)');
      const result = stmt.run(line, status);

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'ADD_SIM_CARD', `Added SIM card: ${line}`);

      res.status(201).json({
        message: 'SIM card added successfully',
        simCardId: result.lastInsertRowid
      });

    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ message: 'Line number already exists' });
      }
      console.error('Add SIM card error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Remove equipment (move to lost)
  app.delete('/api/inventory/equipment/:imei', verifyToken, (req, res) => {
    try {
      const { imei } = req.params;
      const { reason, date } = req.body;

      // Find equipment in new or used
      let equipment = null;
      let sourceTable = '';

      const newStmt = db.prepare('SELECT * FROM equipment_new WHERE imei = ?');
      equipment = newStmt.get(imei);
      if (equipment) {
        sourceTable = 'new';
      } else {
        const usedStmt = db.prepare('SELECT * FROM equipment_used WHERE imei = ?');
        equipment = usedStmt.get(imei);
        if (equipment) {
          sourceTable = 'used';
        }
      }

      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      // Move to lost equipment
      const insertLostStmt = db.prepare(`
        INSERT INTO lost_equipment (model, imei, line, reason, date)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertLostStmt.run(
        equipment.model,
        equipment.imei,
        equipment.line || null,
        reason,
        date || new Date().toISOString().split('T')[0]
      );

      // Remove from source table
      if (sourceTable === 'new') {
        const deleteStmt = db.prepare('DELETE FROM equipment_new WHERE imei = ?');
        deleteStmt.run(imei);
      } else {
        const deleteStmt = db.prepare('DELETE FROM equipment_used WHERE imei = ?');
        deleteStmt.run(imei);
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'REMOVE_EQUIPMENT', `Removed equipment: ${imei} - Reason: ${reason}`);

      res.json({ message: 'Equipment removed and moved to lost items' });

    } catch (error) {
      console.error('Remove equipment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get available IMEIs for client registration
  app.get('/api/inventory/available-imeis', verifyToken, (req, res) => {
    try {
      const stmt = db.prepare('SELECT model, imei FROM equipment_new ORDER BY model');
      const imeis = stmt.all();
      res.json(imeis);
    } catch (error) {
      console.error('Get available IMEIs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get available SIM cards for client registration
  app.get('/api/inventory/available-sim-cards', verifyToken, (req, res) => {
    try {
      // Buscar por múltiplos status possíveis para compatibilidade
      const stmt = db.prepare('SELECT line FROM sim_cards WHERE status IN (?, ?) ORDER BY line');
      const simCards = stmt.all('available', 'DISPONÍVEL');
      res.json(simCards);
    } catch (error) {
      console.error('Get available SIM cards error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

};
