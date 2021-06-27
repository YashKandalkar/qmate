firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

  } else {
    location.href = 'login.html';
  }
});
