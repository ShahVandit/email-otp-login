const express = require("express");
const db = require("../config/dbconn");
const router = express.Router();
const uploads = require("../config/fileupload");

router.post("/", (req, res) => {
  res.send(req.body.name);
});
router.post("/register", uploads.single("file"), (req, res) => {
  const { name, email, password, age, gender, category, file } = req.body;
  const img = req.file;
  if (!img) {
    res.status(400).json({ error: "Please enter file" });
  }
  const imgname = req.file.originalname;

  // Regex for email
  const testMail =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  // Checking that all fields are filled
  if (!name || !email || !password || !age || !gender || !category) {
    res.status(400).json({ error: "Please enter all fields" });
    // Checking if email is valid
  } else if (!testMail.test(req.body.email)) {
    res.status(400).json({ error: "invalid mail" });
    // Checking if age is valid
  } else if (isNaN(age)) {
    res.status(400).json({ error: "Invalid age" });
  } else {
    // Checking if email id already exists
    const findEmail = "select email from users where email='" + email + "'";
    db.query(findEmail, (err, result) => {
      if (err) {
        res.status(400).json({ err });
      } else {
        if (result.length != 0) {
          res.status(403).json({ error: "Email already taken" });
          // All validations passed
        } else {
          const currentDate = new Date();
          const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
          const date = `${currentDate.getFullYear()}-${
            currentDate.getMonth() + 1
          }-${currentDate.getDate()}`;
          const dateAndTime = `${date} ${time}`;
          // Storing into the database
          const query =
            "INSERT INTO users VALUES ('" +
            name +
            "', '" +
            email +
            "', '" +
            password +
            "', '" +
            age +
            "', '" +
            gender +
            "', '" +
            category +
            "', '" +
            imgname +
            "', '" +
            date +
            "', '" +
            time +
            "', '" +
            dateAndTime +
            "')";
          db.query(query, (err, result) => {
            if (err) {
              res.status(400).json({ err });
            } else {
              res.status(200).json({ result });
            }
          });
        }
      }
    });
  }
});

module.exports = router;
