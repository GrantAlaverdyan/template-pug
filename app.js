var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
const cron = require("node-cron");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var mailerRouter = require("./routes/mailer");
require("dotenv").config();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

let transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USERFROM,
    pass: process.env.PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main(userTo) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.USERFROM, // sender address
    to: userTo, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

// Массив с датами
const dates = ["29.04.2024", "30.04.2024", "02.05.2024"];

// Установка cron задачи для каждой даты в массиве
dates.forEach((date) => {
  // Разбиваем дату на составляющие
  const [day, month, year] = date.split(".");
  // Устанавливаем cron задачу на 12 часов дня для каждой даты
  cron.schedule(`0 12 ${day} ${month} *`, () => {
    main("hans.man06091419@gmail.com");
  });
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/mail", mailerRouter);
app.post("/sendData", function (req, res) {
  console.log(req.body); //сохраняем данные в базу данных, затем отправляем письмо для подтверждения почты

  main("hans.man06091419@gmail.com").catch(console.error);
  res.send("hvhcmgchgchm");
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
