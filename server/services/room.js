const db = require('./db');
const helper = require('../helper');
const wallOutlet = require('./wallOutlet');

async function index(query) {
  try {
    let conditions = "";
    if (query.property_id) {
      conditions = `WHERE property_id = "${query.property_id}"`
    }

    const rows = await db.query(
      `SELECT rooms.*, room_floor_plans.data, COUNT(wall_outlets.id) AS num_wall_outlets FROM rooms 
      LEFT JOIN wall_outlets ON wall_outlets.room_id = rooms.id
      LEFT JOIN room_floor_plans ON rooms.room_floor_plan_id = room_floor_plans.id
      ${conditions}
      GROUP BY rooms.id`
    );

    let rooms = helper.emptyOrRows(rows);

    return { error: false, data: rooms };
  } catch (err) {
    return { error: true };
  }
}

async function show(id) {
  try {
    const rows = await db.query(
      `SELECT rooms.id, rooms.property_id, rooms.room_name, room_floor_plans.data, rooms.modified_at, rooms.created_at
      FROM rooms
      LEFT JOIN room_floor_plans ON rooms.room_floor_plan_id = room_floor_plans.id
      WHERE rooms.id = "${id}" LIMIT 1`
    );

    let rooms = helper.emptyOrRows(rows);

    return { error: false, data: rooms[0] };
  } catch (err) {
    return { error: true };
  }
}

async function showUsage(id) {
  try {
    const rows = await db.query(
      `SELECT wall_outlets.id
      FROM rooms
      LEFT JOIN wall_outlets ON wall_outlets.room_id = rooms.id
      WHERE rooms.id = "${id}"`
    );

    let wallOutlets = helper.emptyOrRows(rows);

    let roomUsage = {
      weeklyTotalPower: 0,
      weeklyTotalBill: 0,
      weeklyPower: [0, 0, 0, 0, 0, 0, 0],
      weeklyBill: [0, 0, 0, 0, 0, 0, 0],
      monthlyTotalPower: 0,
      monthlyTotalBill: 0,
      monthlyPower: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyBill: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ratio: {
        weekly: [],
        monthly: []
      },
    };

    for (let i = 0; i < wallOutlets.length; i++) {
      let wallOutletUsage = await wallOutlet.showUsage(wallOutlets[i].id);
      console.log(wallOutletUsage);
      let usage = wallOutletUsage.data;
      roomUsage.weeklyTotalPower += usage.weeklyTotalPower;
      roomUsage.weeklyTotalBill += usage.weeklyTotalBill;
      roomUsage.monthlyTotalPower += usage.monthlyTotalPower;
      roomUsage.monthlyTotalBill += usage.monthlyTotalBill;
      roomUsage.ratio.weekly.push({
        id: wallOutlets[i].id,
        power: usage.weeklyTotalPower,
        bill: usage.weeklyTotalBill,
      })
      roomUsage.ratio.monthly.push({
        id: wallOutlets[i].id,
        power: usage.monthlyTotalPower,
        bill: usage.monthlyTotalBill,
      })
      if (usage.weeklyPower.length == 7) {
        roomUsage.weeklyPower = roomUsage.weeklyPower.map((num, idx) => num + usage.weeklyPower[idx])
      }
      if (usage.weeklyBill.length == 7) {
        roomUsage.weeklyBill = roomUsage.weeklyBill.map((num, idx) => num + usage.weeklyBill[idx])
      }
      if (usage.monthlyPower.length == 31) {
        roomUsage.monthlyPower = roomUsage.monthlyPower.map((num, idx) => num + usage.monthlyPower[idx])
      }
      if (usage.monthlyBill.length == 31) {
        roomUsage.monthlyBill = roomUsage.monthlyBill.map((num, idx) => num + usage.monthlyBill[idx])
      }
    }
    return { error: false, data: roomUsage };
  } catch (err) {
    return { error: true };
  }
}

async function store(body) {
  try {
    let floorPlanId;
    const result = await db.query(
      `INSERT INTO room_floor_plans 
      (data, created_at) 
      VALUES 
      ('${body.floor_plan_data}', NOW())`
    );

    if (result.affectedRows > 0) {
      floorPlanId = result.insertId;

      const result2 = await db.query(
        `INSERT INTO rooms 
        (property_id, room_floor_plan_id, room_name, created_at) 
        VALUES 
        ("${body.property_id}", "${floorPlanId}", "${body.room_name}", NOW())`
      );

      if (result2.affectedRows > 0) {
        return { error: false };
      }
      return { error: true };
    } else {
      return { error: true };
    }
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function update(body, id) {
  try {
    const result = await db.query(
      `UPDATE rooms 
      SET room_name="${body.room_name}", modified_at=NOW() 
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

async function updateFloorPlan(body, id) {
  try {
    const rows = await db.query(
      `SELECT * FROM rooms WHERE id = "${id}" LIMIT 1`
    );

    let rooms = helper.emptyOrRows(rows);

    if (rooms.length > 0) {
      const result = await db.query(
        `UPDATE room_floor_plans 
        SET data='${body.floor_plan_data}', modified_at=NOW() 
        WHERE id = "${rooms[0].room_floor_plan_id}"`
      );

      if (result.affectedRows > 0) {
        return { error: false };
      }
      return { error: true };
    } else {
      return { error: true };
    }
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function destory(id) {
  try {
    const rows = await db.query(
      `SELECT * FROM rooms WHERE id = "${id}" LIMIT 1`
    );

    let rooms = helper.emptyOrRows(rows);

    if (rooms.length > 0) {
      const result = await db.query(
        `DELETE FROM room_floor_plans WHERE id = "${rooms[0].room_floor_plan_id}"`
      );

      const result2 = await db.query(
        `DELETE FROM rooms WHERE id = "${id}"`
      );

      if (result.affectedRows > 0 && result2.affectedRows > 0) {
        return { error: false };
      }
      return { error: true };
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

module.exports = {
  index,
  show,
  showUsage,
  store,
  update,
  updateFloorPlan,
  destory
}