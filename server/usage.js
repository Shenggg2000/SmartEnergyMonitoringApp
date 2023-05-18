const notification = require('./services/notification');
const wallOutlet = require('./services/wallOutlet');
const db = require('./services/db');
const config = require('./config');
const helper = require('./helper');
const utils = require('./utils');

let wallOutlets = [];
let wallOutletsWarningState = null;

async function init() {
  const rows = await db.query(
    `SELECT id, wall_outlet_name, wall_outlet_identifier, daily_warning_value, daily_stop_value, monthly_warning_value, monthly_stop_value FROM wall_outlets`
  );
  wallOutlets = helper.emptyOrRows(rows);
  listenUsage();
}

function listenUsage() {
  const ref = config.realtimeDb.ref('/Sockets');
  ref.on("value", function (snapshot) {
    checkUsage(snapshot);
  });
}

function checkUsage(snapshot) {
  let snapshotVal = snapshot.val();
  let firstTime = false;
  if (wallOutletsWarningState == null) {
    firstTime = true;
    wallOutletsWarningState = []
  }
  wallOutlets.forEach(element => {
    let currentSocketSnapshot = snapshotVal[element.wall_outlet_identifier];
    if (currentSocketSnapshot) {
      // Empty
      if (firstTime) {
        wallOutletsWarningState.push({
          wallOutletIdentifier: element.wall_outlet_identifier,
          warningState: currentSocketSnapshot.warning
        })
      } else {
        let foundIndex = wallOutletsWarningState.findIndex((item) => {
          return item.wallOutletIdentifier == element.wall_outlet_identifier;
        })
        if (wallOutletsWarningState[foundIndex].warningState == 0 && currentSocketSnapshot.warning == 1) {
          notification.store({
            wall_outlet_id: element.id,
            notification_type: "EMPTY",
            title: `${element.wall_outlet_name} no load`,
            content: `We are informing you that ${element.wall_outlet_name} has been detected as open without load. As a result, we have sent you this notification to alert you of the issue.\n\nLeaving a socket open without a load can lead to electrical hazards such as electrocution or fire. To prevent such incidents, we strongly recommend that you turn off the socket immediately.`,
          })
        }
        wallOutletsWarningState[foundIndex].warningState = currentSocketSnapshot.warning;
      }

      // Usage
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
      usageKeys.sort((a, b) => a - b);
      let lastUsage = usage[usageKeys[usageKeys.length - 1]];
      let last2Usage = usage[usageKeys[usageKeys.length - 2]];
      if (lastUsage.bill > element.monthly_stop_value && element.monthly_stop_value && last2Usage.bill <= element.monthly_stop_value) {
        wallOutlet.switchOff(element.id);
        notification.store({
          wall_outlet_id: element.id,
          notification_type: "STOP",
          title: `${element.wall_outlet_name}'s is turned off`,
          content: `We are informing you that ${element.wall_outlet_name} has been automatically shut down by our system due to overuse of the preset amount of energy. As a result, we have sent you this notification to inform you of the issue.\n`,
        })
      } else if (lastUsage.bill > element.monthly_warning_value && element.monthly_warning_value && last2Usage.bill <= element.monthly_warning_value) {
        notification.store({
          wall_outlet_id: element.id,
          notification_type: "WARNING",
          title: `${element.wall_outlet_name}'s usage is exceeding the warning level`,
          content: `We are informing you that ${element.wall_outlet_name} has been identified as overusing the preset amount of energy. As a result, we have sent you this notification to alert you of the issue. You are suggested to take immediate action to address the issue to reduce the energy consumption of your household.\n\nPossible solution:\n1. Increase energy consumption warning value.\n2. Turn off the wall outlet.`,
        })
      }

      let todayNearestTimestamp = utils.findNearestGreaterNumber(usageKeysNumber, utils.todayTimestamp())
      if (todayNearestTimestamp) {
        let dailyBill = lastUsage.bill - usage[todayNearestTimestamp].bill;
        let daily2Bill = last2Usage.bill - usage[todayNearestTimestamp].bill;
        if (dailyBill > element.daily_stop_value && element.daily_stop_value && daily2Bill <= element.daily_stop_value) {
          wallOutlet.switchOff(element.id);
          notification.store({
            wall_outlet_id: element.id,
            notification_type: "STOP",
            title: `${element.wall_outlet_name}'s is turned off`,
            content: `We are informing you that ${element.wall_outlet_name} has been automatically shut down by our system due to overuse of the preset amount of energy. As a result, we have sent you this notification to inform you of the issue.\n`,
          })
        } else if (dailyBill > element.daily_warning_value && element.daily_warning_value && daily2Bill <= element.daily_warning_value) {
          notification.store({
            wall_outlet_id: element.id,
            notification_type: "WARNING",
            title: `${element.wall_outlet_name}'s usage is exceeding the warning level`,
            content: `We are informing you that ${element.wall_outlet_name} has been identified as overusing the preset amount of energy. As a result, we have sent you this notification to alert you of the issue. You are suggested to take immediate action to address the issue to reduce the energy consumption of your household.\n\nPossible solution:\n1. Increase energy consumption warning value.\n2. Turn off the wall outlet.`,
          })
        }
      }
    }
  })
}

module.exports = {
  init,
}