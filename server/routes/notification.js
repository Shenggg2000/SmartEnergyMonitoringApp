const express = require('express');
const router = express.Router();
const notification = require('../services/notification');
const helper = require("../helper");

router.get('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await notification.index(req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get notifications error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let result = await notification.show(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get notification error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    let result = await notification.store(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert notification error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/seen/:id', async (req, res) => {
  try {
    let result = await notification.updateSeen(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "update notification seen error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});


module.exports = router;