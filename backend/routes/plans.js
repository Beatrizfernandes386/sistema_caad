const express = require('express');

module.exports = (app, db, verifyToken) => {

  // Get all plans with client counts
  app.get('/api/plans', verifyToken, (req, res) => {
    try {
      // Get all plans
      const plansStmt = db.prepare('SELECT * FROM plans ORDER BY plan_name');
      const plans = plansStmt.all();

      // Get client count for each plan
      const countStmt = db.prepare(`
        SELECT plan, COUNT(*) as count
        FROM clients
        WHERE status = 'active'
        GROUP BY plan
      `);
      const clientCounts = countStmt.all();

      // Create a map of plan counts
      const countMap = {};
      clientCounts.forEach(count => {
        countMap[count.plan] = count.count;
      });

      // Add client counts to plans
      const plansWithCounts = plans.map(plan => ({
        ...plan,
        client_count: countMap[plan.plan_name] || 0
      }));

      res.json(plansWithCounts);

    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get plan details by name
  app.get('/api/plans/:name', verifyToken, (req, res) => {
    try {
      const { name } = req.params;
      const stmt = db.prepare('SELECT * FROM plans WHERE plan_name = ?');
      const plan = stmt.get(name);

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.json(plan);

    } catch (error) {
      console.error('Get plan error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create new plan
  app.post('/api/plans', verifyToken, (req, res) => {
    try {
      const { plan_name, benefits } = req.body;

      if (!plan_name) {
        return res.status(400).json({ message: 'Plan name is required' });
      }

      const stmt = db.prepare('INSERT INTO plans (plan_name, benefits) VALUES (?, ?)');
      const result = stmt.run(plan_name, benefits || null);

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'CREATE_PLAN', `Created plan: ${plan_name}`);

      res.status(201).json({
        message: 'Plan created successfully',
        planId: result.lastInsertRowid
      });

    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ message: 'Plan name already exists' });
      }
      console.error('Create plan error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update plan
  app.put('/api/plans/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;
      const { plan_name, benefits } = req.body;

      const stmt = db.prepare('UPDATE plans SET plan_name = ?, benefits = ? WHERE id = ?');
      const result = stmt.run(plan_name, benefits, id);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'UPDATE_PLAN', `Updated plan: ${plan_name}`);

      res.json({ message: 'Plan updated successfully' });

    } catch (error) {
      console.error('Update plan error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete plan
  app.delete('/api/plans/:id', verifyToken, (req, res) => {
    try {
      const { id } = req.params;

      // Check if plan has active clients
      const checkStmt = db.prepare('SELECT COUNT(*) as count FROM clients WHERE plan = (SELECT plan_name FROM plans WHERE id = ?) AND status = ?');
      const result = checkStmt.get(id, 'active');

      if (result.count > 0) {
        return res.status(400).json({ message: 'Cannot delete plan with active clients' });
      }

      const deleteStmt = db.prepare('DELETE FROM plans WHERE id = ?');
      const deleteResult = deleteStmt.run(id);

      if (deleteResult.changes === 0) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'DELETE_PLAN', `Deleted plan ID: ${id}`);

      res.json({ message: 'Plan deleted successfully' });

    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get clients by plan
  app.get('/api/plans/:name/clients', verifyToken, (req, res) => {
    try {
      const { name } = req.params;
      const stmt = db.prepare('SELECT * FROM clients WHERE plan = ? AND status = ? ORDER BY name');
      const clients = stmt.all(name, 'active');
      res.json(clients);
    } catch (error) {
      console.error('Get clients by plan error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update plan benefits (for MASTER plan features)
  app.patch('/api/plans/:name/benefits', verifyToken, (req, res) => {
    try {
      const { name } = req.params;
      const { benefits } = req.body;

      const stmt = db.prepare('UPDATE plans SET benefits = ? WHERE plan_name = ?');
      const result = stmt.run(JSON.stringify(benefits), name);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Log the action
      const logStmt = db.prepare('INSERT INTO logs (user_email, action, details) VALUES (?, ?, ?)');
      logStmt.run(req.user.email, 'UPDATE_PLAN_BENEFITS', `Updated benefits for plan: ${name}`);

      res.json({ message: 'Plan benefits updated successfully' });

    } catch (error) {
      console.error('Update plan benefits error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

};