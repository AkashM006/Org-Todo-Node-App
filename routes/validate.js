const express = require("express");
const { requiredAdmin } = require("../session");
const app = express.Router();
const { findOrg, findUser, findPhone, findProject, findUnEmp } = require("../sql");

app.post("/orgName", (req, res) => {
     let { orgName } = req.body;
     let msg = ''
     let stat = 0
     findOrg(orgName, (result) => {
          stat = result
          if (result === 1) {
               msg = "The given company already exists! Please enter a unique company name"
               res.status(403)
          }
          else {
               msg = "The company has a unique name"
               res.status(200)
          }
          res.send(JSON.stringify({ msg, stat }))
     })
})

app.post("/email", (req, res) => {
     let { email } = req.body
     findUser(email, '', (user, err) => {
          let msg = ''
          if (err) {
               msg = 'There has been a problem please contact the admin'
               res.status(404)
          }
          if (!user) {
               msg = "Email doesn't exist"
               res.status(200)
          }
          else {
               msg = "Email already exists.Please enter a unique email"
               res.status(403)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.post("/phone", (req, res) => {
     let { Phone } = req.body
     findPhone(Phone, (user, err) => {
          let msg = ''
          if (err) {
               msg = "There has been a problem please contact the admin"
               res.status(404)
          }
          if (!user) {
               msg = "Phone doesn't exist"
               res.status(200)
          }
          else {
               msg = "Phone number already exists. Please enter a unique number!"
               res.status(403)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.post("/project", requiredAdmin, (req, res) => {
     let { projectName } = req.body
     findProject(projectName, (resp, err) => {
          let msg = ''
          if (err) {
               msg = "Please enter a unique project name"
               res.status(403)
          }
          else {
               msg = "There are no projects on the same name"
               res.status(200)
          }
          res.send(JSON.stringify(msg))
     })
})

app.post("/unemp", requiredAdmin, (req, res) => {
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     findUnEmp(orgName, (resp, err) => {
          let records = null
          let msg = ''
          if (err) {
               msg = "There has been an error please try again!"
               res.status(403)
          }
          else {
               msg = "Here are the emps"
               res.status(200)
               records = resp.recordset
          }
          res.send(JSON.stringify({ records, msg }))
     })
})

module.exports = app