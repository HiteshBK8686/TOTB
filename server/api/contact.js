const express = require('express');

const ContactInquiry = require('../models/ContactInquiry');

const router = express.Router();

router.post('/add_contact_inquiry', async (req, res) => {
  try {
    await ContactInquiry.create(req.body);
    res.json({status:'ok'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;