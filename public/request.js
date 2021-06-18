const promiseHandler = (res, errMsg) => {
     if (res.status >= 200 && res.status < 300)
          return Promise.resolve(res)
     else
          return Promise.reject(new Error(errMsg))
}

const getEmailCustom = (email) => {
     return (fetch("/validate/email", {
          method: 'POST',
          mode: "same-origin",
          headers: {
               "Content-type": "application/json"
          },
          body: JSON.stringify({ email })
     }))
}

const getPhoneCustom = (Phone) => {
     return (fetch("/validate/phone", {
          method: 'POST',
          mode: "same-origin",
          headers: {
               "Content-type": "application/json"
          },
          body: JSON.stringify({ Phone })
     }))
}

const getProjectName = (projectName) => {
     return (fetch("/validate/project", {
          method: 'POST',
          mode: "same-origin",
          headers: {
               'Content-type': "application/json"
          },
          body: JSON.stringify({ projectName })
     }))
}