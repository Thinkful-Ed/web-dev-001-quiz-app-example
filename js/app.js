// State object
const state = {
  questions: [
    {
      text: "Which number am I thinking of?",
      choices: ["1", "2", "3", "4"],
      correctChoiceIndex: 0
    },
    {
      text: "What about now, can you guess now?",
      choices: ["1", "2", "3", "4"],
      correctChoiceIndex: 1
    },
    {
      text: "I'm thinking of a number between 1 and 4. What is it?",
      choices: ["1", "2", "3", "4"],
      correctChoiceIndex: 2,
    },
    {
      text: "If I were a number between 1 and 4, which would I be?",
      choices: ["1", "2", "3", "4"],
      correctChoiceIndex: 3,
    },
    {
      text: "Guess what my favorite number is",
      choices: ["1", "2", "3", "4"],
      correctChoiceIndex: 0,
    }
  ],
  praises : [
    "Wow. You got it right. I bet you feel really good about yourself now",
    "Correct. Which would be impressive, if it wasn't just luck",
    "Oh was I yawning? Because you getting that answer right was boring me to sleep",
    "Hear all that applause for you because you got this question right? Neither do I."
  ],

  admonishments: [
    "Really? That's your guess? WE EXPECTED BETTER OF YOU!",
    "Looks like someone wasn't paying attention in telepathy school, geesh!",
    "That's incorrect. You've dissapointed yourself, your family, your city, state, country and planet, to say nothing of the cosmos"
  ],
  score: 0,
  currentQuestionIndex: 0,
  route: 'start',
  lastAnswerCorrect: false,
  feedbackRandom: 0
};

// State modification functions
function setRoute(state, route) {
  state.route = route;
}

function resetGame(state) {
  state.score = 0;
  state.currentQuestionIndex = 0;
  setRoute(state, 'start');
}

function answerQuestion(state, answer) {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  state.lastAnswerCorrect = currentQuestion.correctChoiceIndex === answer;
  if (state.lastAnswerCorrect) {
    state.score++;
  }
  selectFeedback(state);
  setRoute(state, 'answer-feedback');
}

function selectFeedback(state) {
  state.feedbackRandom = Math.random();
}

function advance(state) {
  state.currentQuestionIndex++;
  if (state.currentQuestionIndex === state.questions.length) {
    setRoute(state, 'final-feedback');
  }
  else {
    setRoute(state, 'question');
  }
}

// Render functions
function renderApp(state, elements) {
  // default to hiding all routes, then show the current route
  Object.keys(elements).forEach(function(route) {
    elements[route].attr('hidden', 'hidden');
  });
  

  if (state.route === 'start') {
    renderStartPage(state, elements[state.route]);
  }
  else if (state.route === 'question') {
    renderQuestionPage(state, elements[state.route]);
  }
  else if (state.route === 'answer-feedback') {
    renderAnswerFeedbackPage(state, elements[state.route]);
  }
  else if (state.route === 'final-feedback') {
    renderFinalFeedbackPage(state, elements[state.route]);
  }
  
  //show current route after it has been invisibly rendered
  elements[state.route].removeAttr('hidden');
}

// at the moment, `renderStartPage` doesn't do anything, because
// the start page is preloaded in our HTML, but we've included
// the function and used above in our routing system so that this
// application view is accounted for in our system
function renderStartPage(state, element) {
}

function renderQuestionPage(state, element) {
  renderQuestionCount(state, element.find('.question-count'));
  renderQuestionText(state, element.find('.question-text'));
  renderChoices(state, element.find('.choices'));
}

function renderAnswerFeedbackPage(state, element) {
  renderAnswerFeedbackHeader(state, element.find(".feedback-header"));
  renderAnswerFeedbackText(state, element.find(".feedback-text"));
  renderNextButtonText(state, element.find(".see-next"));
}

function renderFinalFeedbackPage(state, element) {
  renderFinalFeedbackText(state, element.find('.results-text'));
}

function renderQuestionCount(state, element) {
  const text = `${(state.currentQuestionIndex + 1)}/${state.questions.length}`;
  element.text(text);
}

function renderQuestionText(state, element) {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  element.text(currentQuestion.text);
}

function renderChoices(state, element) {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const choices = currentQuestion.choices.map((choice, index) => {
    return (
        `<label for="choice-${index}">
          <input type="radio" 
            name="user-answer" 
            value="${index}" 
            id="choice-${index}" required> ${choice}
        </label>`
    );
  });
  element.html(choices);
}

function renderAnswerFeedbackHeader(state, element) {
  const feedback = state.lastAnswerCorrect ?
      "<h2 class='user-was-correct'>correct</h2>" :
      "<h2 class='user-was-incorrect'>Wrooonnnngggg!</h2>";
  element.replaceWith(feedback);
}

function renderAnswerFeedbackText(state, element) {
  const choices = state.lastAnswerCorrect ? state.praises : state.admonishments;
  const text = choices[Math.floor(state.feedbackRandom * choices.length)];
  element.text(text);
}

function renderNextButtonText(state, element) {
    const text = state.currentQuestionIndex < state.questions.length - 1 ?
      "Next" : "How did I do?";
  element.text(text);
}

function renderFinalFeedbackText(state, element) {
  const text = `You got ${state.score} out of ${state.questions.length} questions right.`;
  element.text(text);
}

$(function() { 
  // Forms, other interactive elements
  const START_FORM = $("form[name='game-start']");
  const QUESTION_FORM = $("form[name='current-question']");
  const NEXT_BTN = $("button.see-next");
  const RESTART_BTN = $("button.restart-game");

  // Object to map template elements to app routes
  const PAGE_ELEMENTS = {
    'start': $('div[data-page=start]'),
    'question': $('div[data-page=question]'),
    'answer-feedback': $('div[data-page=answer-feedback]'),
    'final-feedback': $('div[data-page=final-feedback]')
  };

  // Attach our event listeners
  START_FORM.on('submit', function(event) {
    event.preventDefault();
    setRoute(state, 'question');
    renderApp(state, PAGE_ELEMENTS);
  });
  
  QUESTION_FORM.on('submit', function(event) {
    event.preventDefault();
    let answer = $("input[name='user-answer']:checked").val();
    answer = parseInt(answer, 10);
    answerQuestion(state, answer);
    renderApp(state, PAGE_ELEMENTS);
  });

  NEXT_BTN.on('click', function(event) {
    advance(state);
    renderApp(state, PAGE_ELEMENTS);
  });
  
  RESTART_BTN.on('click', function(event){
    event.preventDefault();
    resetGame(state);
    renderApp(state, PAGE_ELEMENTS);
  });

  // Finally, render the app.
  renderApp(state, PAGE_ELEMENTS); 
});
