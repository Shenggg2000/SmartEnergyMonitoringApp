const db = require('./db');
const helper = require('../helper');
const messaging = require('../messaging');

async function index(user_id) {
  try {
    const rows = await db.query(
      `SELECT notifications.id, notification_type, title, is_seen, notifications.created_at FROM notifications
        LEFT JOIN wall_outlets ON wall_outlets.id = notifications.wall_outlet_id
        LEFT JOIN rooms ON wall_outlets.room_id = rooms.id
        LEFT JOIN properties ON rooms.property_id = properties.id
        WHERE properties.user_id = ${user_id} ORDER BY notifications.created_at DESC`
    );

    let notifications = helper.emptyOrRows(rows);

    return { error: false, data: notifications };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

async function show(id) {
  try {
    const rows = await db.query(
      `SELECT * FROM notifications WHERE id = "${id}" LIMIT 1`
    );

    let notification = helper.emptyOrRows(rows);

    return { error: false, data: notification[0] };
  } catch (err) {
    return { error: true };
  }
}

async function store(body, messaging_token) {
  try {
    let token = messaging_token;
    if (!token) {
      const rows = await db.query(
        `SELECT users.messaging_token 
          FROM wall_outlets 
          LEFT JOIN rooms ON wall_outlets.room_id = rooms.id
          LEFT JOIN properties ON rooms.property_id = properties.id
          LEFT JOIN users ON properties.user_id = users.id
          WHERE wall_outlets.id = ${body.wall_outlet_id} LIMIT 1`
      );
      let user = helper.emptyOrRows(rows);
      token = user[0].messaging_token;
    }

    const result = await db.query(
      `INSERT INTO notifications 
      (wall_outlet_id, notification_type, title, content, created_at) 
      VALUES 
      ("${body.wall_outlet_id}", "${body.notification_type}", "${body.title}", "${body.content}", NOW())`
    );
    
    console.log(token);
    messaging.sendNotification([token], body.title, body.content);

    if (result.affectedRows > 0) {
      return { error: false };
    }
    return { error: true };
  } catch (err) {
    return { error: true };
  }
}

async function updateSeen(id) {
  try {
    const result = await db.query(
      `UPDATE notifications 
      SET is_seen="1", modified_at=NOW() 
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

module.exports = {
  index,
  store,
  show,
  updateSeen
}