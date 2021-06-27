import {
  createQuestion,
  deleteQuestion,
  editQuestion,
  getQuestionsData,
} from "../firebaseApi/hostApi.js";

let roomId = null;
let questions = [];
let selected = 0;

const questionsList = document.getElementById("questions");
const loading = document.getElementById("loading");

const addQuestionButton = document.getElementById("add-question");

const questionTextArea = document.getElementById("question-area");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");
const saveButton = document.getElementById("save-button");

const dropdown = document.getElementById("time-limit-dropdown");
const limitShower = document.getElementById("limit-shower");

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    let uid = user.uid;

    let urlParams = new URLSearchParams(location.search.slice(1));
    let roomIdInUrl = urlParams.get("id");
    
    if (!roomIdInUrl) {
      console.log('wrong url')
      // location.href = "host.html";
    } else {
      roomId = roomIdInUrl;
      questions = await getQuestionsData(roomId);
      questionsList.removeChild(loading);
    
      if (questions.length === 0) {
        // Add first question
        questions[0] = {
          question: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          id: null,
          timeLimit: 10,
          correctAnswer: 1,
        };
        questionsList.appendChild(getQuestionHtml(1, onDeleteClick));
        questionsList.children[
          questionsList.childElementCount - 1
        ].firstElementChild.classList.remove("border-white");

        questionsList.children[
          questionsList.childElementCount - 1
        ].firstElementChild.classList.add("border-success");
        questionTextArea.value = "";
        option1.value = "";
        option2.value = "";
        option3.value = "";
        option4.value = "";
      } else {
        questions.forEach((_, ind) => {
          questionsList.appendChild(getQuestionHtml(ind + 1, onDeleteClick));
        });

        questionsList.children[0].firstElementChild.classList.remove(
          "border-white"
        );

        questionsList.children[0].firstElementChild.classList.add(
          "border-success"
        );
        markCorrect(questions[0].correctAnswer);
        limitShower.textContent = questions[0].timeLimit + " Sec";
        questionTextArea.value = questions[0].question ?? "";
        option1.value = questions[0].option1 ?? "";
        option2.value = questions[0].option2 ?? "";
        option3.value = questions[0].option3 ?? "";
        option4.value = questions[0].option4 ?? "";
      }
    }
  } else {
    // location.href = "login.html";
  }
});

const setSelected = (num) => {
  removeAllSuccessClasses();
  questionsList.children[num - 1].firstElementChild.classList.remove(
    "border-white"
  );
  questionsList.children[num - 1].firstElementChild.classList.add(
    "border-success"
  );
  markCorrect(questions[num - 1].correctAnswer);
  selected = num - 1;
  questionTextArea.value = questions[num - 1].question ?? "";
  limitShower.textContent = questions[selected].timeLimit + " Sec";
  option1.value = questions[num - 1].option1 ?? "";
  option2.value = questions[num - 1].option2 ?? "";
  option3.value = questions[num - 1].option3 ?? "";
  option4.value = questions[num - 1].option4 ?? "";
};

const getQuestionHtml = (questionNum, onDeleteClick) => {
  const button = document.createElement("button");
  button.textContent = "Delete";
  button.setAttribute("class", "btn btn-dark mb-1 pl-4 pr-4");
  button.onclick = (event) => {
    event.stopPropagation();
    let q = questionNum;
    onDeleteClick(q);
  };
  const li = document.createElement("li");
  const div = document.createElement("div");

  div.setAttribute("class", "container border border-white mt-4");
  div.setAttribute("style", "border-width: medium !important;");
  div.onclick = (event) => {
    event.stopPropagation();
    setSelected(questionNum);
  };

  const h5 = document.createElement("h5");

  h5.setAttribute("class", "text-white pt-1");
  h5.innerText = `Question ${questionNum}`;
  div.appendChild(h5);
  div.appendChild(button);
  li.appendChild(div);
  return li;
};

const onDeleteClick = (quesNum) => {
  let div = questionsList.children[quesNum - 1].firstElementChild;
  if (questions[quesNum - 1].id) {
    deleteQuestion(questions[quesNum - 1].id, roomId);
  }
  questions.splice(quesNum - 1, 1);

  if (div.classList.contains("border-success")) {
    if (questionsList.childElementCount > 1) {
      if (quesNum !== 1) {
        questionsList.children[quesNum - 2].firstElementChild.classList.remove(
          "border-white"
        );
        questionsList.children[quesNum - 2].firstElementChild.classList.add(
          "border-success"
        );
        selected = quesNum - 2;
      } else {
        questionsList.children[1].firstElementChild.classList.remove(
          "border-white"
        );
        questionsList.children[1].firstElementChild.classList.add(
          "border-success"
        );
        selected = 0;
      }
    }
  }

  if (questions[selected]) {
    questionTextArea.value = questions[selected].question ?? "";
    option1.value = questions[selected].option1 ?? "";
    option2.value = questions[selected].option2 ?? "";
    option3.value = questions[selected].option3 ?? "";
    option4.value = questions[selected].option4 ?? "";
    limitShower.textContent = questions[selected].timeLimit + " Sec";
  }

  questionsList.removeChild(questionsList.children[quesNum - 1]);
  let deleteQues = quesNum;
  for (let li of Array.from(questionsList.children).slice(quesNum - 1)) {
    let liH5 = li.firstElementChild.firstElementChild;
    let liButton = li.firstElementChild.lastElementChild;
    liH5.textContent = "Question " + deleteQues.toString();
    let div = li.firstElementChild;
    div.onclick = (event) => {
      event.stopPropagation();
      setSelected(Number(liH5.textContent[liH5.textContent.length - 1]));
    };
    liButton.onclick = (event) => {
      event.stopPropagation();
      onDeleteClick(Number(liH5.textContent[liH5.textContent.length - 1]));
    };
    deleteQues++;
  }
};

const addQuesion = (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  questionTextArea.value = "";
  option1.value = "";
  option2.value = "";
  option3.value = "";
  option4.value = "";

  removeAllSuccessClasses();
  questionsList.appendChild(
    getQuestionHtml(questionsList.childElementCount + 1, onDeleteClick)
  );

  questions[questionsList.childElementCount - 1] = {
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    id: null,
    timeLimit: 10,
    correctAnswer: 1,
  };
  selected++;
  limitShower.textContent = "10 Sec";
  questionsList.children[
    questionsList.childElementCount - 1
  ].firstElementChild.classList.remove("border-white");

  questionsList.children[
    questionsList.childElementCount - 1
  ].firstElementChild.classList.add("border-success");
};

addQuestionButton.addEventListener("click", addQuesion);

const removeAllSuccessClasses = () => {
  if (questionsList.childElementCount) {
    for (let child of questionsList.children) {
      child.firstElementChild.classList.remove("border-success");
      child.firstElementChild.classList.add("border-white");
    }
  }
};

saveButton.addEventListener("click", (event) => {
  event.stopPropagation();
  questions[selected].question = questionTextArea.value;
  questions[selected].option1 = option1.value;
  questions[selected].option2 = option2.value;
  questions[selected].option3 = option3.value;
  questions[selected].option4 = option4.value;
  let data = Object.assign({}, questions[selected]);
  delete data.id;
  console.log(questions[selected])
  console.log(questions[selected].id, questions[selected]["id"]);
  if (questions[selected].id) {
    editQuestion(data, questions[selected].id);
  } else {
    const newId = createQuestion(data, roomId);
    console.log({ newId });
    questions[selected].id = newId;
  }
});

const markCorrect = (opt) => {
  const classes = ["text-white", "bg-success"];

  switch (opt) {
    case 1:
      option1.previousElementSibling.firstElementChild.classList.add(
        ...classes
      );
      option2.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option3.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option4.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );

      questions[selected].correctAnswer = 1;
      break;

    case 2:
      option2.previousElementSibling.firstElementChild.classList.add(
        ...classes
      );
      option1.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option3.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option4.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      questions[selected].correctAnswer = 2;
      break;

    case 3:
      option3.previousElementSibling.firstElementChild.classList.add(
        ...classes
      );
      option1.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option2.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option4.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      questions[selected].correctAnswer = 3;
      break;

    case 4:
      option4.previousElementSibling.firstElementChild.classList.add(
        ...classes
      );
      option1.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option3.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      option2.previousElementSibling.firstElementChild.classList.remove(
        ...classes
      );
      questions[selected].correctAnswer = 4;
      break;

    default:
      break;
  }
};

option1.onfocus = () => {
  markCorrect(1);
};

option2.onfocus = () => {
  markCorrect(2);
};

option3.onfocus = () => {
  markCorrect(3);
};

option4.onfocus = () => {
  markCorrect(4);
};

const timeLimits = [10, 20, 30, 45, 60];
Array.from(dropdown.children).forEach((item, ind) => {
  item.onclick = () => {
    questions[selected].timeLimit = timeLimits[ind];
    limitShower.textContent = timeLimits[ind] + " Sec";
  };
});
