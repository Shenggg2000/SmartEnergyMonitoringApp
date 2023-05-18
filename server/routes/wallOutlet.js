const express = require('express');
const router = express.Router();
const helper = require('../helper');
const wallOutlet = require('../services/wallOutlet');

router.get('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await wallOutlet.index(req.query, req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get wall outlets error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let result = await wallOutlet.show(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.get('/usage/:id', async (req, res) => {
  try {
    let result = await wallOutlet.showUsage(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Get wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await wallOutlet.store(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.post('/schedules', async (req, res) => {
  try {
    let result = await wallOutlet.storeSchedule(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Insert wall outlet's schedule error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    let result = await wallOutlet.update(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/daily/:id', helper.authenticateToken, async (req, res) => {
  try {
    let result = await wallOutlet.updateDaily(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update wall outlet daily alert error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/monthly/:id', helper.authenticateToken, async (req, res) => {
  try {
    let result = await wallOutlet.updateMonthly(req.body, req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update wall outlet monthly alert error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/schedules/:id', async (req, res) => {
  try {
    let result = await wallOutlet.updateSchedule(req.body, req.params.id);
    
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update wall outlet schedule error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/on/:id', async (req, res) => {
  try {
    let result = await wallOutlet.switchOn(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch on wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/off/:id', async (req, res) => {
  try {
    let result = await wallOutlet.switchOff(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch off wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/likely/on', async (req, res) => {
  try {
    let result = await wallOutlet.switchOnLikely(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch on wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/likely/off', async (req, res) => {
  try {
    let result = await wallOutlet.switchOffLikely(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch off wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/set-quick-access/:id', async (req, res) => {
  try {
    let result = await wallOutlet.setQuickAccess(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch off wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.put('/unset-quick-access/:id', async (req, res) => {
  try {
    let result = await wallOutlet.unsetQuickAccess(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Switch off wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let result = await wallOutlet.destory(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    let result = await wallOutlet.destorySchedule(req.params.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "delete wall outlet error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error`, err.message);
  }
});

module.exports = router;