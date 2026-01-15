const express = require("express");
const app = express();

app.get("/", (req, res) => {
    console.log("Request received!");
    res.send("8080 WORKS");
});

app.listen(8080, () => {
    console.log("Test server on port 8080");
});
