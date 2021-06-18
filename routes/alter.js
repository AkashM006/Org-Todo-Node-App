const express = require("express");
const app = express.Router();
const { requiredLogin, requiredAdmin } = require("../session");
const { createUser, findUser, updateUser, getOrgProjects, regEmpProject, setTaskFinished } = require("../sql")

app.get("/emp/:email", requiredAdmin, (req, res) => {
     let email = req.params.email;
     findUser(email, '', (data, err) => {
          if (err)
               res.send("404: Not Found")
          else
               res.render("create-emp", {
                    user: req.session.user,
                    prop: "alteration",
                    emp: data
               })
     })
})

app.post("/emp", requiredAdmin, (req, res) => {
     let { email, Phone, Name, Role } = req.body
     console.log(req.body)
     console.log(req.session.user)
     createUser(Name, email, Phone, Role, req.session.user.org_name, (user, resp, err) => {
          let msg = ''
          if (err) {
               res.status(403)
               console.log("alter.js err:", err)
               msg = "There has been an error.Please try again!"
          }
          else {
               res.status(200)
               msg = "User altered successfully"
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.get("/profile", requiredLogin, (req, res) => {
     let { email } = req.session.user
     res.render("alter-profile", {
          user: req.session.user
     })
})

app.post("/profile", requiredLogin, (req, res) => {
     let { name, email, phone, passCon, password, newPassword } = req.body
     let oldPhone = req.session.user.phone
     let role = req.session.user.role
     let oldEmail = req.session.user.email
     updateUser(oldEmail, email, name, oldPhone, phone, password, role, newPassword, passCon, (resp, user, err) => {
          let msg = ''
          if (err) {
               msg = 'There has been an error please contact the admin!'
               res.status(404)
          }
          else {
               req.session.reset()
               res.status(200)
               msg = "Profile successfully altered!"
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.get("/emp-project", requiredAdmin, (req, res) => {
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     getOrgProjects(orgName, (resp, err) => {
          if (err) {
               res.send(err)
          }
          else {
               res.render("add-emp", {
                    projects: resp.recordset
               })
          }
     })
})

app.post("/emp-project", requiredAdmin, (req, res) => {
     let { email, projectName } = req.body
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     regEmpProject(email, projectName, orgName, (resp, err) => {
          console.log(resp)
          let msg = ''
          if (err) {
               msg = 'There has been an error please try again!'
               res.status(403)
          }
          else {
               msg = 'User added to project'
               res.status(200)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.post("/fin/:taskId", requiredLogin, (req, res) => {
     let { taskId } = req.params
     setTaskFinished(taskId, (resp, err) => {
          if (err)
               res.send("There has been an error Please try again!<hr><form method='GET' action='/home'><button>Home<button></form>")
          else {
               res.send("Task set as finished!<hr><form method='GET' action='/home'><button>Home</button></form>")
          }
     })
})

module.exports = app