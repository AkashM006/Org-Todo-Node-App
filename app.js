const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const session = require("client-sessions");
const { createOrg, findUser, regNewUser } = require("./sql");
const validate = require("./routes/validate");
const create = require("./routes/create")
const display = require("./routes/display")
const alter = require("./routes/alter")
const del = require("./routes/delete")
const { requiredLogin, requiredNotLogin } = require("./session")

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
     cookieName: 'session',
     secret: "/\"/k7'S{QAx<7w\\o<\'\+K}",
     duration: 2 * 24 * 60 * 60 * 1000,
     activeDuration: 5 * 60 * 100,
     httpOnly: true,
     secure: true
}))

app.use("/validate", validate)
app.use("/create", create)
app.use("/disp", display)
app.use("/alter", alter)
app.use("/delete", del)

app.post("/create-org", requiredNotLogin, (req, res) => {
     let { Email, Name, Phone, Password, orgName, type } = req.body;
     type = type === 'professional' ? 0 : 1;
     createOrg(Email, Name, Phone, Password, orgName, type, (data, user, err) => {
          let msg = ''
          let stat = 0
          if (err) {
               msg = err
               stat = 1
          }

          else {
               msg = "Success"
               req.session.user = user
          }
          res.send(JSON.stringify({ msg, stat }))
     })
})

app.get('/create-org', requiredNotLogin, (req, res) => {
     res.render("create-org.ejs")
})

app.get("/new-emp", requiredNotLogin, (req, res) => {
     res.render("new-emp")
})

app.post("/new-emp", requiredNotLogin, (req, res) => {
     let { Name, Email, Password, Phone } = req.body
     regNewUser(Email, Name, Phone, Password, (user, err) => {
          let msg = ''
          if (err) {
               res.status(403)
               msg = "Please enter valid credentials!!"
          }
          else {
               res.status(200)
               msg = "Successfully registered as new user"
               req.session.user = user
          }
          res.send({ msg })
     })
})

app.post('/', (req, res) => {
     const { email, password } = req.body
     findUser(email, password, (user, err) => {
          let msg = ''
          if (err) {
               console.log("Error in app.js:", err)
               msg = "User name or password is incorrect. Please try again..."
               res.status(403)
          }
          if (!user) {
               msg = "User name or password is incorrect. Please try again..."
               res.status(403)
          }
          else {
               msg = "User authenticated successfully"
               req.session.user = user
               res.status(200)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.post("/logout", requiredLogin, (req, res) => {
     req.session.reset()
     res.redirect("/")
})

app.get('/home', requiredLogin, (req, res) => {
     // console.log(req.session.user)
     res.render("home", {
          user: req.session.user
     });
})

app.get('/', requiredNotLogin, (req, res) => {
     res.render("login");
})

app.listen(3000, () => {
     console.log("Server is listening to port 3000")
})

module.exports = { requiredLogin }