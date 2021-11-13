const jwt = require("jsonwebtoken");

const signToken = (email) => {
  const lol = jwt.sign({ email }, "secret", {
    expiresIn: "1h",
  });
  return lol;
};

const verifyToken = (req, res, next) => {
  const accessToken = req.cookie["jwt"];
  console.log(accessToken);
  if (!accessToken) {
    res.status(400).json({ error: "User not Authenticated!" });
  } else {
    var verify = jwt.verify(accessToken, "secret");
    try {
      if (verify) {
        next();
      } else {
        res.status(403).json("You are not logged in");
      }
    } catch (err) {
      res.status(400).json({ error: err });
    }
    return accessToken;
  }
  console.log(req.cookies["jwt"]);
};

const decodeToken = (token) => {
  const payload = jwt.decode(token);
  return payload.email;
};

module.exports = { verifyToken, decodeToken, signToken };
