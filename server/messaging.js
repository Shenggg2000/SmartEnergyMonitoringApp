const config = require("./config");

async function sendNotification(tokens, title, body){
  config.firebase.messaging().sendMulticast({
    tokens,
    notification: {
      title,
      body,
    },
  }).then((response) => {
    console.log(response);
  })
}

module.exports = {
  sendNotification
}