const { findUser } = require("./sql")

const requiredLogin = (req, res, next) => {
     if (req.session && req.session.user) {
          findUser(req.session.user.email, '', (user, err) => {
               if (!user)
                    res.redirect("/")
               else
                    next()
          })
     }
     else
          res.redirect("/")
}

const requiredNotLogin = (req, res, next) => {
     if (req.session && req.session.user)
          res.redirect("/home")
     else
          next()
}

const requiredNotEmp = (req, res, next) => {
     if (req.session && req.session.user) {
          if (req.session.user.role === "employee")
               res.redirect("/home")
          else
               next()
     }
     else {
          res.redirect("/")
     }
}

const requiredAdmin = (req, res, next) => {
     if (req.session && req.session.user) {
          findUser(req.session.user.email, '', (user, err) => {
               if (!user || err)
                    res.redirect("/")
               else {
                    if (user.role === 'admin')
                         next()
                    else
                         res.redirect("/home")
               }
          })
     }
     else
          res.redirect("/")
}

module.exports = { requiredLogin, requiredNotLogin, requiredAdmin, requiredNotEmp }