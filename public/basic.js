let email = null;
if (document.querySelector("#email")) {
     email = document.querySelector("#email");
     email.select();
}

const clearAll = () => {
     let form = document.querySelector("form")
     form.reset()
     email.select()
}