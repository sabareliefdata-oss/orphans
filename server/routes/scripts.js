const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authenticateToken, requireRole } = require('../auth');
const { generateScriptsDocx } = require('../utils/docx_export');

// GET /api/scripts - List scripts with search & filter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;
    const scripts = await DB.getScripts({ status, search, limit, offset });
    res.json({ scripts });
  } catch (err) {
    console.error('Error fetching scripts:', err);
    res.status(500).json({ error: 'Failed to retrieve scripts.' });
  }
});

// GET /api/scripts/stats - Dashboard summary stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await DB.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// GET /api/scripts/export/word - Export scripts as Word .docx
router.get('/export/word', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const filterStatus = status || 'approved';
    const scripts = await DB.getScripts({ status: filterStatus === 'all' ? null : filterStatus, limit: 5000 });

    const title = filterStatus === 'approved'
      ? "One Nation - Reviewed & Approved Orphan Video Scripts"
      : "One Nation - Orphan Video Scripts Export";

    const docxBuffer = await generateScriptsDocx(scripts, title);

    const filename = `One_Nation_Orphan_Scripts_${filterStatus}_${Date.now()}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export Word document.' });
  }
});

// GET /api/scripts/:id - Get single script
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const script = await DB.getScriptById(req.params.id);
    if (!script) {
      return res.status(404).json({ error: 'Script not found.' });
    }
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch script.' });
  }
});

// POST /api/scripts - Create new script (Admin/Translator)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { orphan_code, child_name, script_text, notes } = req.body;
    if (!script_text) {
      return res.status(400).json({ error: 'Script text is required.' });
    }

    const created = await DB.createScript({
      orphan_code,
      child_name,
      script_text,
      notes,
      status: 'waiting'
    });

    res.status(201).json({ script: created, message: 'Script created successfully in Waiting status.' });
  } catch (err) {
    console.error('Error creating script:', err);
    res.status(500).json({ error: 'Failed to create script.' });
  }
});

// PUT /api/scripts/:id - Update script text or details
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { script_text, child_name, orphan_code, notes, status } = req.body;
    const updated = await DB.updateScript(
      req.params.id,
      { script_text, child_name, orphan_code, notes, status },
      req.user
    );

    if (!updated) {
      return res.status(404).json({ error: 'Script not found.' });
    }

    res.json({ script: updated, message: 'Script updated successfully.' });
  } catch (err) {
    console.error('Error updating script:', err);
    res.status(500).json({ error: 'Failed to update script.' });
  }
});

// PATCH /api/scripts/:id/status - Update status (Approve / Return to Waiting)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!status || !['waiting', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be waiting or approved.' });
    }

    const updated = await DB.updateScript(
      req.params.id,
      { status, notes },
      req.user
    );

    if (!updated) {
      return res.status(404).json({ error: 'Script not found.' });
    }

    const statusMessage = status === 'approved' ? 'Marked as Reviewed & Approved (Green)' : 'Returned to Waiting for Review (Yellow)';
    res.json({ script: updated, message: statusMessage });
  } catch (err) {
    console.error('Error changing status:', err);
    res.status(500).json({ error: 'Failed to change script status.' });
  }
});

// DELETE /api/scripts/:id - Delete script (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const deleted = await DB.deleteScript(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Script not found.' });
    }
    res.json({ message: 'Script deleted successfully.' });
  } catch (err) {
    console.error('Error deleting script:', err);
    res.status(500).json({ error: 'Failed to delete script.' });
  }
});

// POST /api/scripts/resequence - Resequence all serial numbers (Admin only)
router.post('/resequence', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const count = await DB.resequenceSerials();
    res.json({ message: `Successfully re-sequenced ${count} scripts.` });
  } catch (err) {
    console.error('Error resequencing:', err);
    res.status(500).json({ error: 'Failed to resequence.' });
  }
});

module.exports = router;
