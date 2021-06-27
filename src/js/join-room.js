let inp = document.getElementById("room-id");
let btn = document.getElementById("join-button");

btn.onclick = async () => {
  if (!inp.value) {
    alert("Please input a room!");
  } else {
    const roomSnap = await firebase
      .database()
      .ref("rooms/" + inp.value)
      .once("value");

    if (!roomSnap.val()) {
      alert("Please enter a valid room ID");
    } else {
      location.href = "/join.html?id=" + inp.value;
    }
  }
};
