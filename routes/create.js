const express = require("express");
const app = express.Router();
const { requiredLogin, requiredAdmin, requiredNotEmp } = require("../session");
const { createUser, findUnEmp, createProject, getOrgProjects, createTask, getEmpProject } = require("../sql")

app.get("/emp", requiredLogin, (req, res) => {
     res.render("create-emp", {
          user: req.session.user,
          prop: "creation",
          emp: null
     })
})

app.post("/emp", requiredLogin, (req, res) => {
     const { Name, Email, Phone, Role } = req.body
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName;
     createUser(Name, Email, Phone, Role, orgName, (resp, user, err) => {
          let msg = ''
          if (err || !user) {
               console.log("In create.js err:", err)
               msg = "There has been an error. Please try again!"
               res.status(403)
          }
          else {
               msg = "User created and added to company successfully"
               res.status(200)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.get("/project", requiredAdmin, (req, res) => {
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     findUnEmp(orgName, (resp, err) => {
          let msg = ''
          if (err) {
               res.status(403)
               msg = "There has been an error please try again!"
               res.send("Oops! There seems to be a problem please try again!")
          }
          else {
               res.status(200)
               msg = "Here are the employees!"
               res.render("create-project", {
                    unEmp: resp.recordset
               })
          }
     })

})

app.post("/project", requiredAdmin, (req, res) => {
     let { projectName, leader, type } = req.body
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     createProject(projectName, leader, type, orgName, (resp, err) => {
          let msg = ''
          if (err) {
               res.status(403)
               console.log(err)
               msg = 'There has been an error please try again!'
          }
          else {
               res.status(200)
               msg = 'Project created successfully'
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.get("/task", requiredNotEmp, (req, res) => {
     let orgName = req.session.user.orgName ? req.session.user.orgName : req.session.user.org_name
     let email = req.session.user.email;
     if (req.session.user.role === "admin") {
          getOrgProjects(orgName, (resp, err) => {
               if (err) {
                    res.send("There has been an error! Please try again! <hr><form action='/home' method='GET'><button>Home</button></form>")
               }
               else {

                    res.render("create-task", {
                         projects: resp.recordset,
                         role: req.session.user.role
                    })
               }
          })
     }
     else {
          getEmpProject(email, (resp, err) => {
               if (err) {
                    res.send("There has been an error! Please try again! <hr><form action='/home' method='GET'><button>Home</button></form>")
               }
               else {
                    console.log(resp)
                    res.render("create-task", {
                         projects: resp.recordset,
                         role: req.session.user.role
                    })
               }
          })
     }
})

app.post("/task", requiredNotEmp, (req, res) => {
     let { obj, endDate, assg } = req.body
     let email = req.session.user.email
     let orgName = req.session.user.orgName ? req.session.user.orgName : req.session.user.org_name
     createTask(obj, endDate, assg, email, orgName, (resp, err) => {
          let msg = ''
          if (err) {
               res.status(403)
               msg = 'There has been a problem. Please try again!'
          }
          else {
               res.status(200)
               msg = "Created and assigned the task!"
          }
          res.send(JSON.stringify({ msg }))
     })
})

module.exports = app