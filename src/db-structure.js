import db from "./firebaseApi/firebase.js";
firebase
  .database()
  .ref("/")
  .set({
    users: {
      id1: {
        name: "",
        email: "",
        rooms: {
          id1: true,
          // ...
        },
      },
      id2: {
        name: "",
        email: "",
      },
    },

    rooms: {
      id1: {
        roomName: "",
        questionIds: {
          "1id": true,
          "2id": true,
        },
        participantsId: {
          userid1: true,
          userid2: true,
        },
        result: {
          userid1: 90,
          userid2: 80,
        },
      },
      id2: {
        roomName: "",
        questionIds: {
          "3id": true,
        },
        participantsId: {
          userid1: true,
          userid2: true,
        },
      },
    },

    ques: {
      "1id": {
        roomId: "id1",
        question: "",
        option1: "",
        opt2: "",
        correct: "",
        time: "",
      },
      "2id": {
        roomId: "id1",
        question: "",
        option1: "",
        opt2: "",
        correct: "",
        time: "",
      },
      "3id": {
        roomId: "id2",
        question: "",
        option1: "",
        opt2: "",
        correct: "",
        time: "",
      },
    },

    answers: {
      userid1: {
        roomId: {
          questid1: {
            opt: "",
            timeLeft: "",
          },
          questid2: {
            opt: "",
            timeLeft: "",
          },
        },
      },
    },
  });
