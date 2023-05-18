const express = require('express');
const router = express.Router();
const helper = require('../helper');
const room = require('../services/room');

router.get('/', async (req, res) => {
  try {
    let result = await room.index(req.query);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get rooms error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let result = await room.show(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get room error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/usage/:id', async (req, res) => {
  try {
    let result = await room.showUsage(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get room error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await room.store(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert rooms error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    let result = await room.update(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update room error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/floor-plan/:id', async (req, res) => {
  try {
    let result = await room.updateFloorPlan(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update room floor plan error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let result = await room.destory(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete rooms error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

module.exports = router;