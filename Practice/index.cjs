const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/User', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pass1: String,
    pass2: String
});

const User = mongoose.model('User', userSchema);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.locals.activeTab = req.path;
    next();
});
app.use(express.json());

app.get("/secret", function (req, res) {
    res.render("./pages/secret");
});

app.get('/', (req, res) => {
    res.render('./pages/home');
});

app.get('/login', (req, res) => {
    res.render('./pages/login');
});

app.post("/login", async function (req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            const result = req.body.pass2 === user.pass2;
            if (result) {
                res.render("./pages/secret");
            } else {
                res.status(400).json({ error: "Password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
  
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(400).json({ error });
    }
});

app.get('/register', (req, res) => {
    res.render('./pages/signup');
});

app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            pass1: req.body.pass1,
            pass2: req.body.pass2
        });
        await newUser.save();
        res.status(200).redirect('/login'); // Redirect to login page after successful registration
    } catch (error) {
        res.status(400).json({ error });
    }
});

app.listen(port, () => {
    console.log("App running");
});
