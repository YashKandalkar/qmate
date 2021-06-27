let db = firebase.database();

export const loginUser = (
  email,
  password,
  successCallback,
  failureCallback
) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      const user = userCredentials.user;
      // TODO
      successCallback(user);
    })
    .catch((error) => {
      console.error(error);
      failureCallback(error);
      // TODO
    });
};

const setUser = (name, user) => {
  db.ref("/users/" + user.uid)
    .set({
      name,
      email: user.email,
    })
    .then(() => {
      location.href = "host.html";
    });
};

const signupUser = (name, email, password) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      setUser(name, user);
      console.log("logged in as: ", ususerCredential.user.uid);
    })
    .catch((error) => {
      console.error(error);
      return { err: error };
    });
};

export const getUserData = () => {
  let signupForm = document.forms["signup-form"];
  let userName = signupForm["userName"].value;
  let email = signupForm["email"].value;
  let password = signupForm["password"].value;
  signupUser(userName, email, password);
};
