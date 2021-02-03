const { request } = require("express");
const express = require("express");
const app = express();
const port = 8000;
const connection = require("./config");

app.use(express.json());

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});