export const getRooms = async (uid) => {
  const snap = await firebase
    .database()
    .ref(`users/${uid}/rooms`)
    .once("value");

  const val = snap.val();

  if (val) {
    return Object.keys(val);
  } else {
    return [];
  }
};

export const getRoomName = async (roomId) => {
  const snap = await firebase
    .database()
    .ref(`rooms/${roomId}/name`)
    .once("value");

  if (!snap.val()) return "empty";
  else return snap.val();
};

export const getQuestionData = async (questionId) => {
  const snap = await firebase
    .database()
    .ref(`questions/${questionId}`)
    .once("value");

  const val = snap.val();

  if (val) {
    val.id = questionId;
    return val;
  } else {
    return null;
  }
};

export const getQuestionsData = async (roomId) => {

  const snap = await firebase
    .database()
    .ref(`rooms/${roomId}/questionIds`)
    .once("value");

  const val = snap.val();

  if (val) {
    const questionIds = Object.keys(val);
    const questionData = Promise.all(
      questionIds.map(async (id) => await getQuestionData(id))
    );

    return questionData;
  } else {
    return [];
  }
};

export const createQuestion = (data, roomId) => {
  const newQuestionRef = firebase
    .database()
    .ref(`rooms/${roomId}/questionIds`)
    .push();

  newQuestionRef.set(true);
  data.roomId = roomId;
  firebase.database().ref(`questions/${newQuestionRef.key}`).set(data);
  return newQuestionRef.key;
};

export const editQuestion = (data, questionId) => {
  firebase.database().ref(`questions/${questionId}`).set(data);
};

export const deleteQuestion = (questionId, roomId) => {
  firebase
    .database()
    .ref(`rooms/${roomId}/questionIds/${questionId}`)
    .remove();

  firebase.database().ref(`questions/${questionId}`).remove();
};

export const createNewRoom = (name) => {
  let roomRef = firebase.database().ref("rooms");
  let newKey = roomRef.push({
    name,
    questionIds: { null: null }
  }).key;

  // add room in user rooms
  let uid = firebase.auth().currentUser.uid;
  let userRef = firebase.database().ref(`users/${uid}/rooms`);
  userRef.update({ [newKey]: true });

  location.href = 'createquiz.html?id=' + newKey;
};

export const deleteRoom = (roomID) => {
  firebase.database().ref(`rooms/${roomID}`).remove();
  let uid = firebase.auth().currentUser.uid;
  firebase.database().ref(`users/${uid}/rooms/` + roomID).remove();
  location.reload();
}

