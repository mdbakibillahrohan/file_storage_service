require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const UPLOADED_DESTINATION = "public";
app.use(cors({
  origin: "*"
}))
// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./${UPLOADED_DESTINATION}`);
  },
  filename: function (req, file, cb) {
    if (!fs.existsSync(UPLOADED_DESTINATION)) {
      fs.mkdirSync("./" + UPLOADED_DESTINATION);
    }
    const ext = path.extname(file.originalname);
    const fileName =
      file.originalname.replace(ext, "").split(" ").join("-") +
      Date.now() +
      ext;
    cb(null, fileName);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1000000,
  },
});

// Serve static files from the 'public' directory
app.use("/files", express.static("public"));

// Route for uploading files
app.post("/upload", upload.single("file"), (req, res) => {
  const fileName = req.file.filename;
  res.json({
    message: "Successfully uploaded",
    fileName,
  });
});

// Route for downloading files
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    UPLOADED_DESTINATION,
    req.params.filename
  );
  fs.exists(filePath, (exists) => {
    if (exists) {
      res.download(filePath);
    } else {
      res.status(404).send("File not found!");
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
