var express = require('express'), bodyParser = require('body-parser'),
  app = express(), atob = require('atob'), btoa = require('btoa'),
  port = process.env.PORT || 3000;


var path = require("path");


let counter = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
  if (req.body.email === 'hamza@hamzakilic.com')
    res.send({ email: 'hamza@hamzakilic.com', id: 5, token: 'abcdfasdf' });
  else if ((req.body.email && req.body.password ) && req.body.email !== 'hamza@hamzakilic.com')
    res.status(401).send('not authorized');
  else res.status(500).send('internal server error');

});


app.post('/api/captive', (req, res) => {
  var statistics =
  {
    rushDay : "Pazar",
    newUserCount : 12,
    totalUserCount: 130,
    onlineUserCount: 5
  }
  res.status(200).send(statistics);
});

app.listen(port);

console.log('RESTful API server started on: ' + port);
