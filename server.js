const express = require('express')
const app = express()
const util = require('./util.js');
const init = require("./index")
const port = 3000

// 定义微信服务器接口获取微信服务器携带过来的参数。
app.get("/wechat", (req, res) => {
    const { signature, echostr, timestamp, nonce } = req.query;
    const token = "yukuai";
    const str = [token, timestamp, nonce].sort().join("");
    const sha1Str = util.sha1(str);
    sha1Str === signature ? res.send(echostr) : res.send("error");
});

app.get("/", (req, res) => {
    res.send("212")
});

app.listen(port, () => {
  init();
  console.log(`Example app listening at http://localhost:${port}`)
})