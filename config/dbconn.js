const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  database: "test",
  user: "root",
  password: "",
});

conn.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("database connected");
  }
});

module.exports = conn;
