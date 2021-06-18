const express = require("express")
const app = express.Router();
const { requiredAdmin } = require("../session")
const { deleteUser, deleteProject } = require("../sql")

app.get("/emp", requiredAdmin, (req, res) => {
     let { email } = req.body
     console.log("Received")
     deleteUser(email, (res, err) => {
          if (err) {
               res.status(403)
               msg = 'There has been an error please try again!'
               console.log(err)
          }
          else {
               console.log(res)
               msg = 'success'
               res.status(200)
          }
          res.send(JSON.stringify({ msg }))
     })
})

app.post("/:projectName", requiredAdmin, (req, res) => {
     const { projectName } = req.params
     deleteProject(projectName, (resp, err) => {
          if (err)
               res.send(err)
          else {
               if (resp.rowsAffected[0] && resp.rowsAffected[1] === 1) {
                    res.send("Project successfully dropped!<hr><form action='/home' method='GET'><button>Home</button></form>")
               }
               else {
                    console.log(resp)
                    res.send("There has been a problem please try again!<hr><form action='/home' method='GET'><button>Home</button></form>")
               }
          }
     })
})

module.exports = app