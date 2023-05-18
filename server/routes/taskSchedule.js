const express = require('express');
const router = express.Router();
const helper = require('../helper');
const taskSchedules = require('../services/taskSchedule');

router.get('/', async (req, res) => {
  try {
    let result = await taskSchedules.index();
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get task schedules error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await taskSchedules.store(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert task schedule error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    let result = await taskSchedules.update(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update task schedule error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let result = await taskSchedules.destory(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete task schedules error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/countdown/:id', async (req, res) => {
  try {
    let result = await taskSchedules.destoryCountdowning(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete task schedules error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

module.exports = router;