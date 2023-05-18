const express = require('express');
const router = express.Router();
const helper = require('../helper');
const property = require('../services/property');

router.get('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await property.index(req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get properties error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/summary', helper.authenticateToken, async (req, res) => {
  try {
    let result = await property.showSummary(req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get property error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let result = await property.show(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get property error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/home-usage/:id', async (req, res) => {
  try {
    let result = await property.showUsageHome(req.params.id);
    console.log(result);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get property error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/usage/:id', async (req, res) => {
  try {
    let result = await property.showUsage(req.params.id);
    console.log(result);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get property error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await property.store(req.body, req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert properties error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    let result = await property.update(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update property error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/floor-plan/:id', async (req, res) => {
  try {
    let result = await property.updateFloorPlan(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update property floor plan error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let result = await property.destory(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete properties error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

module.exports = router;