const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("TEST WORKS");
});

app.listen(3000, () => {
    console.log("Test server on port 3000");
});
