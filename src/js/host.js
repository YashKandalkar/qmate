import { getRooms, getRoomName, createNewRoom , deleteRoom } from "../firebaseApi/hostApi.js";

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    let uid = user.uid;
    let rooms = await getRooms(uid);

    await displayRooms(rooms);
    setListeners();

  } else {
    location.href = "login.html";
  }
});

const setListeners = () => {

  let rooms = document.getElementsByClassName("rooms")
  let n = rooms.length;
  for (let i = 0; i < n; i++) {
    rooms[i].childNodes[0].addEventListener("click", (event) => {
      location.href = `/createquiz.html?id=${event.target.attributes.roomID.value}`;
    });

    rooms[i].childNodes[1].addEventListener("click" , (event)=>{
      deleteRoom(event.target.attributes.roomID.value);
    })

    rooms[i].childNodes[2].addEventListener("click", (event) => {
      location.href = `/room.html?id=${event.target.attributes.roomID.value}`;
    });
  }
};

const displayRooms = (rooms) => {
  return new Promise(async (res, rej) => {
    let roomList = document.getElementById("room-list");
    let n = rooms.length;
    for (let i = 0; i < n; i++) {
      let roomInfo = document.createElement('li');
      roomInfo.setAttribute("class", "rooms quiz-div effect-1 col-md-10 border border-light shadow shadow-sm mt-5 ml-5");
      let name = await getRoomName(rooms[i]);
      roomInfo.innerHTML = `<div roomID="${rooms[i]}">${name}</div><button class="btn btn-danger" roomID="${rooms[i]}">Delete</button><button class="btn btn-primary" roomID="${rooms[i]}">HOST</button>`;
      roomList.appendChild(roomInfo);
    }
    res();
  });
};

document.getElementById('submit-room-name').addEventListener('click' , ()=>{
  let roomName = document.getElementById('room-name').value;
  createNewRoom(roomName);
});

