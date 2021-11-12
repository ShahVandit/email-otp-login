const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "posts");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Please insert an image"), false);
  }
};

const uploads = multer({ storage, fileFilter, limits });

module.exports = uploads;
