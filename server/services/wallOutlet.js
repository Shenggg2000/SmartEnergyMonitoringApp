const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const utils = require('../utils');
const taskSchedule = require('./taskSchedule');
const Singleton = require("../Singleton");
const object = Singleton.getInstance();

async function index(query, user_id) {
  try {
    let conditions = "";
    if (query.room_id) {
      conditions = `AND room_id = "${query.room_id}"`
    } else if (query.quick_access) {
      conditions = `AND quick_access = ${query.quick_access}`
    }
    if (query.room_id && query.quick_access) {
      conditions = `AND room_id = "${query.room_id}" AND quick_access = ${query.quick_access}`
    }

    const rows = await db.query(
      `SELECT wall_outlets.id, wall_outlets.wall_outlet_name, wall_outlets.wall_outlet_identifier, properties.property_name FROM wall_outlets 
        LEFT JOIN rooms ON wall_outlets.room_id = rooms.id
        LEFT JOIN properties ON rooms.property_id = properties.id
        WHERE properties.user_id = ${user_id} ${conditions}`
    );

    let wall_outlets = helper.emptyOrRows(rows);
    wall_outlets.forEach(element => {
      const ref = config.realtimeDb.ref('/Sockets/' + element.wall_outlet_identifier);
      ref.once("value", function (snapshot) {
        let wallOutlet = snapshot.val();
        element.state = wallOutlet ? wallOutlet.state : 0;
      })
      element.last_active = new Date();
    });

    return { error: false, data: wall_outlets };
  } catch (err) {
    return { error: true };
  }
}

async function show(id) {
  try {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const outputDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const taskRows = await db.query(
      `SELECT * FROM task_schedules 
      WHERE wall_outlet_id = "${id}" AND action_datetime >= "${outputDate}" AND is_schedule = "0"`
    );

    let task_schedules = helper.emptyOrRows(taskRows);

    const rows = await db.query(
      `SELECT * FROM wall_outlet_schedules
      WHERE wall_outlet_id = "${id}"`
    );

    let wall_outlet_schedules = helper.emptyOrRows(rows);

    const rows2 = await db.query(
      `SELECT * FROM wall_outlets
      WHERE id = "${id}" LIMIT 1`
    );

    let wall_outlets = helper.emptyOrRows(rows2);

    if (wall_outlets.length > 0) {
      let wall_outlet = wall_outlets[0];
      wall_outlet.schedules = JSON.parse(JSON.stringify(wall_outlet_schedules));
      if (task_schedules.length > 0) {
        wall_outlet.countdown = task_schedules[0].action;
        const date = new Date(task_schedules[0].action_datetime);
        wall_outlet.countdownTime = date.getTime()
      } else {
        wall_outlet.countdown = "";
      }

      const ref = config.realtimeDb.ref('/Sockets/' + wall_outlet.wall_outlet_identifier);
      ref.once("value", function (snapshot) {
        let currentSocketSnapshot = snapshot.val();
        wall_outlet.state = currentSocketSnapshot.state;
        wall_outlet.warning = currentSocketSnapshot.warning;

        if (currentSocketSnapshot) {
          let usage = {};
          Object.entries(currentSocketSnapshot).forEach(([key, value]) => {
            if (key !== "state" && key !== "type") {
              Object.entries(value).forEach(([key2, value2]) => {
                usage[key2] = value2;
              });
            }
          });
          let usageKeys = Object.keys(usage);
          usageKeys.sort((a, b) => a - b);
          let timestamp = usageKeys[usageKeys.length - 1];
          wall_outlet.power = usage[timestamp].power;
          wall_outlet.current = usage[timestamp].current;
          wall_outlet.bill = usage[timestamp].bill;
        }
      })
      return { error: false, data: wall_outlet };
    } else {
      return { error: true };
    }
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function showUsage(id) {
  try {
    const rows = await db.query(
      `SELECT wall_outlet_identifier
      FROM wall_outlets
      WHERE id = "${id}"`
    );

    let wallOutlet = helper.emptyOrRows(rows);
    let wallOutletsUsage = {
      weeklyTotalPower: 0,
      weeklyTotalBill: 0,
      weeklyPower: [],
      weeklyBill: [],
      monthlyTotalPower: 0,
      monthlyTotalBill: 0,
      monthlyPower: [],
      monthlyBill: [],
      latestEvents: [],
    };

    const ref = config.realtimeDb.ref('/Sockets/' + wallOutlet[0].wall_outlet_identifier);
    ref.once("value", function (snapshot) {
      let currentSocketSnapshot = snapshot.val();
      if (currentSocketSnapshot) {
        let usage = {};
        Object.entries(currentSocketSnapshot).forEach(([key, value]) => {
          if (key !== "state" && key !== "type") {
            Object.entries(value).forEach(([key2, value2]) => {
              usage[key2] = value2;
            });
          }
        });
        let usageKeys = Object.keys(usage);
        const usageKeysNumber = usageKeys.map(Number);

        // TOTAL BILL
        // Monthly bill
        let lastUsage = usage[usageKeys[usageKeys.length - 1]];
        wallOutletsUsage.monthlyTotalBill += parseFloat(Number(lastUsage.bill).toFixed(2));
        // Weekly bill
        let thisWeekTimestamp = utils.findNearestGreaterNumber(usageKeysNumber, utils.thisWeekTimestamp())
        if (thisWeekTimestamp) {
          if (thisWeekTimestamp < utils.thisMonthTimestamp()) {
            let lastDayOfLastMonthTimestamp = utils.findNearestSmallerNumber(usageKeysNumber, utils.thisMonthTimestamp())
            let weeklyBill = lastUsage.bill + (usage[lastDayOfLastMonthTimestamp].bill - usage[thisWeekTimestamp].bill);
            wallOutletsUsage.weeklyTotalBill += parseFloat(Number(weeklyBill).toFixed(2));
          } else {
            let weeklyBill = lastUsage.bill - usage[thisWeekTimestamp].bill;
            wallOutletsUsage.weeklyTotalBill += parseFloat(Number(weeklyBill).toFixed(2));
          }
        }

        // TOTAL POWER
        // Monthly power
        let thisMonthTimestamps = utils.findGreaterNumbers(usageKeysNumber, utils.thisMonthTimestamp());
        if (thisMonthTimestamps) {
          thisMonthTimestamps.map(timestamp => {
            wallOutletsUsage.monthlyTotalPower += parseFloat(Number((usage[timestamp].power * 12) / 3600).toFixed(2));
            wallOutletsUsage.monthlyTotalPower = parseFloat(Number(wallOutletsUsage.monthlyTotalPower).toFixed(2));
          })
        }
        // Weekly power
        let thisWeekTimestamps = utils.findGreaterNumbers(usageKeysNumber, utils.thisWeekTimestamp());
        if (thisWeekTimestamps) {
          thisWeekTimestamps.map(timestamp => {
            wallOutletsUsage.weeklyTotalPower += parseFloat(Number((usage[timestamp].power * 12) / 3600).toFixed(2));
            wallOutletsUsage.weeklyTotalPower = parseFloat(Number(wallOutletsUsage.weeklyTotalPower).toFixed(2));
          })
        }

        // DAILY BILL
        // Monthly bill
        for (let i = 0; i < 31; i++) {
          let thisWeekTimestampA = utils.findNearestGreaterNumber(usageKeysNumber, utils.thisMonthTimestamp() + (86400 * i));
          let thisWeekTimestampB = utils.findNearestSmallerNumber(usageKeysNumber, utils.thisMonthTimestamp() + (86400 * (i + 1)));
          if (thisWeekTimestampA && thisWeekTimestampB && thisWeekTimestampA != thisWeekTimestampB) {
            let dailyBill = usage[thisWeekTimestampB].bill - usage[thisWeekTimestampA].bill;
            wallOutletsUsage.monthlyBill.push(parseFloat(Number(dailyBill).toFixed(2)));
          } else {
            wallOutletsUsage.monthlyBill.push(0);
          }
        }
        // Weekly bill
        for (let i = 0; i < 7; i++) {
          let thisWeekTimestampA = utils.findNearestGreaterNumber(usageKeysNumber, utils.thisWeekTimestamp() + (86400 * i));
          let thisWeekTimestampB = utils.findNearestSmallerNumber(usageKeysNumber, utils.thisWeekTimestamp() + (86400 * (i + 1)));
          if (thisWeekTimestampA && thisWeekTimestampB && thisWeekTimestampA != thisWeekTimestampB) {
            let dailyBill = usage[thisWeekTimestampB].bill - usage[thisWeekTimestampA].bill;
            wallOutletsUsage.weeklyBill.push(parseFloat(Number(dailyBill).toFixed(2)));
          } else {
            wallOutletsUsage.weeklyBill.push(0);
          }
        }

        // DAILY POWER
        // Monthly power
        for (let i = 0; i < 31; i++) {
          let dailyTimestamps = utils.findBetweenNumbers(usageKeysNumber, utils.thisMonthTimestamp() + (86400 * i), utils.thisMonthTimestamp() + (86400 * (i + 1)));
          let dailyPower = 0;
          if (dailyTimestamps) {
            dailyTimestamps.map(timestamp => {
              dailyPower += parseFloat(Number((usage[timestamp].power * 12) / 3600).toFixed(2));
              dailyPower = parseFloat(Number(dailyPower).toFixed(2));
            })
          }
          wallOutletsUsage.monthlyPower.push(dailyPower);
        }
        // Weekly power
        for (let i = 0; i < 7; i++) {
          let dailyTimestamps = utils.findBetweenNumbers(usageKeysNumber, utils.thisWeekTimestamp() + (86400 * i), utils.thisWeekTimestamp() + (86400 * (i + 1)));
          let dailyPower = 0;
          if (dailyTimestamps) {
            dailyTimestamps.map(timestamp => {
              dailyPower += parseFloat(Number((usage[timestamp].power * 12) / 3600).toFixed(2));
              dailyPower = parseFloat(Number(dailyPower).toFixed(2));
            })
          }
          wallOutletsUsage.weeklyPower.push(dailyPower);
        }

        // LATEST ACTION
        let groupedNumber = utils.groupConsecutiveNumbers(usageKeysNumber);
        let numberOfAction = groupedNumber.length < 5 ? groupedNumber.length : 5;
        for (let i = 0; i < numberOfAction; i++) {
          let startTimestamp = groupedNumber[groupedNumber.length - i - 1][0];
          let endTimestamp = groupedNumber[groupedNumber.length - i - 1][groupedNumber[groupedNumber.length - i - 1].length - 1];
          let actionTimestamps = utils.findBetweenNumbers(usageKeysNumber, startTimestamp, endTimestamp);
          let actionPower = 0;
          if (actionTimestamps) {
            actionTimestamps.map(timestamp => {
              actionPower += (usage[timestamp].power * 12) / 3600;
            })
          }
          let actionBill = 0;
          if (startTimestamp < utils.thisMonthTimestamp()) {
            let lastDayOfLastMonthTimestamp = utils.findNearestSmallerNumber(usageKeysNumber, utils.thisMonthTimestamp())
            let weeklyBill = lastUsage.bill + (usage[lastDayOfLastMonthTimestamp].bill - usage[startTimestamp].bill);
            actionBill += weeklyBill;
          } else {
            let weeklyBill = lastUsage.bill - usage[startTimestamp].bill;
            actionBill += weeklyBill;
          }
          wallOutletsUsage.latestEvents.push({
            startTimestamp,
            endTimestamp,
            actionPower,
            actionBill
          })
        }
      }
    });

    return { error: false, data: wallOutletsUsage };
  } catch (err) {
    return { error: true };
  }
}

async function store(body) {
  try {
    const rows = await db.query(
      `SELECT * FROM wall_outlets
      WHERE wall_outlet_identifier = "${body.wall_outlet_identifier}"`
    );

    let wall_outlets = helper.emptyOrRows(rows);

    if (wall_outlets.length === 0) {
      const result = await db.query(
        `INSERT INTO wall_outlets 
        (room_id, wall_outlet_name, wall_outlet_identifier, created_at) 
        VALUES 
        ("${body.room_id}", "${body.wall_outlet_name}", "${body.wall_outlet_identifier}", NOW())`
      );

      let firebaseError = false;
      const ref = config.realtimeDb.ref('/Sockets/' + body.wall_outlet_identifier);
      ref.child("type").set("C1", function (error) {
        firebaseError = error;
      });

      if (result.affectedRows > 0 && !firebaseError) {
        return { error: false };
      }
    }
    return { error: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function storeSchedule(body) {
  try {
    const result = await db.query(
      `INSERT INTO wall_outlet_schedules 
      (wall_outlet_id, start_time, end_time, created_at) 
      VALUES 
      ("${body.wall_outlet_id}", "${body.start_time}", "${body.end_time}", NOW())`
    );

    if (result.affectedRows > 0) {
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
      `UPDATE wall_outlets 
      SET wall_outlet_name="${body.wall_outlet_name}", modified_at=NOW() 
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

async function updateDaily(body, id) {
  try {
    const result = await db.query(
      `UPDATE wall_outlets 
      SET daily_warning_value=${body.daily_warning_value}, daily_stop_value=${body.daily_stop_value}, modified_at=NOW() 
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

async function updateMonthly(body, id) {
  try {
    const result = await db.query(
      `UPDATE wall_outlets 
      SET monthly_warning_value=${body.monthly_warning_value}, monthly_stop_value=${body.monthly_stop_value}, modified_at=NOW() 
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

async function updateSchedule(body, id) {
  try {
    console.log(body);
    const old_rows = await db.query(
      `SELECT * FROM wall_outlet_schedules
        WHERE id = "${id}"`
    );
    let old_wall_outlet_schedules = helper.emptyOrRows(old_rows);
    if (old_wall_outlet_schedules[0].status == "1") {
      const deleteStart = await db.query(
        `DELETE FROM task_schedules 
          WHERE wall_outlet_identifier = "${body.wall_outlet_identifier}" 
          AND action = "ON" 
          AND action_datetime = "2300-01-01 ${old_wall_outlet_schedules[0].start_time}"`
      );
      const deleteEnd = await db.query(
        `DELETE FROM task_schedules 
          WHERE wall_outlet_identifier = "${body.wall_outlet_identifier}" 
          AND action = "OFF" 
          AND action_datetime = "2300-01-01 ${old_wall_outlet_schedules[0].end_time}"`
      );

      if (deleteStart.affectedRows > 0 && deleteEnd.affectedRows > 0) {
        if (body.status && body.status == "0") {
          object.resetTasks();
        }
        let start_time = "";
        let end_time = "";
        let status = "";
        if (body.start_time) {
          start_time = `start_time="${body.start_time}",`;
        }
        if (body.end_time) {
          end_time = `end_time="${body.end_time}",`;
        }
        if (body.status) {
          status = `status="${body.status}",`;
        }

        const result = await db.query(
          `UPDATE wall_outlet_schedules 
          SET ${start_time} ${end_time} ${status} modified_at=NOW() 
          WHERE id = "${id}"`
        );

        if (result.affectedRows > 0) {
          const rows = await db.query(
            `SELECT * FROM wall_outlet_schedules
          WHERE id = "${id}"`
          );
          let wall_outlet_schedules = helper.emptyOrRows(rows);
          if (wall_outlet_schedules[0].status == "1") {
            taskSchedule.store({
              wall_outlet_id: body.wall_outlet_id,
              wall_outlet_identifier: body.wall_outlet_identifier,
              action: "ON",
              action_datetime: `2300-01-01 ${wall_outlet_schedules[0].start_time}`,
              is_schedule: "1"
            })
            taskSchedule.store({
              wall_outlet_id: body.wall_outlet_id,
              wall_outlet_identifier: body.wall_outlet_identifier,
              action: "OFF",
              action_datetime: `2300-01-01 ${wall_outlet_schedules[0].end_time}`,
              is_schedule: "1"
            })
          }
          return { error: false };
        }
      }
      return { error: true };
    } else if (old_wall_outlet_schedules[0].status == "0") {
      let start_time = "";
      let end_time = "";
      let status = "";
      if (body.start_time) {
        start_time = `start_time="${body.start_time}",`;
      }
      if (body.end_time) {
        end_time = `end_time="${body.end_time}",`;
      }
      if (body.status) {
        status = `status="${body.status}",`;
      }

      const result = await db.query(
        `UPDATE wall_outlet_schedules 
        SET ${start_time} ${end_time} ${status} modified_at=NOW() 
        WHERE id = "${id}"`
      );

      if (result.affectedRows > 0) {
        const rows = await db.query(
          `SELECT * FROM wall_outlet_schedules
        WHERE id = "${id}"`
        );
        let wall_outlet_schedules = helper.emptyOrRows(rows);
        console.log(wall_outlet_schedules);
        if (wall_outlet_schedules[0].status == "1") {
          taskSchedule.store({
            wall_outlet_id: body.wall_outlet_id,
            wall_outlet_identifier: body.wall_outlet_identifier,
            action: "ON",
            action_datetime: `2300-01-01 ${wall_outlet_schedules[0].start_time}`,
            is_schedule: "1"
          })
          taskSchedule.store({
            wall_outlet_id: body.wall_outlet_id,
            wall_outlet_identifier: body.wall_outlet_identifier,
            action: "OFF",
            action_datetime: `2300-01-01 ${wall_outlet_schedules[0].end_time}`,
            is_schedule: "1"
          })
        }
        return { error: false };
      }
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function switchOn(id) {
  try {
    let wall_outlet_identifier = "";

    const rows = await db.query(
      `SELECT wall_outlet_identifier FROM wall_outlets
      WHERE id = "${id}" LIMIT 1`
    );

    let wall_outlets = helper.emptyOrRows(rows);

    if (wall_outlets.length > 0) {
      wall_outlet_identifier = wall_outlets[0].wall_outlet_identifier;
    }

    let firebaseError = false;
    const ref = config.realtimeDb.ref('/Sockets/' + wall_outlet_identifier);
    ref.update({
      "state": 1
    });

    if (!firebaseError) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function switchOff(id) {
  try {
    let wall_outlet_identifier = "";

    const rows = await db.query(
      `SELECT wall_outlet_identifier FROM wall_outlets
      WHERE id = "${id}" LIMIT 1`
    );

    let wall_outlets = helper.emptyOrRows(rows);

    if (wall_outlets.length > 0) {
      wall_outlet_identifier = wall_outlets[0].wall_outlet_identifier;
    }

    let firebaseError = false;
    const ref = config.realtimeDb.ref('/Sockets/' + wall_outlet_identifier);
    ref.update({
      "state": 0
    });

    if (!firebaseError) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function switchOnLikely(body) {
  try {
    let wall_outlet_identifier = "";

    const rows = await db.query(
      `SELECT wall_outlet_identifier FROM wall_outlets
      WHERE wall_outlet_name LIKE '%${body.wall_outlet_name}%' LIMIT 1`
    );

    let wall_outlets = helper.emptyOrRows(rows);

    if (wall_outlets.length > 0) {
      let firebaseError = false;
      wall_outlet_identifier = wall_outlets[0].wall_outlet_identifier;
      const ref = config.realtimeDb.ref('/Sockets/' + wall_outlet_identifier);
      ref.update({
        "state": 1
      });

      if (!firebaseError) {
        return { error: false };
      }
    } else {
      return { error: true };
    }

    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function switchOffLikely(body) {
  try {
    let wall_outlet_identifier = "";

    const rows = await db.query(
      `SELECT wall_outlet_identifier FROM wall_outlets
      WHERE wall_outlet_name LIKE '%${body.wall_outlet_name}%' LIMIT 1`
    );

    let wall_outlets = helper.emptyOrRows(rows);

    if (wall_outlets.length > 0) {
      let firebaseError = false;
      wall_outlet_identifier = wall_outlets[0].wall_outlet_identifier;
      const ref = config.realtimeDb.ref('/Sockets/' + wall_outlet_identifier);
      ref.update({
        "state": 0
      });

      if (!firebaseError) {
        return { error: false };
      }
    } else {
      return { error: true };
    }

    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function setQuickAccess(id) {
  try {
    console.log(id);
    const result = await db.query(
      `UPDATE wall_outlets 
      SET quick_access="1", modified_at=NOW() 
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

async function unsetQuickAccess(id) {
  try {
    console.log(id);
    const result = await db.query(
      `UPDATE wall_outlets 
      SET quick_access="0", modified_at=NOW() 
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
      `DELETE FROM wall_outlets WHERE id = "${id}"`
    );

    const result2 = await db.query(
      `DELETE FROM wall_outlet_schedules WHERE wall_outlet_id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function destorySchedule(id) {
  try {
    const result = await db.query(
      `DELETE FROM wall_outlet_schedules WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

module.exports = {
  index,
  show,
  showUsage,
  store,
  storeSchedule,
  update,
  updateDaily,
  updateMonthly,
  updateSchedule,
  switchOn,
  switchOff,
  switchOnLikely,
  switchOffLikely,
  setQuickAccess,
  unsetQuickAccess,
  destory,
  destorySchedule
}