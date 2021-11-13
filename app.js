const express = require("express");
const mysql = require("mysql");
const morgan= require('morgan');
const cors=require('cors');
const bodyParser = require("body-parser");
const userRoute = require("./routes/user");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use("/", userRoute);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
