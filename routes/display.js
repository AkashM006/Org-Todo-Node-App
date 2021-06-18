const express = require("express")
const app = express.Router()
const { requiredLogin, requiredAdmin } = require("../session");
const { findUserSameOrg, getProjectInfo, getDetailProject, findGivenTasks, findAssignedTasks } = require("../sql")

app.get("/emp", requiredLogin, (req, res) => {
     res.render("disp-emp", {
          user: req.session.user
     })
})

app.post("/emp", requiredLogin, (req, res) => {
     let orgName = req.session.user.orgName ? req.session.user.orgName : req.session.user.org_name
     findUserSameOrg(orgName, req.session.user.email, (resp, err) => {
          let msg = ''
          let data = null
          if (err) {
               res.status(403)
               console.log(err)
               msg = 'error'
          }
          else {
               res.status(200)
               msg = "Success"
               data = resp.map(value => JSON.stringify(value))
          }
          res.send(JSON.stringify({ msg, data }))
     })
})

app.get("/project", requiredAdmin, (req, res) => {
     res.render("disp-project", {
          user: req.session.user
     })
})

app.post("/project", requiredAdmin, (req, res) => {
     let orgName = req.session.user.org_name ? req.session.user.org_name : req.session.user.orgName
     console.log(orgName)
     getProjectInfo(orgName, (resp, err) => {
          let msg = ''
          let records = null
          if (err) {
               res.status(403)
               msg = 'There has been an error please try again'
          }
          else {
               res.status(200)
               msg = 'Here are the records!'
               records = resp.recordset
          }
          res.send(JSON.stringify({ msg, records }))
     })
})

app.get("/:projectName/:leaderName", requiredAdmin, (req, res) => {
     const { leaderName, projectName } = req.params
     getDetailProject(projectName, (resp, err) => {
          if (err)
               res.send(err)
          else {
               res.render("disp-det-project", {
                    projectName,
                    leaderName,
                    employees: resp.output.employee_count,
                    tasks: resp.output.task_count
               })
          }
     })
})

app.get("/task-given", requiredLogin, (req, res) => {
     let email = req.session.user.email;
     findGivenTasks(email, (resp, err) => {
          if (err)
               res.send(err)
          else {
               resp.recordset.forEach(element => {
                    element.end_date = convert(element.end_date)
                    element.objective = element.objective.substring(0, 100) + "..."
               });
               console.log(resp.recordset)
               res.render('disp-task', {
                    tasks: resp.recordset
               })
          }
     })
})

app.get("/task-to-you", requiredLogin, (req, res) => {
     let email = req.session.user.email
     findAssignedTasks(email, (resp, err) => {
          if (err)
               res.send(err)
          else {
               resp.recordset.forEach(element => {
                    element.end_date = convert(element.end_date)
                    element.objective = element.objective.substring(0, 100) + "..."
               });
               console.log(resp.recordset)
               res.render('disp-assig', {
                    tasks: resp.recordset
               })
          }
     })
})

function convert(str) {
     var date = new Date(str),
          mnth = ("0" + (date.getMonth() + 1)).slice(-2),
          day = ("0" + date.getDate()).slice(-2);
     return [date.getFullYear(), mnth, day].join("-");
}

module.exports = app;