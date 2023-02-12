import "./style.css";

type Question = {
  id: string;
  label: string;
};

type Answer = {
  id: string;
  label: string;
};

type AnswerGroup = {
  question: { id: string };
  answer: { id: string };
};

interface IQuestionAndAnswers {
  question: Question;
  answers: Answer[];
}

type CurrentQuestion = "Unassigned" | { id: string; index: number };

type Quiz = {
  questions: IQuestionAndAnswers[];
  currentQuestion: IQuestionAndAnswers;
};

type QuizUi = Quiz & {
  onSubmitEventHandler: (evt: MouseEvent) => void;
};

type QuizResult = {
  failures: number;
  successes: number;
};

type QuizResultUi = QuizResult & {
  playAgainEvtHandler: () => void;
};

type QuizResultResponse = {
  message: string;
  status: string;
};

type QuizResultFound = {
  found: true;
  value: QuizResultResponse;
};

type QuizResultNotFound = {
  found: false;
};

type MaybeQuizResult = QuizResultFound | QuizResultNotFound;

// -----------------------------
// QUIZ
// -----------------------------

function QuizEnd({
  successes,
  failures,
  playAgainEvtHandler,
}: QuizResultUi): HTMLDivElement {
  const DivEndQuizContainer = document.createElement("div");
  DivEndQuizContainer.className = "quiz-end quiz-slide";

  const EndMsg = document.createElement("h2");
  EndMsg.textContent = "Congratulations";
  DivEndQuizContainer.appendChild(EndMsg);

  const Result = document.createElement("p");
  Result.className = "correct";
  Result.textContent = `correct answers: ${successes}`;

  const ResultKo = document.createElement("p");
  ResultKo.className = "wrong";
  ResultKo.textContent = `wrongs: ${failures}`;

  const PlayAgain = document.createElement("button");
  PlayAgain.textContent = "play again";
  PlayAgain.className = "quiz-play-again";
  PlayAgain.addEventListener("click", playAgainEvtHandler);

  DivEndQuizContainer.appendChild(Result);
  DivEndQuizContainer.appendChild(ResultKo);
  DivEndQuizContainer.appendChild(PlayAgain);

  return DivEndQuizContainer;
}

function Spinner(): HTMLDivElement {
  const DivSpinner = document.createElement("div");
  DivSpinner.className = "spinner lds-roller quiz-slide";
  return DivSpinner;
}

function Radio({ question, answer }: AnswerGroup): HTMLInputElement {
  const Input = document.createElement("input");
  Input.setAttribute("type", "radio");
  Input.name = question.id;
  Input.value = answer.id;
  Input.id = answer.id;

  return Input;
}

//
function QuestionAndAnswers({
  question,
  answers,
}: IQuestionAndAnswers): HTMLDivElement {
  //
  const Question = document.createElement("h2");
  Question.className = "quiz-question";
  Question.textContent = question.label;

  // answers
  const Answers = document.createElement("ul");
  Answers.className = "quiz-answers";

  answers.forEach(({ id, label }) => {
    const Answer = document.createElement("li");

    const AnswerLabel = document.createElement("label");
    AnswerLabel.setAttribute("for", id);
    AnswerLabel.textContent = label;

    const radio = Radio({ question: { id: question.id }, answer: { id } });

    Answer.appendChild(radio);
    Answer.appendChild(AnswerLabel);

    Answers.appendChild(Answer);
  });

  const QuestionAndAnswers = document.createElement("div");
  QuestionAndAnswers.className = "quiz-questions-answers quiz-slide";

  QuestionAndAnswers.appendChild(Question);
  QuestionAndAnswers.appendChild(Answers);

  return QuestionAndAnswers;
}

function Quiz(quiz: QuizUi): HTMLDivElement {
  const Container = document.createElement("div");
  Container.className = "quiz-container";

  const Frame = document.createElement("div");
  Frame.className = "quiz-frame";

  const Slider = document.createElement("div");
  Slider.className = "quiz-container_slider transition-transform";

  const Submit = document.createElement("input");
  Submit.setAttribute("type", "submit");
  Submit.className = "quiz-submit-answer";
  Submit.value = "next";
  Submit.addEventListener("click", quiz.onSubmitEventHandler);

  Frame.appendChild(Slider);

  quiz.questions.forEach((item) => {
    Slider.appendChild(QuestionAndAnswers(item));
  });

  Container.appendChild(Frame);
  Container.appendChild(Submit);

  return Container;
}

((win) => {
  const doc = win.document;
  const QUIZ_RESULT_API_URL = "/fake-result.json";

  const getDefaultQuestionAndAnswer = (): IQuestionAndAnswers => ({
    question: { id: "", label: "" },
    answers: [],
  });

  const quiz: Quiz = {
    questions: [
      {
        question: { id: "q-1", label: "lorem ipsum dolore" },
        answers: [
          {
            label: "first",
            id: "q-1_1",
          },
          {
            label: "second",
            id: "q-1_2",
          },
          {
            label: "third",
            id: "q-1_3",
          },
          {
            label: "fourth",
            id: "q-1_5",
          },
        ],
      },
      {
        question: { id: "q-2", label: "This is question n2" },
        answers: [
          {
            label: "q2 first",
            id: "q-2-1",
          },
          {
            label: "q2 second",
            id: "q-2-2",
          },
        ],
      },
      {
        question: { id: "q-3", label: "This is question n3" },
        answers: [
          {
            label: "q3 first",
            id: "q-3-1",
          },
          {
            label: "q3 second",
            id: "q-3-2",
          },
        ],
      },
    ],
    currentQuestion: {
      ...getDefaultQuestionAndAnswer(),
    },
  };

  /*  
   *
   *
    {
        "q-1" : {
            label: "xxxx".
            selected: "",
            answers: [{...}]

        },


        questions: [...]

    }

  */

  const doPost = async (URL: string, body: string) => {
    try {
      const request = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application-json" },
        body,
      });
      const result = await request.json();
      return result;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      console.error("error -> ", error.message || "");
    }
  };

  const getQuizResult = ({
    status,
    message,
  }: QuizResultResponse): MaybeQuizResult =>
    status !== undefined && message !== undefined
      ? {
          found: true,
          value: {
            status,
            message,
          },
        }
      : { found: false };

  const validateResultResponse = (response: unknown): QuizResult => {
    const checkedResult: MaybeQuizResult = getQuizResult(
      response as QuizResultResponse
    );

    if (checkedResult.found) {
      const [successes, failures] = checkedResult.value.message.includes("/")
        ? checkedResult.value.message.split("/")
        : ["None", "None"];

      const successesIsNumber = !isNaN(Number(successes));
      const failuresIsNumber = !isNaN(Number(failures));

      if (successesIsNumber && failuresIsNumber) {
        return {
          successes: Number(successes),
          failures: Number(failures),
        };
      }

      if (!successesIsNumber) {
        console.warn(`successes error -> expected number, got ${successes}`);
      }

      if (!failuresIsNumber) {
        console.warn(`failures error -> expected number , got ${failures}`);
      }
    }

    console.error(
      `error -> expected QuizResultResponse got ${JSON.stringify(
        response,
        null,
        2
      )}`
    );

    return {
      successes: 0,
      failures: 0,
    };
  };

  // quiz
  // ===========

  let selected: string[] = [];
  let currentQuestion: CurrentQuestion = "Unassigned";
  let sliderWidth = 0;

  const App = doc.querySelector("#app");

  if (!App) return;

  const setSelected = (checkedValue: string) => {
    if (currentQuestion !== "Unassigned") {
      selected = [...selected, checkedValue];
    }
  };

  const setCurrentQuestion = () => {
    const { questions } = quiz;

    if (currentQuestion === "Unassigned") {
      const quizAtZero = questions.at(0);
      if (quizAtZero) {
        currentQuestion = { index: 0, id: quizAtZero.question.id };
      }
    } else {
      const currentIndex = currentQuestion.index + 1;
      const quizAtIndex = questions.at(currentIndex);

      if (quizAtIndex) {
        currentQuestion = { index: currentIndex, id: quizAtIndex.question.id };
      } else {
        console.warn("no more questions");
      }
    }
  };

  const removeQuizQuestionsAndAnswers = (Slider: HTMLDivElement) => {
    if (Slider) {
      const qaList = doc.querySelectorAll(".quiz-questions-answers");
      qaList.forEach((item) => {
        Slider.removeChild(item);
      });
    }
  };

  const moveSliderToNextQuestion = (x: number) => {
    const Slider: HTMLDivElement | null = doc.querySelector(
      ".quiz-container_slider"
    );

    if (Slider) {
      Slider.setAttribute("style", `transform:translateX(${x}px);`);
    }
  };

  const moveSlider = (x = 0) => {
    if (currentQuestion === "Unassigned") {
      moveSliderToNextQuestion(x);
    } else {
      moveSliderToNextQuestion(currentQuestion.index * sliderWidth * -1);
    }
  };

  const setSliderWidth = () => {
    const Slider: HTMLDivElement | null = doc.querySelector(
      ".quiz-container_slider"
    );

    if (Slider) {
      const newWidth = Math.floor(Slider.getBoundingClientRect().width);
      if (sliderWidth !== newWidth) {
        sliderWidth = newWidth;
        moveSlider();
      }
    }
  };

  const isQuizCompleted = (): boolean => {
    if (currentQuestion === "Unassigned") {
      return false;
    }

    const { questions } = quiz;
    return currentQuestion.index === questions.length - 1;
  };

  const displayResult = () => {
    const Slider: HTMLDivElement | null = document.querySelector(
      ".quiz-container_slider"
    );

    if (Slider) {
      const body = JSON.stringify(selected.filter((x) => x));
      const QuizContainer = doc.querySelector(".quiz-container");
      const SubmitAnswerButton: HTMLInputElement | null = doc.querySelector(
        ".quiz-submit-answer"
      );

      if (QuizContainer && SubmitAnswerButton) {
        SubmitAnswerButton.ontransitionend = () => {
          QuizContainer.removeChild(SubmitAnswerButton);
        };

        SubmitAnswerButton.setAttribute(
          "style",
          "transform: translateY(50px); transition: all 1s ease"
        );
      }

      const Loading = Spinner();
      Slider.appendChild(Loading);

      moveSlider(quiz.questions.length * sliderWidth * -1);

      doPost(QUIZ_RESULT_API_URL, body).then((result: unknown) => {
        setTimeout(() => {
          // we add some time
          // to show the spinner, since we are
          // fetching from localhost
          // setTimeout is not needed
          Slider.removeChild(Loading);
          removeQuizQuestionsAndAnswers(Slider);
          Slider.appendChild(
            QuizEnd({
              ...validateResultResponse(result),
              playAgainEvtHandler: startQuiz,
            })
          );
          moveSlider();
        }, 1000);
      });
    } else {
      console.warn(".quiz-container_slider, is null");
    }
  };

  const updateQuizAndContinue = (value: string) => {
    setSelected(value);

    if (isQuizCompleted()) {
      currentQuestion = "Unassigned";
      displayResult();
    } else {
      setCurrentQuestion();
      moveSlider();
    }
  };

  const onSubmitEventHandler = () => {
    if (currentQuestion !== "Unassigned") {
      const checked: HTMLInputElement | null = doc.querySelector(
        `input[name=${currentQuestion.id}]:checked`
      );

      updateQuizAndContinue(checked?.value || "");
    }
  };

  const removeConatainer = () => {
    //
    const Container: HTMLDivElement | null =
      doc.querySelector(".quiz-container");

    if (Container) {
      App.removeChild(Container);
    }
  };

  const resizeEvtHandler = () => {
    let timeout = 0;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSliderWidth();
      }, 100);
    };
  };

  const startQuiz = () => {
    //
    removeConatainer();

    win.removeEventListener("resize", resizeEvtHandler);
    const quizUi: QuizUi = {
      ...quiz,
      onSubmitEventHandler,
    };

    setCurrentQuestion();
    App.appendChild(Quiz(quizUi));

    setSliderWidth();

    win.addEventListener("resize", resizeEvtHandler());
  };

  startQuiz();
})(window);
