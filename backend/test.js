const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("image"), (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    res.json({
        success: true
    });
});

app.listen(5001, () => {
    console.log("Server running on 5001");
});