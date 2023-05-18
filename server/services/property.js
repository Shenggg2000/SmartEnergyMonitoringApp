const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const utils = require('../utils');
const room = require('./room');

async function index(user_id) {
  try {
    const rows = await db.query(
      `SELECT properties.*, COUNT(DISTINCT rooms.id) AS num_rooms, COUNT(wall_outlets.id) AS num_wall_outlets
      FROM properties
      LEFT JOIN rooms ON rooms.property_id = properties.id
      LEFT JOIN wall_outlets ON wall_outlets.room_id = rooms.id
      WHERE properties.user_id = "${user_id}"
      GROUP BY properties.id`
    );

    // rooms ON rooms.property_id = properties.id

    let properties = helper.emptyOrRows(rows);

    return { error: false, data: properties };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function show(id) {
  try {
    const rows = await db.query(
      `SELECT properties.id, properties.user_id, properties.property_name, properties.property_type, property_floor_plans.data, properties.modified_at, properties.created_at
      FROM properties
      LEFT JOIN property_floor_plans ON properties.property_floor_plan_id = property_floor_plans.id
      WHERE properties.id = "${id}" LIMIT 1`
    );

    let properties = helper.emptyOrRows(rows);

    return { error: false, data: properties[0] };
  } catch (err) {
    return { error: true };
  }
}

async function showUsageHome(id) {
  try {
    const rows = await db.query(
      `SELECT wall_outlets.wall_outlet_identifier
      FROM properties
      LEFT JOIN rooms ON rooms.property_id = properties.id
      LEFT JOIN wall_outlets ON wall_outlets.room_id = rooms.id
      WHERE properties.id = "${id}"`
    );

    let wallOutlets = helper.emptyOrRows(rows);
    let wallOutletsUsage = {
      dailyTotalPower: 0,
      dailyTotalBill: 0,
      monthlyTotalPower: 0,
      monthlyTotalBill: 0,
    };

    wallOutlets.map(wallOutlet => {
      const ref = config.realtimeDb.ref('/Sockets/' + wallOutlet.wall_outlet_identifier);
      ref.once("value", function (snapshot) {
        let currentSocketSnapshot = snapshot.val();
        if (currentSocketSnapshot) {
          let usage = {};
          Object.entries(currentSocketSnapshot).forEach(([key, value]) => {
            if(key !== "state" && key !== "type"){
              Object.entries(value).forEach(([key2, value2]) => {
                usage[key2] = value2;
              });
            }
          });
          let usageKeys = Object.keys(usage);

          // add monthly bill
          let lastUsage = usage[usageKeys[usageKeys.length - 1]];
          wallOutletsUsage.monthlyTotalBill += lastUsage.bill;

          // add daily bill
          const usageKeysNumber = usageKeys.map(Number);
          let todayNearestTimestamp = utils.findNearestGreaterNumber(usageKeysNumber, utils.todayTimestamp())
          // if got timestamp for today (if today got switch on)
          if (todayNearestTimestamp) {
            let dailyBill = lastUsage.bill - usage[todayNearestTimestamp].bill;
            wallOutletsUsage.dailyTotalBill += dailyBill;
          }

          // add daily power
          let todayTimestamps = utils.findGreaterNumbers(usageKeysNumber, utils.todayTimestamp());
          if (todayTimestamps) {
            todayTimestamps.map(timestamp => {
              wallOutletsUsage.dailyTotalPower += (usage[timestamp].power * 12) / 3600;
            })
          }

          // add monthly power
          let thisMonthTimestamps = utils.findGreaterNumbers(usageKeysNumber, utils.thisMonthTimestamp());
          if (thisMonthTimestamps) {
            thisMonthTimestamps.map(timestamp => {
              wallOutletsUsage.monthlyTotalPower += (usage[timestamp].power * 12) / 3600;
            })
          }
        }
      });
    })

    return { error: false, data: wallOutletsUsage };
  } catch (err) {
    return { error: true };
  }
}

async function showUsage(id) {
  try {
    const rows = await db.query(
      `SELECT rooms.id
      FROM properties
      LEFT JOIN rooms ON rooms.property_id = properties.id
      WHERE properties.id = "${id}"`
    );

    let rooms = helper.emptyOrRows(rows);

    let propertyUsage = {
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

    for (let i = 0; i < rooms.length; i++) {
      let roomUsage = await room.showUsage(rooms[i].id);
      let usage = roomUsage.data;
      propertyUsage.weeklyTotalPower += usage.weeklyTotalPower;
      propertyUsage.weeklyTotalBill += usage.weeklyTotalBill;
      propertyUsage.monthlyTotalPower += usage.monthlyTotalPower;
      propertyUsage.monthlyTotalBill += usage.monthlyTotalBill;
      propertyUsage.ratio.weekly.push({
        id: rooms[i].id,
        power: usage.weeklyTotalPower,
        bill: usage.weeklyTotalBill,
      })
      propertyUsage.ratio.monthly.push({
        id: rooms[i].id,
        power: usage.monthlyTotalPower,
        bill: usage.monthlyTotalBill,
      })
      if (usage.weeklyPower.length == 7) {
        propertyUsage.weeklyPower = propertyUsage.weeklyPower.map((num, idx) => num + usage.weeklyPower[idx])
      }
      if (usage.weeklyBill.length == 7) {
        propertyUsage.weeklyBill = propertyUsage.weeklyBill.map((num, idx) => num + usage.weeklyBill[idx])
      }
      if (usage.monthlyPower.length == 31) {
        propertyUsage.monthlyPower = propertyUsage.monthlyPower.map((num, idx) => num + usage.monthlyPower[idx])
      }
      if (usage.monthlyBill.length == 31) {
        propertyUsage.monthlyBill = propertyUsage.monthlyBill.map((num, idx) => num + usage.monthlyBill[idx])
      }
    }
    return { error: false, data: propertyUsage };
  } catch (err) {
    return { error: true };
  }
}

async function showSummary(user_id) {
  try {
    const rows = await db.query(
      `SELECT id
      FROM properties
      WHERE properties.user_id = "${user_id}"`
    );

    let properties = helper.emptyOrRows(rows);

    let summaryUsage = {
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

    for (let i = 0; i < properties.length; i++) {
      let propertyUsage = await showUsage(properties[i].id);
      console.log(propertyUsage);
      let usage = propertyUsage.data;
      summaryUsage.weeklyTotalPower += usage.weeklyTotalPower;
      summaryUsage.weeklyTotalBill += usage.weeklyTotalBill;
      summaryUsage.monthlyTotalPower += usage.monthlyTotalPower;
      summaryUsage.monthlyTotalBill += usage.monthlyTotalBill;
      summaryUsage.ratio.weekly.push({
        id: properties[i].id,
        power: usage.weeklyTotalPower,
        bill: usage.weeklyTotalBill,
      })
      summaryUsage.ratio.monthly.push({
        id: properties[i].id,
        power: usage.monthlyTotalPower,
        bill: usage.monthlyTotalBill,
      })
      if (usage.weeklyPower.length == 7) {
        summaryUsage.weeklyPower = summaryUsage.weeklyPower.map((num, idx) => num + usage.weeklyPower[idx])
      }
      if (usage.weeklyBill.length == 7) {
        summaryUsage.weeklyBill = summaryUsage.weeklyBill.map((num, idx) => num + usage.weeklyBill[idx])
      }
      if (usage.monthlyPower.length == 31) {
        summaryUsage.monthlyPower = summaryUsage.monthlyPower.map((num, idx) => num + usage.monthlyPower[idx])
      }
      if (usage.monthlyBill.length == 31) {
        summaryUsage.monthlyBill = summaryUsage.monthlyBill.map((num, idx) => num + usage.monthlyBill[idx])
      }
    }
    return { error: false, data: summaryUsage };
  } catch (err) {console.log(err);
    return { error: true };
  }
}

async function store(body, user_id) {
  try {
    let floorPlanId;
    const result = await db.query(
      `INSERT INTO property_floor_plans 
      (data, created_at) 
      VALUES 
      ("${body.floor_plan_data}", NOW())`
    );

    if (result.affectedRows > 0) {
      floorPlanId = result.insertId;

      const result2 = await db.query(
        `INSERT INTO properties 
        (user_id, property_floor_plan_id, property_name, property_type, property_tariff, created_at) 
        VALUES 
        ("${user_id}", "${floorPlanId}", "${body.property_name}", "${body.property_type}", "${body.property_tariff}", NOW())`
      );

      if (result2.affectedRows > 0) {
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

async function update(body, id) {
  try {
    const result = await db.query(
      `UPDATE properties 
      SET property_name="${body.property_name}", property_type="${body.property_type}", modified_at=NOW() 
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
      `SELECT * FROM properties WHERE id = "${id}" LIMIT 1`
    );

    let properties = helper.emptyOrRows(rows);

    if (properties.length > 0) {
      const result = await db.query(
        `UPDATE property_floor_plans 
        SET data="${body.floor_plan_data}", modified_at=NOW() 
        WHERE id = "${properties[0].property_floor_plan_id}"`
      );

      if (result.affectedRows > 0) {
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

async function destory(id) {
  try {
    const rows = await db.query(
      `SELECT * FROM properties WHERE id = "${id}" LIMIT 1`
    );

    let properties = helper.emptyOrRows(rows);

    if (properties.length > 0) {
      const result = await db.query(
        `DELETE FROM property_floor_plans WHERE id = "${properties[0].property_floor_plan_id}"`
      );

      const result2 = await db.query(
        `DELETE FROM properties WHERE id = "${id}"`
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
  showSummary,
  showUsageHome,
  store,
  update,
  updateFloorPlan,
  destory
}