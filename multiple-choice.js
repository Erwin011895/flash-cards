document.addEventListener('DOMContentLoaded', () => {
    const kanjiDisplay = document.getElementById('kanji-display');
    const kanaDisplay = document.getElementById('kana-display');
    const optionsContainer = document.getElementById('options-container');
    const feedbackDisplay = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const questionNumberDisplay = document.getElementById('question-number');
    const quizTitleDisplay = document.getElementById('quiz-title');
    const quizSetupForm = document.getElementById('quiz-setup-form');
    const numQuestionsInput = document.getElementById('num-questions');
    const showKanaCheckbox = document.getElementById('show-kana-checkbox');
    const startQuizButton = document.getElementById('start-quiz-button');
    const quizContainer = document.getElementById('quiz-container');

    let quizData = [];
    let shuffledQuizData = []; // To store shuffled questions
    let currentQuestion = null;
    let correctAnswer = null;
    let currentQuestionIndex = 0;
    let quizResults = []; // To store results of each question
    let showKana = true; // New variable to control Kana visibility

    // Helper function to show reload button on error
    function showReloadButton(message) {
        kanjiDisplay.textContent = '';
        kanaDisplay.textContent = '';
        optionsContainer.innerHTML = '';
        questionNumberDisplay.textContent = '';
        feedbackDisplay.textContent = message;
        nextButton.textContent = 'Reload Page';
        nextButton.onclick = () => {
            quizContainer.style.display = 'none';
            quizSetupForm.style.display = 'block';
            feedbackDisplay.textContent = ''; // Clear feedback
            nextButton.style.display = 'none'; // Hide the reload button
        };
        nextButton.style.display = 'block';
    }

    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Fisher-Yates (Knuth) Shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Load quiz data
    async function loadQuizData() {
        const quizName = getUrlParameter('quiz');
        if (!quizName) {
            showReloadButton('No quiz specified in URL. Example: multiple-choice.html?quiz=N5-Lesson-01a');
            return;
        }

        // Set the document title and quiz title
        document.title = `${quizName} Quiz`;
        quizTitleDisplay.textContent = `${quizName} Quiz`;

        try {
            const response = await fetch(`data/${quizName}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            quizData = await response.json();
            if (quizData.length < 5) {
                showReloadButton('Quiz data must contain at least 5 items to generate options.');
                return;
            }
            if (quizData.length === 0) {
                showReloadButton('Quiz data is empty.');
                return;
            }

            // Set default number of questions in the form
            numQuestionsInput.value = Math.min(quizData.length, 10); // Default to max 10 questions or available questions

            quizSetupForm.style.display = 'block';
            quizContainer.style.display = 'none';

            startQuizButton.onclick = () => {
                const selectedQuizLength = parseInt(numQuestionsInput.value, 10);
                const selectedShowKana = showKanaCheckbox.checked;
                initializeQuiz(selectedQuizLength, selectedShowKana);
            };
        } catch (error) {
            console.error('Error loading quiz data:', error);
            showReloadButton(`Failed to load quiz: ${quizName}.json. Make sure the file exists in the 'data' folder.`);
        }
    }

    function initializeQuiz(length, displayKana) {
        showKana = displayKana; // Update the global showKana variable
        quizData = quizData.slice(0, length); // Limit to selected number of questions
        shuffledQuizData = shuffleArray([...quizData]); // Always shuffle the full data first

        quizSetupForm.style.display = 'none';
        quizContainer.style.display = 'block';
        startQuiz();
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        quizResults = []; // Reset results for a new quiz
        nextButton.textContent = 'Next Question';
        nextButton.style.display = 'none'; // Hide next button initially
        feedbackDisplay.textContent = ''; // Clear feedback
        nextButton.onclick = generateQuestion; // Set the click handler for next question
        generateQuestion();
    }

    function generateQuestion() {
        if (currentQuestionIndex >= shuffledQuizData.length) {
            endQuiz();
            return;
        }

        // Clear previous state
        feedbackDisplay.textContent = '';
        nextButton.style.display = 'none';
        optionsContainer.querySelectorAll('.option-button').forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.disabled = false;
        });

        questionNumberDisplay.textContent = `Question ${currentQuestionIndex + 1} of ${shuffledQuizData.length}`;

        // Select the next question from the shuffled data
        currentQuestion = shuffledQuizData[currentQuestionIndex];

        // Always show both Kanji and Kana
        kanjiDisplay.textContent = currentQuestion.kanji;
        if (showKana) {
            kanaDisplay.textContent = currentQuestion.kana;
        } else {
            kanaDisplay.textContent = '';
        }
        correctAnswer = currentQuestion.english;

        // Generate options
        const options = new Set();
        options.add(correctAnswer); // Add the correct answer

        while (options.size < 4) {
            const randomEntry = quizData[Math.floor(Math.random() * quizData.length)];
            // Ensure incorrect options are different from the correct answer and not duplicates
            if (randomEntry.english !== correctAnswer) {
                options.add(randomEntry.english);
            }
        }

        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

        optionsContainer.querySelectorAll('.option-button').forEach((button, index) => {
            button.textContent = shuffledOptions[index];
            button.onclick = () => checkAnswer(button, shuffledOptions[index]);
        });
        optionsContainer.querySelectorAll('.option-button')[0].focus();
    }

    function checkAnswer(selectedButton, selectedAnswer) {
        optionsContainer.querySelectorAll('.option-button').forEach(button => {
            button.disabled = true; // Disable all buttons after an answer is selected
        });

        const isCorrect = (selectedAnswer === correctAnswer);
        quizResults.push({
            questionKanji: currentQuestion.kanji,
            questionKana: currentQuestion.kana,
            correctAnswer: correctAnswer,
            userAnswer: selectedAnswer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            feedbackDisplay.textContent = `Correct! (${currentQuestion.kana})`;
            selectedButton.classList.add('correct');
        } else {
            feedbackDisplay.textContent = `Incorrect. The correct answer was: ${correctAnswer} (${currentQuestion.kana})`;
            selectedButton.classList.add('incorrect');
            // Highlight the correct answer
            optionsContainer.querySelectorAll('.option-button').forEach(button => {
                if (button.textContent === correctAnswer) {
                    button.classList.add('correct');
                }
            });
        }
        nextButton.style.display = 'block'; // Show next button
        nextButton.focus(); // Autofocus the next button
        currentQuestionIndex++; // Move to the next question
    }

    function endQuiz() {
        kanjiDisplay.textContent = '';
        kanaDisplay.textContent = '';
        questionNumberDisplay.textContent = '';
        optionsContainer.innerHTML = '';
        nextButton.textContent = 'Restart Quiz';
        nextButton.style.display = 'block';
        nextButton.onclick = () => {
            location.reload(); // Refresh the page to reset the quiz
        };

        const incorrectAnswers = quizResults.filter(result => !result.isCorrect);
        if (incorrectAnswers.length > 0) {
            let tableHtml = `<h2>Quiz Finished! You got ${quizResults.length - incorrectAnswers.length} out of ${quizResults.length} correct.</h2><h3>Incorrect Answers:</h3>`;
            tableHtml += `<table class="incorrect-answers-table">`;
            tableHtml += `<thead><tr><th>Question</th><th>Correct Meaning</th><th>Your Answer</th></tr></thead>`;
            tableHtml += `<tbody>`;
            incorrectAnswers.forEach(result => {
                tableHtml += `<tr>`;
                tableHtml += `<td>${result.questionKanji} ${showKana ? '(' + result.questionKana + ')' : ''}</td>`;
                tableHtml += `<td><strong>${result.correctAnswer}</strong></td>`;
                tableHtml += `<td>${result.userAnswer}</td>`;
                tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table>`;
            feedbackDisplay.innerHTML = tableHtml;
        } else {
            feedbackDisplay.textContent = `Quiz Finished! You got all ${quizResults.length} questions correct!`;
        }
    }

    // Initial load
    loadQuizData();
});