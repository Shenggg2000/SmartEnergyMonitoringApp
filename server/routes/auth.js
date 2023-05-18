const express = require('express');
const router = express.Router();
const helper = require('../helper');
const auth = require('../services/auth');
const multer = require("multer");
const crypto = require("crypto");
const mime = require('mime');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
    });
  }
});
const upload = multer({ storage: storage });

// Register
router.post('/register', async (req, res) => {
  try {
    let result = await auth.register(req.body);
    if (!result.error) {
      const token = helper.generateAccessToken({ id: result.data });
      auth.sendVerificationEmail(req.body.email, (error) => {
        if (error) {
          res.json({
            error: false,
            errorMessage: "",
            data: {
              token,
              emailSent: false
            }
          });
        } else {
          res.json({
            error: false,
            errorMessage: "",
            data: {
              token,
              emailSent: true
            }
          });
        }
      });
    } else if (result.data == "Email was taken.") {
      res.json({
        error: true,
        errorMessage: "Email was taken.",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Unknown error.",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while register `, err.message);
  }
});

// Send Verify Email
router.post('/send-verify-email', async (req, res) => {
  try {
    auth.sendVerificationEmail(req.body.email, (error) => {
      if (error) {
        res.json({
          error: true,
          errorMessage: "Verification send fail",
          data: {}
        });
      } else {
        res.json({
          error: false,
          errorMessage: "",
          data: {}
        });
      }
    });
  } catch (err) {
    console.error(`Error while register `, err.message);
  }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
  try {
    helper.authenticateVerificationToken(req.params.token, async (response) => {
      if (response.email) {
        let result = await auth.verifyEmail(response.email);
        if (!result.error) {
          res.json({
            error: false,
            errorMessage: "",
            data: {}
          });
        } else {
          res.json({
            error: true,
            errorMessage: "Email Verify Error",
            data: {}
          });
        }
      } else {
        return { error: true };
      }
    });
  } catch (err) {
    console.error(`Error while register `, err.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let result = await auth.login(req.body);
    if (!result.error) {
      const token = helper.generateAccessToken({ id: result.data.id });
      if (!result.data.email_verified_at) {
        console.log(123);
        auth.sendVerificationEmail(req.body.email, (error) => {
          if (error) {
            res.json({
              error: false,
              errorMessage: "",
              data: {
                token,
                verifiedEmail: result.data.email_verified_at,
                emailSent: false
              }
            });
          } else {
            res.json({
              error: false,
              errorMessage: "",
              data: {
                token,
                verifiedEmail: result.data.email_verified_at,
                emailSent: true
              }
            });
          }
        });
      }else{
        res.json({
          error: false,
          errorMessage: "",
          data: {
            token,
            verifiedEmail: result.data.email_verified_at,
          }
        });
      }
    } else {
      res.json({
        error: true,
        errorMessage: "Incorrect Email Password Pair",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while login `, err.message);
  }
});

// Check is verified
router.post('/is-verified', async (req, res) => {
  try {
    let result = await auth.isVerified(req.body);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data[0]
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Error while retrieve email verified",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while retrieve user data`, err.message);
  }
});

// Show
router.get('/', helper.authenticateToken, async (req, res) => {
  try {
    let result = await auth.show(req.user.id);
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: result.data[0]
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Error while retrieve user data",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while retrieve user data`, err.message);
  }
});

// Update
router.put('/', helper.authenticateToken, async function (req, res) {
  try {
    let result = await auth.update(req.body, req.user.id)
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update User Profile Fail",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while updating user`, err.message);
  }
});

// Update Messaging Token
router.put('/messaging-token', helper.authenticateToken, async function (req, res) {
  try {
    let result = await auth.updateMessagingToken(req.body, req.user.id)
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update Messaging Token Fail",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while updating user`, err.message);
  }
});

// UpdatePassword
router.put('/password', helper.authenticateToken, async function (req, res) {
  try {
    let result = await auth.updatePassword(req.body, req.user.id)
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else if (result.data == "Incorrect Old Password.") {
      res.json({
        error: true,
        errorMessage: "Incorrect Old Password.",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Update User Profile Fail",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while updating user`, err.message);
  }
});

// UpdateImg
router.put('/img', [helper.authenticateToken, upload.single("img")], async function (req, res) {
  try {
    let result = await auth.updateImage(req.user.id, req.file)
    if (!result.error) {
      res.json({
        error: false,
        errorMessage: "",
        data: {}
      });
    } else {
      res.json({
        error: true,
        errorMessage: "Upload Profile Image Error",
        data: {}
      });
    }
  } catch (err) {
    console.error(`Error while updating user`, err.message);
  }
});

// resetPassword


// verifyEmail

module.exports = router;