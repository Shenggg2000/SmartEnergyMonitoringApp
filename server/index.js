const express = require("express");
const app = express();
const port = 5000;

const usage = require("./usage");
const Singleton = require("./Singleton");

const propertyRouter = require("./routes/property");
const roomRouter = require("./routes/room");
const wallOutletRouter = require("./routes/wallOutlet");
const notificationRouter = require("./routes/notification");
const taskScheduleRouter = require("./routes/taskSchedule");
const authRouter = require("./routes/auth");

const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
process.env.TOKEN_SECRET;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/properties", propertyRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/wall-outlets", wallOutletRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/task-schedules", taskScheduleRouter);
app.use("/api/auth", authRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

const messaging = require("./messaging");

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  const object = Singleton.getInstance();
  usage.init();
});