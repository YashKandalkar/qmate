import { loginUser } from "../firebaseApi/auth.js";

const loginButtin = document.getElementById("login-btn");

loginButtin.addEventListener("click", (event) => {
  event.preventDefault();
  const loginForm = document.getElementById("login-form");

  const formData = new FormData(loginForm);
  loginUser(
    formData.get("email"),
    formData.get("password"),
    (user) => {
      console.log("Logged in with user ID: ", user.uid);
    },
    (error) => {
      console.log("Failed: ", error);
    }
  );
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    console.log(uid);
  } else {
    // User is signed out
    // ...
    console.log("not logged in");
  }
});
