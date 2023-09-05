const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    sendfile("testUI.html");
});



app.listen(8085, () => {
    console.log("listening on 8085");
}