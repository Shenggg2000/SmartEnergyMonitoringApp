const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function generateAccessToken(name) {
  return jwt.sign(name, process.env.TOKEN_SECRET, { expiresIn: '604800s' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

function generateVerificationToken(email) {
  return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '604800s' });
}

function authenticateVerificationToken(token, callback) {
  jwt.verify(token, process.env.TOKEN_SECRET, (err, email) => {
    callback(email);
  })
}

function cryptPassword(password) {
  return bcrypt.genSalt(10)
    .then((salt => bcrypt.hash(password, salt)))
    .then(hash => hash)
}

function comparePassword(password, hashPassword) {
  return bcrypt.compare(password, hashPassword)
    .then(resp => resp)
}

module.exports = {
  emptyOrRows,
  generateAccessToken,
  authenticateToken,
  generateVerificationToken,
  authenticateVerificationToken,
  cryptPassword,
  comparePassword,
}