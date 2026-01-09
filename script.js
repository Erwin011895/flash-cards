document.addEventListener('DOMContentLoaded', () => {
    const setupDiv = document.getElementById('setup');
    const quizDiv = document.getElementById('quiz');
    const resultsDiv = document.getElementById('results');

    const startQuizBtn = document.getElementById('start-quiz');
    const hiraganaCheckbox = document.getElementById('hiragana-checkbox');
    const katakanaCheckbox = document.getElementById('katakana-checkbox');
    const kanjiCheckbox = document.getElementById('kanji-checkbox');
    const quizLimitInput = document.getElementById('quiz-limit');

    const cardDiv = document.getElementById('card');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const feedbackDiv = document.getElementById('feedback');
    const correctCountSpan = document.getElementById('correct-count');
    const wrongCountSpan = document.getElementById('wrong-count');

    const finalCorrectSpan = document.getElementById('final-correct');
    const finalWrongSpan = document.getElementById('final-wrong');
    const wrongAnswersListUl = document.getElementById('wrong-answers-ul');
    const restartQuizBtn = document.getElementById('restart-quiz');

    // Elements for navigation (still needed for hamburger menu on quiz page)
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');

    let allCards = [];
    let currentCards = [];
    let currentCardIndex = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let quizLength = 0;
    let wrongAnswers = [];

    async function loadData() {
        const dataSources = {
            hiragana: 'data/hiragana.json',
            katakana: 'data/katakana.json',
            kanji: 'data/kanji.json'
        };

        allCards = [];

        const selectedSets = [];
        if (hiraganaCheckbox.checked) selectedSets.push('hiragana');
        if (katakanaCheckbox.checked) selectedSets.push('katakana');
        if (kanjiCheckbox.checked) selectedSets.push('kanji');

        if (selectedSets.length === 0) {
            alert('Please select at least one card set.');
            return false;
        }

        for (const set of selectedSets) {
            try {
                const response = await fetch(dataSources[set]);
                const data = await response.json();
                allCards = allCards.concat(data);
            } catch (error) {
                console.error(`Error loading ${set} data:`, error);
            }
        }
        return true;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startQuiz() {
        currentCards = [...allCards];
        shuffle(currentCards);

        quizLength = parseInt(quizLimitInput.value, 10);
        if (isNaN(quizLength) || quizLength <= 0 || quizLength % 10 !== 0) {
            alert('Please enter a valid quiz length (a positive multiple of 10).');
            return;
        }
        if (quizLength > currentCards.length) {
            alert(`You only have ${currentCards.length} cards available. Quiz length adjusted.`);
            quizLength = currentCards.length - (currentCards.length % 10);
            if (quizLength === 0 && currentCards.length > 0) quizLength = 10;
            if (currentCards.length === 0) {
                alert('No cards selected for the quiz. Please select at least one type.');
                return;
            }
            quizLimitInput.value = quizLength;
        }
        currentCards = currentCards.slice(0, quizLength);

        currentCardIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        wrongAnswers = [];
        updateScore();
        setupDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        quizDiv.classList.remove('hidden');
        answerInput.value = '';
        feedbackDiv.textContent = '';
        showNextCard();
    }

    function showNextCard() {
        if (currentCardIndex < currentCards.length) {
            const card = currentCards[currentCardIndex];
            if (card.hasOwnProperty('kana') && !card.hasOwnProperty('kanji')) { // Hiragana or Katakana
                cardDiv.textContent = card.kana;
            } else { // Kanji
                cardDiv.textContent = card.kanji;
            }
            answerInput.focus();
        } else {
            showResults();
        }
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const currentCard = currentCards[currentCardIndex];
        let correctAnswer;
        let displayCard;

        if (currentCard.hasOwnProperty('romaji')) { // Hiragana or Katakana
            correctAnswer = currentCard.romaji;
            displayCard = currentCard.kana;
        } else { // Kanji
            correctAnswer = currentCard.kana; // Kanji answer is kana
            displayCard = currentCard.kanji;
        }

        if (userAnswer === correctAnswer) {
            correctCount++;
            feedbackDiv.textContent = 'Correct!';
            feedbackDiv.style.color = 'green';
        } else {
            wrongCount++;
            feedbackDiv.textContent = `Wrong! The correct answer is ${correctAnswer}`;
            feedbackDiv.style.color = 'red';
            wrongAnswers.push({
                card: displayCard,
                correct: correctAnswer,
                userAnswer: userAnswer
            });
        }

        updateScore();
        currentCardIndex++;
        answerInput.value = '';

        setTimeout(() => {
            feedbackDiv.textContent = '';
            showNextCard();
        }, 1500);
    }

    function updateScore() {
        correctCountSpan.textContent = correctCount;
        wrongCountSpan.textContent = wrongCount;
    }

    function showResults() {
        quizDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        finalCorrectSpan.textContent = correctCount;
        finalWrongSpan.textContent = wrongCount;

        wrongAnswersListUl.innerHTML = '';
        if (wrongAnswers.length > 0) {
            wrongAnswers.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `Card: ${item.card}, Your Answer: "${item.userAnswer}", Correct Answer: "${item.correct}"`;
                wrongAnswersListUl.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'Great job! No incorrect answers.';
            wrongAnswersListUl.appendChild(listItem);
        }
    }

    // Event Listeners
    hamburgerMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    startQuizBtn.addEventListener('click', async () => {
        const loaded = await loadData();
        if (loaded) {
            setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');
            startQuiz();
            showNextCard();
        }
    });

    submitAnswerBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    restartQuizBtn.addEventListener('click', () => {
        resultsDiv.classList.add('hidden');
        setupDiv.classList.remove('hidden');
    });
});