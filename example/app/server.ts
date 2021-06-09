import express from "express";
const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  let body = "Hello World!";
  if (process.env.MESSAGE) {
    body += "<br>" + process.env.MESSAGE;
  }
  res.send(body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
