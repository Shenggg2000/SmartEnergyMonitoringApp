const db = require('./db');
const helper = require('../helper');
const Singleton = require("../Singleton");
const object = Singleton.getInstance();

async function index(query) {
  try {
    let conditions = "";
    if (query.action_datetime) {
      conditions = `WHERE action_datetime >= "${query.action_datetime}"`
    }

    const rows = await db.query(
      `SELECT * FROM task_schedules ${conditions}`
    );

    let taskSchedules = helper.emptyOrRows(rows);

    return { error: false, data: taskSchedules };
  } catch (err) {
    return { error: true };
  }
}

async function store(body) {
  try {
    const result = await db.query(
      `INSERT INTO task_schedules 
        (wall_outlet_id, wall_outlet_identifier, action, action_datetime, is_schedule, created_at) 
        VALUES 
        ("${body.wall_outlet_id}", "${body.wall_outlet_identifier}", "${body.action}", "${body.action_datetime}", "${body.is_schedule}", NOW())`
    );

    if (result.affectedRows > 0) {
      object.resetTasks();
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function update(body, id) {
  try {
    const result = await db.query(
      `UPDATE task_schedules 
      SET action_datetime="${body.action_datetime}", modified_at=NOW() 
      WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function destory(id) {
  try {
    const result = await db.query(
      `DELETE FROM task_schedules WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      object.resetTasks();
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function destoryCountdowning(id) {
  try {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const outputDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const result = await db.query(
      `DELETE FROM task_schedules 
      WHERE wall_outlet_id = "${id}" AND action_datetime >= "${outputDate}" AND is_schedule = "0"`
    );

    if (result.affectedRows > 0) {
      object.resetTasks();
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

module.exports = {
  index,
  store,
  update,
  destory,
  destoryCountdowning
}