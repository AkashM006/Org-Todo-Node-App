const sql = require('mssql');

const config = {
     user: process.env.USER_NAME,
     password: process.env.PASSWORD,
     server: process.env.SERVER,
     database: process.env.DB,
     options: {
          encrypt: false,
          trustedconnection: true,
          enableArithAbort: true,
          instancename: process.env.INSTANCE
     },
     port: 32273
}

const pool2 = new sql.ConnectionPool(config);
const pool2Connect = pool2.connect()

const createOrg = (email, name, phone, password, orgName, type, callback) => {

     pool2Connect.then(pool => {
          pool.request()
               .input('orgName', sql.VarChar(50), orgName)
               .input('orgType', sql.Bit, type)
               .input('personName', sql.VarChar(20), name)
               .input('phone', sql.BigInt, phone)
               .input('email', sql.VarChar(30), email)
               .input('password', sql.VarChar(50), password)
               .execute('spcreateOrg', (err, res) => {
                    if (err)
                         callback(null, null, err)
                    else {
                         let user = {
                              email, name, orgName, role: 'admin'
                         }
                         callback(res, user, null)
                    }
               })
     })
          .catch(err => {
               callback(null, null, err)
               console.log("Err in sql.js:", err)
          })

}

const createUser = (name, email, phone, role, orgName, callback) => {

     pool2Connect.then(pool => {
          pool.request()
               .input("name", sql.VarChar(30), name)
               .input("email", sql.VarChar(30), email)
               .input("phone", sql.BigInt, phone)
               .input("role", sql.VarChar(10), role)
               .input("org_name", sql.VarChar(50), orgName)
               .execute('spcreateuser', (err, res) => {
                    if (err) {
                         callback(null, null, err)
                    }
                    else {
                         let user = {
                              name, email, phone, role
                         }
                         callback(user, res, null)
                    }
               })
     })
          .catch(err => {
               callback(null, null, err)
               console.log("Error in sql.js:", err)
          })
}

const createProject = (projectName, leader, type, orgName, callback) => {
     pool2Connect.then(pool => {
          pool.request()
               .input("project_name", sql.VarChar(20), projectName)
               .input("type", sql.VarChar(20), type)
               .input("org_name", sql.VarChar(50), orgName)
               .input("email", sql.VarChar(30), leader)
               .execute("spCreateProject", (err, res) => {
                    if (err)
                         callback(null, err)
                    else {
                         if (res.returnValue !== 0)
                              callback(null, "There has been an error please try again!")
                         else
                              callback(res, null)
                    }
               })
     })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js:", err)
          })
}

const createTask = (obj, endDate, assg, email, orgName, callback) => {
     console.log(endDate)
     pool2Connect.then(pool => {
          pool.request()
               .input("obj", sql.VarChar(150), obj)
               .input("end_date", sql.VarChar, endDate)
               .input("assg", sql.VarChar(20), assg)
               .input("email", sql.VarChar(30), email)
               .input("org_name", sql.VarChar(30), orgName)
               .execute("spCreateTask", (err, res) => {
                    console.log("Response of create")
                    console.log(res)
                    if (err)
                         callback(null, err)
                    else
                         callback(res, null)
               })
     }).catch(err => {
          callback(null, err)
          console.log("Error in sql.js", err)
     })
}

const regEmpProject = (email, projectName, orgName, callback) => {
     pool2Connect.then(pool => {
          pool.request()
               .input("email", sql.VarChar(30), email)
               .input("project_name", sql.VarChar(20), projectName)
               .input("org_name", sql.VarChar(50), orgName)
               .execute("spAddEmpProject", (err, res) => {
                    if (err)
                         callback(null, err)
                    else
                         callback(res, null)
               })
     })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js : ", err)
          })
}


const regNewUser = (email, name, phone, password, callback) => {
     pool2Connect.then(pool => {
          let query = `update person_table set password = '${password}', person_name = '${name}', role ='employee' 
          where phone = ${phone} and email = '${email}' and role='newbie';`
          return pool.request()
               .query(query)
     })
          .then(res => {
               if (res.rowsAffected[0] === 0) {
                    callback(null, "Please enter valid credentials")
               }
               else {
                    let user = {
                         email, name, phone, role: 'employee'
                    }
                    callback(user, null)
               }
          })
          .catch(err => {
               console.log("Sql.js error :", err)
               callback(null, err)
          })
}

const findOrg = (orgName, callback) => {

     pool2Connect.then(pool => {
          let query = "select org_id from org_table where org_name = '" + orgName + "';"
          return pool.request()
               .query(query)
     })
          .then(res => {
               if (res.rowsAffected[0] === 0)
                    callback(0)
               else
                    callback(1)
          })
          .catch(err => {
               callback(1)
               console.log("Error in sql.js:", err)
          })
}

const findUser = (email, password, callback) => {

     pool2Connect.then(pool => {
          let sqlQuery = ''
          if (password === '')
               sqlQuery = "select email,role,person_name as name,phone from person_table where email = '" + email + "'";
          else
               sqlQuery = `select email,role,person_name as name,phone,org_table.org_name from person_table 
                    inner join employed_table on employed_table.person_id = person_table.person_id 
                    inner join org_table on employed_table.org_id = org_table.org_id
                    where email = '${email}' and password = '${password}'`
          return pool.request()
               .query(sqlQuery)
     })
          .then(res => {
               callback(res.recordset[0], null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js", err)
          })
}

const findPhone = (phone, callback) => {

     pool2Connect.then(pool => {
          let query = "select person_name from person_table where phone = " + phone + ";"
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res.recordset[0], null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js:", err)
          })
}

const findUserSameOrg = (orgName, email, callback) => {
     pool2Connect.then(pool => {
          let query = `select person_name,email,phone,role from person_table 
          inner join employed_table on employed_table.person_id = person_table.person_id 
          inner join org_table on org_table.org_id = employed_table.org_id 
          where org_name = '${orgName}' and email<>'${email}';`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res.recordsets, null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js :", err)
          })
}

const updateUser = (oldEmail, email, name, oldPhone, phone, oldPassword, role, password, condition, callback) => {
     pool2Connect.then(pool => {
          let query = ''
          if (condition === 0) {
               query = `update person_table set email = '${email}',person_name='${name}',phone = ${phone} 
               where email = '${oldEmail}' and phone = ${oldPhone};`
          }
          else {
               query = `update person_table set email = '${email}', person_name = '${name}', phone = ${phone}, 
               password = '${password}' where email = '${oldEmail}' and phone = ${oldPhone} and password = '${oldPassword}';`
          }
          return pool.request()
               .query(query)
     })
          .then(res => {
               let user = {
                    email, name, phone, role
               }
               callback(res, user, null)
          })
          .catch(err => {
               callback(null, null, err)
          })
}

const deleteUser = (email, callback) => {
     pool2Connect.then(pool => {
          query = `delete from person_table where email = ${email}`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               console.log("Error in sql.js:", err)
               callback(null, err)
          })
}

const findUnEmp = (orgName, callback) => {
     pool2Connect.then(pool => {
          let query = `select person_name,phone,role,email from person_table 
          inner join employed_table on employed_table.person_id = person_table.person_id 
          inner join org_table on org_table.org_id = employed_table.org_id 
          left join worked_by_table on worked_by_table.person_id = person_table.person_id 
          where org_name = '${orgName}' and role <> 'admin  ' and worked_by_table.person_id is null`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               console.log("Error in sql.js:", err)
               callback(null, err)
          })
}

const findProject = (projectName, callback) => {
     pool2Connect.then(pool => {
          let query = `select * from project_table where project_name ='${projectName}'`

          return pool.request()
               .query(query)
     })
          .then(res => {
               if (res.rowsAffected[0] === 0)
                    callback(res, null)
               else
                    throw "There is already a project with the same name. Please enter a unique project name!"
          })
          .catch(err => {
               console.log("Error in sql.js :", err)
               callback(null, err)
          })
}

const getOrgProjects = (orgName, callback) => {
     pool2Connect.then(pool => {
          return pool.request()
               .query(`select project_name from manages_table 
          inner join org_table on org_table.org_id = manages_table.org_id and org_name = '${orgName}' 
          inner join project_table on project_table.project_id = manages_table.project_id`)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               console.log("ERror in sql.js :", err)
               callback(null, err)
          })
}

const getProjectInfo = (orgName, callback) => {
     pool2Connect.then(pool => {
          let query = `select person_name,project_name from worked_by_table 
          inner join person_table on worked_by_table.person_id = person_table.person_id and role = 'leader' 
          inner join project_table on project_table.project_id = worked_by_table.project_id 
          inner join manages_table on manages_table.project_id = project_table.project_id 
          inner join org_table on manages_table.org_id = org_table.org_id and org_name='${orgName}'`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               console.log("Error in sql.js", err)
               callback(null, err)
          })
}

const getDetailProject = (projectName, callback) => {
     let employeeCount = 0;
     let taskCount = 0;
     pool2Connect.then(pool => {
          pool.request()
               .input("project_name", sql.VarChar(20), projectName)
               .output("employee_count", sql.Int, employeeCount)
               .output("task_count", sql.Int, taskCount)
               .execute("spGetProjectDetail", (err, res) => {
                    if (err)
                         callback(null, err)
                    else
                         callback(res, null)
               })
     })
          .catch(err => {
               console.log("Error in sql.js:", err)
          })
}

const deleteProject = (projectName, callback) => {
     pool2Connect.then(pool => {
          let query = `delete from leads_table where leader_id =  (select person_table.person_id from worked_by_table 
               inner join person_table on person_table.person_id = worked_by_table.person_id and role = 'leader' 
               inner join project_table on project_table.project_id = worked_by_table.project_id and project_name = '${projectName}');
               delete from project_table where project_name = '${projectName}';`
          return (pool.request()
               .query(query))
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               callback(null, err)
          })
}

const findGivenTasks = (email, callback) => {
     pool2Connect.then(pool => {
          let query = `set dateformat ymd;select person_name,email,task_table.objective,end_date,status from assigned_table 
          inner join person_table on assigned_table.person_id = person_table.person_id 
          inner join task_table on task_table.task_id = assigned_table.task_id
          where assignee_id = (select person_id from person_table where email = '${email}')`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js :", err)
          })
}

const findAssignedTasks = (email, callback) => {
     pool2Connect.then(pool => {
          let query = `select task_table.task_id,person_name,email,objective,end_date,status from assigned_table 
          inner join person_table on assigned_table.assignee_id = person_table.person_id 
          inner join task_table on task_table.task_id = assigned_table.task_id
          where assigned_table.person_id = (select person_id from person_table where email = '${email}')
          `
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error in sql.js", err)
          })
}

const getEmpProject = (email, callback) => {
     pool2Connect.then(pool => {
          let query = `select person_name,email from leads_table 
          inner join person_table on leads_table.person_id = person_table.person_id
          where leader_id = (select person_id from person_table where email = '${email}')`
          return pool.request()
               .query(query)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error :", err)
          })
}

const setTaskFinished = (taskId, callback) => {
     pool2Connect.then(pool => {
          return pool.request()
               .query(`update task_table set status = 1 where task_id = ${taskId}`)
     })
          .then(res => {
               callback(res, null)
          })
          .catch(err => {
               callback(null, err)
               console.log("Error :", err)
          })
}

module.exports = {
     createOrg, findOrg, findUser, findPhone,
     createUser, findUserSameOrg, regNewUser, updateUser, findUnEmp, findProject,
     createProject, getOrgProjects, regEmpProject, getProjectInfo, getDetailProject, deleteProject,
     createTask, deleteUser, findGivenTasks, findAssignedTasks, getEmpProject, setTaskFinished
}