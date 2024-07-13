const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./routes/auth'); // Adjust the path as necessary

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'salamJindagi_securityKey__xxx',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using https
}));

app.use('/auth', auth);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
