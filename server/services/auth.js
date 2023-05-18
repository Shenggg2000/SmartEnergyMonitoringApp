const db = require('./db');
const helper = require('../helper');
const config = require('../config')

async function register(body) {
  let error = true;
  try {
    const checkEmailTaken = await db.query(
      `SELECT id FROM users WHERE email = "${body.email}"`
    );
    if (checkEmailTaken.length > 0) {
      return { error, data: "Email was taken." };
    }

    let hashPassword = await helper.cryptPassword(body.password);
    const result = await db.query(
      `INSERT INTO users 
      (username, email, password, messaging_token, created_at) 
      VALUES 
      ("${body.username}", "${body.email}", "${hashPassword}", "${body.messaging_token}", NOW())`
    );
    
    if (result.affectedRows > 0) {
      return {
        error: false,
        data: result.insertId
      }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

async function sendVerificationEmail(email, callback) {
  try {
    config.transporter.sendMail({
      from: 'smart.energy.monitoring2023@gmail.com',
      to: email,
      subject: 'Subject123 Token',
      html: `<a href="http://localhost:5000/api/auth/verify/${helper.generateVerificationToken({ email })}">Verify</a>`,
    }, function (error, info) {
      callback(error)
    });
  } catch (err) {
    return { error: true };
  }
}

async function verifyEmail(email) {
  try {
    let result = await db.query(
      `UPDATE users 
        SET email_verified_at=NOW(), modified_at=NOW() 
        WHERE email = "${email}"`
    );

    if (result.affectedRows > 0) {
      return { error: false }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

async function login(body) {
  try {
    let loginSuccessful = false;
    const result = await db.query(
      `SELECT * FROM users WHERE email = "${body.email}" LIMIT 1`
    );

    if (result.length > 0) {
      loginSuccessful = await helper.comparePassword(body.password, result[0].password);
    }

    if (loginSuccessful) {
      if(!result[0].messaging_token){
        await db.query(
          `UPDATE users 
            SET messaging_token="${body.messaging_token}", modified_at=NOW() 
            WHERE email = "${body.email}"`
        );
      }

      return {
        error: false,
        data: result[0],
      }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

async function show(id) {
  try {
    const rows = await db.query(
      `SELECT * FROM users WHERE id  = ${id}`
    );

    const data = helper.emptyOrRows(rows);

    if (data) {
      return {
        error: false,
        data
      }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

async function update(body, id) {
  try {
    let result = await db.query(
      `UPDATE users 
        SET username="${body.username}", modified_at=NOW() 
        WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false }
    } else {
      return { error: true };
    }

  } catch (err) {
    return { error: true };
  }
}

async function updateMessagingToken(body, id) {
  try {
    let result = await db.query(
      `UPDATE users 
        SET messaging_token="${body.messaging_token}", modified_at=NOW() 
        WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false }
    } else {
      return { error: true };
    }

  } catch (err) {
    return { error: true };
  }
}

async function updatePassword(body, id) {
  try {
    let oldPasswordCorrect = false;
    const result = await db.query(
      `SELECT * FROM users WHERE id = "${id}" LIMIT 1`
    );

    if (result.length > 0) {
      oldPasswordCorrect = await helper.comparePassword(body.oldPassword, result[0].password);
    }

    if (oldPasswordCorrect) {
      let hashPassword = await helper.cryptPassword(body.newPassword);
      let result2 = await db.query(
        `UPDATE users 
          SET password="${hashPassword}", modified_at=NOW() 
          WHERE id = "${id}"`
      );

      if (result2.affectedRows > 0) {
        return { error: false }
      } else {
        return { error: true };
      }
    } else {
      return { error: true, data: "Incorrect Old Password." };
    }
  } catch (err) {
    return { error: true };
  }
}

async function updateImage(id, img) {
  try {
    let sqlImg = "";
    if (img) {
      sqlImg = 'img="' + img.filename + '"';
    }

    let result = await db.query(
      `UPDATE users 
      SET ${sqlImg}, modified_at=NOW() 
      WHERE id = "${id}"`
    );

    if (result.affectedRows > 0) {
      return { error: false }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

async function isVerified(body) {
  try {
    const rows = await db.query(
      `SELECT email_verified_at FROM users WHERE email = "${body.email}"`
    );

    const data = helper.emptyOrRows(rows);

    if (data) {
      return {
        error: false,
        data
      }
    } else {
      return { error: true };
    }
  } catch (err) {
    return { error: true };
  }
}

module.exports = {
  register,
  sendVerificationEmail,
  verifyEmail,
  login,
  show,
  update,
  updateMessagingToken,
  updatePassword,
  updateImage,
  isVerified,
}