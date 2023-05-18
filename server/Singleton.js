const cron = require('node-cron');
const db = require('./services/db');
const helper = require('./helper');
const config = require('./config');

class PrivateSingleton {
  tasks = [];
  taskObjects = [];

  constructor() {
    this.init();
  }

  async init() {
    this.tasks = [];
    this.taskObjects = [];

    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const outputDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const rows = await db.query(
      `SELECT * FROM task_schedules WHERE action_datetime >= "${outputDate}"`
    );

    this.tasks = helper.emptyOrRows(rows);

    this.tasks.forEach(task => {
      this.setSchedule(task);
    });
  }

  setSchedule(task) {
    let taskObject;
    console.log(task.action_datetime);
    let actionDatatime = new Date(task.action_datetime);
    let second = actionDatatime.getSeconds();
    let minute = actionDatatime.getMinutes();
    let hour = actionDatatime.getHours();
    let day = actionDatatime.getDate();
    let month = actionDatatime.getMonth() + 1;

    if (task.is_schedule) {
      console.log("************");
      taskObject = cron.schedule(`${second} ${minute} ${hour} * * *`, () => {
        if(task.action == "ON"){
          const ref = config.realtimeDb.ref('/Sockets/' + task.wall_outlet_identifier);
          ref.update({
            "state": 1
          });
        }
        if(task.action == "OFF"){
          const ref = config.realtimeDb.ref('/Sockets/' + task.wall_outlet_identifier);
          ref.update({
            "state": 0
          });
        }
      }, {
        scheduled: true,
        timezone: "Asia/Kuala_Lumpur",
      });
    } else {
      taskObject = cron.schedule(`${second} ${minute} ${hour} ${day} ${month} *`, () => {
        if(task.action == "ON"){
          const ref = config.realtimeDb.ref('/Sockets/' + task.wall_outlet_identifier);
          ref.update({
            "state": 1
          });
        }
        if(task.action == "OFF"){
          const ref = config.realtimeDb.ref('/Sockets/' + task.wall_outlet_identifier);
          ref.update({
            "state": 0
          });
        }
      }, {
        scheduled: false,
        timezone: "Asia/Kuala_Lumpur",
      });
    }
    taskObject.start();
    this.taskObjects.push(taskObject);
  }

  async resetTasks() {
    this.taskObjects.forEach((task) => {
      console.log("stop");
      task.stop();
    });

    this.tasks = [];
    this.taskObjects = [];

    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const outputDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const rows = await db.query(
      `SELECT * FROM task_schedules WHERE action_datetime >= "${outputDate}"`
    );

    this.tasks = helper.emptyOrRows(rows);

    this.tasks.forEach(task => {
      this.setSchedule(task);
    });
  }
}

class Singleton {
  constructor() {
    throw new Error("Use Singleton.getInstance ()");
  }
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new PrivateSingleton();
    }
    return Singleton.instance;
  }
}
module.exports = Singleton;