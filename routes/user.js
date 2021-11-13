const express = require("express");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const db = require("../config/dbconn");
const router = express.Router();
const uploads = require("../config/fileupload");
const bcrypt = require("bcrypt");
const { verifyToken, signToken, decodeToken } = require("../config/jwt");

// Registering the user(Create)
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
          // Hashing the password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                res.json({ error: err });
              } else {
                var hashpassword = hash;
                const currentDate = new Date();
                const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
                const date = `${currentDate.getFullYear()}-${
                  currentDate.getMonth() + 1
                }-${currentDate.getDate()}`;
                const dateAndTime = `${date} ${time}`;
                // Storing into the database
                let query =
                  "INSERT INTO users(name,email,password,age,gender,category,file,date,time,dateAndTime) VALUES ('" +
                  name +
                  "', '" +
                  email +
                  "', '" +
                  hashpassword +
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
            });
          });
        }
      }
    });
  }
});
// Get all records(Read)
router.get("/posts", (req, res) => {
  let query = "select * from users";
  db.query(query, (err, result) => {
    if (err) {
      res.status(400).json({ err });
    } else {
      if (result.length == 0) {
        res.status(400).json({ message: "No posts availble" });
      } else {
        res.status(200).json({ result });
      }
    }
  });
});

// Specific id
router.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  let query = "select * from users where email ='" + id + "'";
  db.query(query, (err, rows, result) => {
    if (err) {
      res.status(400).json({ err });
    } else {
      if (result.length == 0) {
        res.status(400).json({ message: "No posts availble" });
      } else {
        res.status(200).json({ result });
      }
    }
  });
});

// Update the password(authenticated)(Update)
router.put("/updatepass", verifyToken, (req, res) => {
  // Getting the email id from the token
  const email = decodeToken(req.cookies["jwt-token"]);
  if (!req.body.password) {
    res.status(400).json({ error: "Please enter password" });
  }
  let query =
    "update users set password='" +
    req.body.password +
    "' where email ='" +
    email +
    "";
  db.query(query, (err, result) => {
    if (err) {
      res.status(400).json({ err });
    } else {
      if (result.length == 0) {
        res.status(400).json({ message: "Email id doesnt exist" });
      } else {
        res.status(200).json({ result });
      }
    }
  });
});

// Delete a record(authenticated)(Delete)
router.delete("/posts", verifyToken, (req, res) => {
  const id = decodeToken(req.cookies["jwt-token"]);
  let query = "delete  from users where email ='" + id + "'";
  db.query(query, (err, result) => {
    if (err) {
      res.status(400).json({ err });
    } else {
      if (result.length == 0) {
        res.status(400).json({ message: "No posts availble" });
      } else {
        res.status(200).json({ result });
      }
    }
  });
});
// Generating otp
router.post("/login", (req, res) => {
  const email = req.body.email;
  if (!email) {
    res.status(400).json({ error: "Please enter email" });
  } else {
    let query = "select * from users where email='" + email + "'";
    db.query(query, (err, result) => {
      if (err) res.status(400).json({ err });
      // Email not found in the DB
      if (result.length == 0) {
        res.status(400).json({ error: result });
      } else {
        const secret = speakeasy.generateSecret({ length: 20 });
        const token = speakeasy.totp({
          secret: secret.base32,
          encoding: "base32",
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "<sendersmail>",
            pass: "<senderspassword>",
          },
        });
        const options = {
          from: "<sendersmail>",
          to: email,
          subject: "Your login otp",
          text: `Your OTP is: ${token}, it is valid for 5 minutes`,
        };
        console.log(email, token);
        let date = Date.now();
        let query1 =
          "update users set otp='" +
          token +
          "',otpgen='" +
          date +
          "' where email='" +
          email +
          "' ";
        db.query(query1, (err, result) => {
          if (err) {
            res.status(400).json({ err });
          }
        });
        // Sending the mail
        transporter.sendMail(options, (err, info) => {
          if (err) {
            res.status(400).json(err);
          }
          res.status(200).json({ message: "otp sent" });
        });
      }
    });
  }
});

// Verifying the otp generated(otp valid for 5 mins only)
router.post("/verify", (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  if (otp) {
    let query = "select otp,otpgen from users where email='" + email + "'";
    const fiveMins = 5 * 60 * 1000;
    db.query(query, (err, result) => {
      if (err) res.status(400).json({ err });
      // If the otp is correct && otp is entered within 5 mins of generation
      if (
        otp == result[0].otp &&
        Number(Date.now()) - Number(result[0].otpgen) < fiveMins
      ) {
        // Looging the user and creating jwt
        const jwt = signToken(email);
        if (jwt) {
          res.cookie("jwt", jwt, {
            maxAge: 60 * 60 * 24 * 2 * 2,
            httpOnly: true,
          });
        }

        res.status(200).json({ message: "Logged in" });
        // If otp doesn't match
      } else if (otp != result[0].otp) {
        res.status(403).json({ error: "Incorrect otp" });
        // After 5 mins
      } else {
        res.status(400).json({ error: "Otp expired" });
      }
    });
  }
});

// Authenticated
router.get("/dashboard", verifyToken, (req, res) => {
  console.log(req.signedCookies);
  res.status(200).json({ message: "This is the dashboard" });
});

module.exports = router;
