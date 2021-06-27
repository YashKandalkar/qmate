let endTime = Infinity;
let urlParams = new URLSearchParams(location.search.slice(1));
let activeQuestionId = null;
let roomId = urlParams.get("id");
if (!roomId) {
  // TODO: Redirect to index?
}
setListeners();

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    let uid = user.uid;
    firebase
      .database()
      .ref(`/rooms/${roomId}/scores/${uid}`)
      .on("value", (snap) => {
        console.log("score", snap.val());
        document.getElementById("player-score").innerText = snap.val();
      });
    firebase
      .database()
      .ref(`rooms/${roomId}/activeQuestion`)
      .on("value", async (snap) => {
        if (!snap.val()) return;

        let { questionId, startTime } = snap.val();
        activeQuestionId = questionId;
        let question = await getQuestionData(questionId);
        if (question != null || question == "wait") {
          setTimer(startTime, question.timeLimit);
          displayData(question);

          // next question
          document
            .getElementById("play-save-btn")
            .classList.remove("disabled");
          // setListeners();
          let options = document.getElementsByClassName("play-option-div");
          let n = options.length;
          for (let i = 0; i < n; i++) {
            options[i].classList.remove("selected-option");
          }
        }
      });
  } else {
    console.log("No user!");
  }
});

const getQuestionData = async (questionId) => {
  let snap = await firebase
    .database()
    .ref(`/questions/${questionId}`)
    .once("value");
  if (!snap.val()) return null;
  else return snap.val();
};

const setTimer = (startTime, timeLimit) => {
  const checkTime = () => {
    let curTime = Date.now();
    if (curTime >= endTime) {
      submit();
      return true;
    } else {
      document.getElementById("time-left").innerText = Math.floor(
        (endTime - curTime) / 1000
      );
    }
  };
  endTime = startTime + timeLimit * 1000;
  let timer = setInterval(() => {
    if (checkTime()) clearInterval(timer);
  }, 500);
};

function setListeners() {
  let options = document.getElementsByClassName("play-option-div");
  console.log(options);
  let n = options.length;
  for (let i = 0; i < n; i++) {
    console.log(options[i]);
    options[i].addEventListener("click", (event) => {
      console.log(1);
      for (let j = 0; j < n; j++) {
        if (options[j].classList.contains("selected-option"))
          options[j].classList.remove("selected-option");
      }
      event.target.classList.add("selected-option");
    });
  }
  if (document.getElementById("play-save-btn").classList.contains("disabled"))
    document.getElementById("play-save-btn").classList.remove("disabled");
  document.getElementById("play-save-btn").addEventListener("click", submit);
}

async function submit() {
  let selectedOption = document.querySelector(".selected-option");
  document.getElementById("play-save-btn").classList.add("disabled");
  if (selectedOption == null) selectedOption = -1;
  else selectedOption = selectedOption.attributes.optionNo.value;
  let uid = firebase.auth().currentUser.uid;
  let snap = await firebase
    .database()
    .ref(`rooms/${roomId}/responses/` + uid)
    .once("value");
  console.log({ selectedOption });
  if (snap.val() == null && selectedOption !== -1) {
    console.log({ selectedOption });
    firebase
      .database()
      .ref(`rooms/${roomId}/responses/${uid}`)
      .set({
        option: selectedOption,
        questionId: activeQuestionId,
      })
      .then(() => {
        console.log("added");
        document.getElementById("play-save-btn").classList.add("disabled");
      })
      .catch((err) => console.log(err));
  } else {
    // next question
    console.log({ selectedOption });
    firebase
      .database()
      .ref(`rooms/${roomId}/responses/${uid}`)
      .set({
        option: selectedOption,
      })
      .then(() => {
        console.log("added");
        document.getElementById("play-save-btn").classList.add("disabled");
      })
      .catch((err) => console.log(err));
  }
}

const displayData = (data) => {
  document.getElementById("question-div").innerText = data.question;
  document.getElementById("play-option-1").innerText = data.option1;
  document.getElementById("play-option-2").innerText = data.option2;
  document.getElementById("play-option-3").innerText = data.option3;
  document.getElementById("play-option-4").innerText = data.option4;
};
