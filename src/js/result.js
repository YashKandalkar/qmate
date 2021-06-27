// sort responses w.r.t timeStamp

let urlParams = new URLSearchParams(location.search.slice(1));
let roomId = urlParams.get("id");

if (!roomId) {
  // TODO: Redirect to index?
}

let questionList;
let cleanUpAfter = 30;

document.getElementById("room-code").innerText = roomId;

function showQuestions(questionList) {
  return new Promise(async (res, rej) => {
    let n = questionList.length;
    let questionUl = document.getElementById("question-list");
    for (let i = 0; i < n; i++) {
      let li = document.createElement("li");
      let question = await getQuestion(questionList[i]);
      // li.innerText = question.substr(0, Math.min(question.length - 1, 20));
      li.innerText = question;
      li.setAttribute("id", questionList[i]);
      li.classList.add("questions");
      questionUl.appendChild(li);
    }
    res();
  });
}

async function getQuestion(questionId) {
  let snap = await firebase
    .database()
    .ref(`/questions/${questionId}`)
    .once("value");
  console.log(snap.val().question);
  return snap.val().question;
}

function removeActiveQuestion() {
  return new Promise((res, rej) => {
    let questions = document.getElementsByClassName("questions");
    let n = questions.length;
    for (let i = 0; i < n; i++) {
      if (questions[i].classList.contains("active-question"))
        questions[i].classList.remove("active-question");
    }
    res();
  });
}

let snap = await firebase
  .database()
  .ref(`rooms/${roomId}/questionIds/`)
  .once("value");
if (!snap.val()) {
  console.log("no room in db / no question in db");
  // TODO: Redirect to host.html
} else {
  questionList = Object.keys(snap.val());
  document.getElementById("start-test-btn").addEventListener("click", () => {
    document
      .getElementById("start-test-btn")
      .style.setProperty("display", "none", "important");
    setActiveQuestion(questionList);
  });
  showQuestions(questionList).then(() => {
    firebase
      .database()
      .ref(`rooms/${roomId}/activeQuestion`)
      .on("value", (snap) => {
        if (!snap.val()) return;
        console.log("here");
        console.log(questionList[questionList.length - 1], snap.val());
        if (questionList[questionList.length - 1] === snap.val().questionId) {
          // last question
          console.log(`Cleaning up room in ${cleanUpAfter}s`);
          setTimeout(async () => await cleanUpRoom(), cleanUpAfter * 1000);
        }
        removeActiveQuestion().then(() => {
          let activeQuestion = document.getElementById(snap.val().questionId);
          if (activeQuestion == null) return;
          else activeQuestion.classList.add("active-question");
        });
      });
  });
  firebase
    .database()
    .ref(`rooms/${roomId}/responses`)
    .on("value", async (snap) => {
      let activeQuestion = await getActiveQuestion();
      if (activeQuestion == null) return;

      calculateScore(activeQuestion.questionId, snap.val());
    });
}

const cleanUpRoom = async () => {
  firebase.database().ref(`rooms/${roomId}/activeQuestion`).remove();
  // firebase.database().ref(`rooms/${roomId}/scores`).remove();
  firebase.database().ref(`rooms/${roomId}/responses`).remove();
  await removeActiveQuestion();
  document
    .getElementById("start-test-btn")
    .style.setProperty("display", "block", "important");
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
};

async function getActiveQuestion() {
  let snap = await firebase
    .database()
    .ref(`rooms/${roomId}/activeQuestion`)
    .once("value");
  return snap.val();
}

async function getQuestionTime(qid) {
  let snap = await firebase
    .database()
    .ref(`questions/${qid}/timeLimit`)
    .once("value");
  return snap.val();
}

async function setActiveQuestion(questionList) {
  function setActiveQuestionUtil(questionId) {
    firebase.database().ref(`rooms/${roomId}/activeQuestion`).set({
      questionId,
      startTime: Date.now(),
    });
  }
  let totalTime = 0;
  let n = questionList.length;
  for (let i = 0; i < n; i++) {
    let questionTime = await getQuestionTime(questionList[i]);
    totalTime = totalTime + questionTime * 1000 + 5000;
    setTimeout(() => {
      setActiveQuestionUtil(questionList[i]);
    }, totalTime);
  }
}

const getCorrectOption = async (questionId) => {
  let snap = await firebase
    .database()
    .ref(`/questions/${questionId}/correctAnswer`)
    .once("value");
  if (!snap.val()) return null;
  else return snap.val();
};

const getPrevScores = async () => {
  let snap = await firebase
    .database()
    .ref(`rooms/${roomId}/scores`)
    .once("value");
  if (snap.val()) return snap.val();
  else return {};
};

let calculateScore = async (currQuestion, responses) => {
  let correctOption = await getCorrectOption(currQuestion);
  let prevScores = await getPrevScores();

  let userKeys = Object.keys(responses);
  let n = userKeys.length;
  let newScores = {};

  for (let i = 0; i < n; i++) {
    let rightWrong = correctOption == responses[userKeys[i]].option ? 1 : 0;
    let newScore =
      rightWrong * (n - i) +
      (prevScores[userKeys[i]] == null || prevScores[userKeys[i]] == undefined
        ? 0
        : prevScores[userKeys[i]]);
    newScores[userKeys[i]] = newScore;
  }

  firebase.database().ref(`rooms/${roomId}/scores`).set(newScores);

  displayScores(userKeys, newScores, n);
};

async function getUserName(uid) {
  let snap = await firebase.database().ref(`users/${uid}`).once("value");
  return snap.val().name;
}

async function displayScores(userKeys, newScores, n) {
  let resultDiv = document.getElementById("result");

  for (let i = 0; i < n; i++) {
    let found = false;
    for (let child of resultDiv.children) {
      if (child.getAttribute("data-userId") === userKeys[i]) {
        child.lastElementChild.firstElementChild.textContent =
          newScores[userKeys[i]];
        found = true;
      }
    }
    if (found) continue;
    let row = document.createElement("div");
    row.setAttribute("data-userId", userKeys[i]);
    row.classList.add("row");
    let userName = await getUserName(userKeys[i]);

    row.innerHTML = `<div class="col-md-5 border border-dark mt-3 mr-4 ml-4 " style="height:6vh ">
                        <p>${userName}</p>
                      </div>
                      <div class="col-md-5 border border-dark mt-3 " style="height:6vh ">
                        <p>${newScores[userKeys[i]]}</p>
                      </div>`;
    resultDiv.appendChild(row);
  }
}
