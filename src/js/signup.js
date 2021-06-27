import { getUserData } from "../firebaseApi/auth.js";

document
  .getElementById("signup-form-btn")
  .addEventListener("click", (event) => {
    event.preventDefault();
    console.log("cick");
    getUserData();
  });
