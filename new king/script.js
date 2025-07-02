document.addEventListener('DOMContentLoaded', () => {
    console.log('--- Alpha BrainBox Game Started ---');

    // --- DOM Elements ---
    const playerSelectionScreen = document.getElementById('player-selection-screen');
    const playersOneRadio = document.getElementById('playersOne');
    const playersTwoRadio = document.getElementById('playersTwo');
    const nextToNameButton = document.getElementById('nextToNameButton');

    const nameScreen = document.getElementById('name-screen');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const player2InputGroup = document.getElementById('player2-input-group');
    const startButton = document.getElementById('startButton');

    const settingsScreen = document.getElementById('settings-screen');
    const modeLowerBeadsRadio = document.getElementById('modeLowerBeads');
    const modeFullUnitRodRadio = document.getElementById('modeFullUnitRod');
    const modePhysical = document.getElementById('modePhysical');
    const modeImagination = document.getElementById('modeImagination');
    const diffEasy = document.getElementById('diffEasy');
    const diffModerate = document.getElementById('diffModerate');
    const diffHard = document.getElementById('diffHard');
    const speedSlow = document.getElementById('speedSlow');
    const speedNormal = document.getElementById('speedNormal');
    const speedFast = document.getElementById('speedFast');
    const startGameButton = document.getElementById('startGameButton');

    const gamePlayScreen = document.getElementById('game-play-screen');
    const player1ScoreCard = document.getElementById('player1-score-card');
    const displayPlayer1Name = document.getElementById('displayPlayer1Name');
    const displayPlayer1Score = document.getElementById('displayPlayer1Score');

    const player2ScoreCard = document.getElementById('player2-score-card');
    const displayPlayer2Name = document.getElementById('displayPlayer2Name');
    const displayPlayer2Score = document.getElementById('displayPlayer2Score');

    const currentRoundElement = document.getElementById('currentRound');
    const currentOperationElement = document.getElementById('currentOperation');
    const studentAnswerInput = document.getElementById('studentAnswer');
    const submitAnswerButton = document.getElementById('submitAnswer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const nextRoundButton = document.getElementById('nextRoundButton'); // This button's listener will be removed
    const countdownDisplay = document.getElementById('countdownDisplay');
    const timerBarContainer = document.getElementById('timerBarContainer');
    const timerBar = document.getElementById('timerBar');

    const transitionScreen = document.getElementById('transition-screen');
    const transitionTitle = transitionScreen.querySelector('.transition-title');
    const transitionMessage = transitionScreen.querySelector('.transition-message');

    const awardScreen = document.getElementById('award-screen');
    const finalAwardPlayerName = document.getElementById('finalAwardPlayerName');
    const finalAwardScore = document.getElementById('finalAwardScore');
    const twoPlayerResultDisplay = document.querySelector('.two-player-result');
    const finalPlayer1Score = document.getElementById('finalPlayer1Score');
    const finalPlayer2Score = document.getElementById('finalPlayer2Score');
    const awardInstruction = document.querySelector('.award-instruction');
    const playAgainAwardButton = document.getElementById('playAgainAwardButton');

    // --- Game State Variables ---
    let isTwoPlayerMode = false;
    let player1Name = '';
    let player2Name = '';
    let player1Score = 0;
    let player2Score = 0;
    let currentPlayer = 1;

    let overallGameRound = 1; // Tracks the current overall round (1 to MAX_OVERALL_ROUNDS)
    const MAX_OVERALL_ROUNDS = 5; // Each player plays 5 sequences
    let operationsPerSequence = 20;
    let currentSequence = [];
    let currentSequenceIndex = 0;
    let correctAnswer = 0;
    let timer;
    let countdownValue = 5;
    let operationDisplayDelay = 800;
    let currentAbacusMode = 'lowerBeads';

    const AWARD_SCORE = 50;

    // --- Helper Functions ---

    function showScreen(screenToShow) {
        document.querySelectorAll('.game-section').forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        screenToShow.classList.remove('hidden');
        screenToShow.classList.add('active');
        console.log(`Showing screen: ${screenToShow.id}`);
        screenToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function generateLowerBeadsSequence(length) {
        let sequence = [];
        let currentValue = 0;
        console.log(`Generating Lower Beads (0-4) sequence of length: ${length}`);

        for (let i = 0; i < length; i++) {
            let possibleOperations = [];

            for (let add = 1; add <= 4; add++) {
                if (currentValue + add >= 0 && currentValue + add <= 4) {
                    possibleOperations.push({ type: '+', value: add, newValue: currentValue + add });
                }
            }

            for (let sub = 1; sub <= 4; sub++) {
                if (currentValue - sub >= 0 && currentValue - sub <= 4) {
                    possibleOperations.push({ type: '-', value: sub, newValue: currentValue - sub });
                }
            }

            if (possibleOperations.length === 0) {
                console.warn(`Lower Beads: No valid moves possible at currentValue: ${currentValue}. Sequence ended early at operation ${i}.`);
                break;
            }

            let chosenOperation;
            if (currentValue === 0 && i < length - 1) {
                chosenOperation = possibleOperations.find(op => op.type === '+') || possibleOperations[0];
            } else if (currentValue === 4 && i < length - 1) {
                chosenOperation = possibleOperations.find(op => op.type === '-') || possibleOperations[0];
            } else {
                chosenOperation = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];
            }
            
            sequence.push(chosenOperation);
            currentValue = chosenOperation.newValue;
        }
        return sequence;
    }

    function generateFullUnitRodSequence(length) {
        let sequence = [];
        let currentValue = 0;
        console.log(`Generating Full Unit Rod (0-9) sequence of length: ${length}`);

        for (let i = 0; i < length; i++) {
            let possibleOperations = [];
            let currentLowerBeadsValue = currentValue % 5;
            let hasFiveBead = currentValue >= 5;

            for (let num = 1; num <= 4; num++) {
                if (currentLowerBeadsValue + num <= 4) {
                    if (currentValue + num >= 0 && currentValue + num <= 9) {
                        possibleOperations.push({ type: '+', value: num, newValue: currentValue + num });
                    }
                }
                if (currentLowerBeadsValue - num >= 0) {
                    if (currentValue - num >= 0 && currentValue - num <= 9) {
                        possibleOperations.push({ type: '-', value: num, newValue: currentValue - num });
                    }
                }
            }

            if (!hasFiveBead && currentValue + 5 <= 9) {
                possibleOperations.push({ type: '+', value: 5, newValue: currentValue + 5 });
            }
            if (hasFiveBead && currentValue - 5 >= 0) {
                possibleOperations.push({ type: '-', value: 5, newValue: currentValue - 5 });
            }

            if (possibleOperations.length === 0) {
                console.warn(`Full Unit Rod: No valid moves possible at currentValue: ${currentValue}. Sequence ended early at operation ${i}.`);
                break;
            }

            let chosenOperation;
            if (currentValue === 0 && i < length - 1) {
                chosenOperation = possibleOperations.find(op => op.type === '+' && op.value > 0) || possibleOperations[0];
            } else if (currentValue === 9 && i < length - 1) {
                chosenOperation = possibleOperations.find(op => op.type === '-' && op.value > 0) || possibleOperations[0];
            } else {
                chosenOperation = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];
            }
            
            sequence.push(chosenOperation);
            currentValue = chosenOperation.newValue;
        }
        return sequence;
    }

    function generateAbacusSequence(length) {
        if (currentAbacusMode === 'lowerBeads') {
            return generateLowerBeadsSequence(length);
        } else if (currentAbacusMode === 'fullUnitRod') {
            return generateFullUnitRodSequence(length);
        }
        console.error('Unknown abacus mode:', currentAbacusMode);
        return [];
    }

    function calculateResult(sequence) {
        let result = 0;
        sequence.forEach(op => {
            if (op.type === '+') {
                result += op.value;
            } else {
                result -= op.value;
            }
        });
        return result;
    }

    function startTimer() {
        console.log('Timer starting...');
        countdownValue = 5;
        countdownDisplay.textContent = `${countdownValue}s`;
        timerBarContainer.style.display = 'block';
        timerBar.style.width = '100%';
        timerBar.style.backgroundColor = 'var(--success-color)';
        timerBar.classList.remove('warning', 'critical');
        timerBar.style.transition = `width ${countdownValue}s linear`;

        setTimeout(() => {
            timerBar.style.width = '0%';
        }, 50);

        submitAnswerButton.disabled = false;
        studentAnswerInput.disabled = false;
        studentAnswerInput.value = '';
        studentAnswerInput.focus();

        timer = setInterval(() => {
            countdownValue--;
            countdownDisplay.textContent = `${countdownValue}s`;

            if (countdownValue <= 2 && countdownValue > 0) {
                timerBar.classList.add('warning');
            } else if (countdownValue <= 0) {
                timerBar.classList.add('critical');
                clearInterval(timer);
                countdownDisplay.textContent = "Time's Up!";
                endRound(false);
            }
        }, 1000);
    }

    function stopTimer() {
        console.log('Timer stopping.');
        clearInterval(timer);
        timerBarContainer.style.display = 'none';
        countdownDisplay.textContent = '';
        timerBar.style.transition = 'none';
    }

    function endRound(isCorrect) {
        console.log('Ending round. Correct:', isCorrect);
        stopTimer();
        submitAnswerButton.disabled = true;
        studentAnswerInput.disabled = true;

        if (isCorrect) {
            feedbackMessage.textContent = "Correct! 🎉";
            feedbackMessage.className = 'feedback-message correct';
            if (currentPlayer === 1) {
                player1Score += 5;
                displayPlayer1Score.textContent = player1Score;
            } else {
                player2Score += 5;
                displayPlayer2Score.textContent = player2Score;
            }
        } else {
            feedbackMessage.textContent = `Incorrect! The answer was ${correctAnswer}.`;
            feedbackMessage.className = 'feedback-message incorrect';
        }

        setTimeout(() => {
            if (isTwoPlayerMode) {
                if (currentPlayer === 1) {
                    // Player 1 just finished their turn for the current overallGameRound
                    currentPlayer = 2; // Switch to Player 2
                    showTransitionScreen(player2Name, "Your Turn!", overallGameRound); // Pass overallGameRound
                } else { // currentPlayer === 2
                    // Player 2 just finished their turn for the current overallGameRound
                    overallGameRound++; // Increment overall game round after both players have played
                    if (overallGameRound <= MAX_OVERALL_ROUNDS) {
                        // More overall game rounds to play
                        currentPlayer = 1; // Switch back to Player 1 for the next overallGameRound
                        showTransitionScreen(player1Name, "Your Turn!", overallGameRound); // Pass overallGameRound
                    } else {
                        // All overall game rounds are complete for both players
                        showAwardScreen();
                    }
                }
            } else { // 1-player mode
                overallGameRound++; // Increment overall game round for single player
                if (overallGameRound <= MAX_OVERALL_ROUNDS) {
                    showTransitionScreen(player1Name, "Next Round!", overallGameRound); // Pass overallGameRound
                } else {
                    showAwardScreen();
                }
            }
        }, 1500);
    }

    function showAwardScreen() {
        console.log("Showing award screen.");
        if (isTwoPlayerMode) {
            finalAwardPlayerName.classList.add('hidden');
            finalAwardScore.classList.add('hidden');
            twoPlayerResultDisplay.classList.remove('hidden');
            finalPlayer1Score.textContent = player1Score;
            finalPlayer2Score.textContent = player2Score;

            if (player1Score > player2Score) {
                document.querySelector('.award-title').textContent = `🏆 ${player1Name} Wins! 🏆`;
                awardInstruction.textContent = "What a BrainBox!";
            } else if (player2Score > player1Score) {
                document.querySelector('.award-title').textContent = `🏆 ${player2Name} Wins! 🏆`;
                awardInstruction.textContent = "Unstoppable Brain Power!";
            } else {
                document.querySelector('.award-title').textContent = `🤝 It's a Tie! 🤝`;
                awardInstruction.textContent = "Both Brains are equally powerful!";
            }

        } else {
            finalAwardPlayerName.textContent = player1Name;
            finalAwardScore.textContent = player1Score;
            finalAwardPlayerName.classList.remove('hidden');
            finalAwardScore.classList.remove('hidden');
            twoPlayerResultDisplay.classList.add('hidden');
            document.querySelector('.award-title').textContent = `🏆 Champion Trainer! 🏆`;
            if (currentAbacusMode === 'lowerBeads') {
                awardInstruction.textContent = "You've mastered the lower beads!";
            } else {
                awardInstruction.textContent = "You've mastered the full unit rod!";
            }
        }
        showScreen(awardScreen);
    }

    function showTransitionScreen(playerName, message, roundNumber) {
        transitionTitle.textContent = `${playerName}'s Turn!`;
        transitionMessage.textContent = `${message} (Round ${roundNumber} of ${MAX_OVERALL_ROUNDS})`;
        showScreen(transitionScreen);
        setTimeout(() => {
            showScreen(gamePlayScreen);
            startRound();
        }, 2500);
    }


    // --- Game Flow Functions ---

    function setupGameUI() {
        console.log('Setting up game UI for current player.');
        if (currentPlayer === 1) {
            displayPlayer1Name.textContent = player1Name;
            displayPlayer1Score.textContent = player1Score;
            player1ScoreCard.classList.add('active-player-card');
            player2ScoreCard.classList.remove('active-player-card');
        } else { // currentPlayer === 2
            displayPlayer2Name.textContent = player2Name;
            displayPlayer2Score.textContent = player2Score;
            player2ScoreCard.classList.add('active-player-card');
            player1ScoreCard.classList.remove('active-player-card');
        }

        currentRoundElement.textContent = overallGameRound;
        feedbackMessage.textContent = '';
        nextRoundButton.classList.add('hidden');
        studentAnswerInput.value = '';
        studentAnswerInput.disabled = true;
        submitAnswerButton.disabled = true;
        countdownDisplay.textContent = '';
        timerBarContainer.style.display = 'none';
        currentOperationElement.textContent = '';
    }

    function startRound() {
        console.log('--- Starting New Round ---');
        setupGameUI();

        currentSequence = generateAbacusSequence(operationsPerSequence);
        console.log("Generated Sequence:", JSON.stringify(currentSequence));
        correctAnswer = calculateResult(currentSequence);
        currentSequenceIndex = 0;
        currentOperationElement.textContent = 'Get ready!';

        setTimeout(displayNextOperation, 1500);
    }

    function displayNextOperation() {
        console.log('--- displayNextOperation Fired ---');
        console.log('Current Index:', currentSequenceIndex, 'Sequence Length:', currentSequence.length);

        if (currentSequenceIndex < currentSequence.length) {
            const op = currentSequence[currentSequenceIndex];

            if (op) {
                let displayString;
                // MODIFIED: Only add '-' sign for subtraction, no '+' for addition
                if (op.type === '+') {
                    displayString = `${op.value}`;
                } else { // op.type === '-'
                    displayString = `-${op.value}`;
                }

                console.log(`Setting display: "${displayString}" at index ${currentSequenceIndex}`);
                currentOperationElement.textContent = displayString;
                currentOperationElement.classList.add('animate');

                currentOperationElement.removeEventListener('animationend', removeAnimationClass);
                currentOperationElement.addEventListener('animationend', removeAnimationClass, { once: true });

                currentSequenceIndex++;
                setTimeout(displayNextOperation, operationDisplayDelay);
            } else {
                console.error("Critical Error: Operation object is undefined at index", currentSequenceIndex, "in the sequence.");
                currentOperationElement.textContent = "Sequence Error.";
                endRound(false);
            }
        } else {
            console.log("All operations displayed. Prompting for answer.");
            currentOperationElement.textContent = 'Time to answer!';
            startTimer();
        }
    }

    function removeAnimationClass() {
        currentOperationElement.classList.remove('animate');
    }

    function resetGame() {
        isTwoPlayerMode = false;
        player1Name = '';
        player2Name = '';
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        overallGameRound = 1;
        operationsPerSequence = 20;
        operationDisplayDelay = 800;
        currentAbacusMode = 'lowerBeads';

        // Reset UI elements
        player1NameInput.value = '';
        player2NameInput.value = '';
        player2InputGroup.classList.add('hidden');
        playersOneRadio.checked = true;

        displayPlayer1Score.textContent = '0';
        displayPlayer2Score.textContent = '0';
        player1ScoreCard.classList.remove('active-player-card');
        player2ScoreCard.classList.remove('active-player-card');
        player2ScoreCard.classList.add('hidden');

        speedNormal.checked = true;
        modePhysical.checked = true;
        diffEasy.checked = true;
        modeLowerBeadsRadio.checked = true;

        showScreen(playerSelectionScreen);
    }

    // --- Event Listeners ---

    nextToNameButton.addEventListener('click', () => {
        isTwoPlayerMode = playersTwoRadio.checked;
        if (isTwoPlayerMode) {
            player2InputGroup.classList.remove('hidden');
            player1NameInput.focus();
        } else {
            player2InputGroup.classList.add('hidden');
            player1NameInput.focus();
        }
        showScreen(nameScreen);
    });

    playersOneRadio.addEventListener('change', () => {
        player2InputGroup.classList.add('hidden');
    });
    playersTwoRadio.addEventListener('change', () => {
        player2InputGroup.classList.remove('hidden');
    });

    modeLowerBeadsRadio.addEventListener('change', () => {
        currentAbacusMode = 'lowerBeads';
        console.log('Abacus Mode set to:', currentAbacusMode);
    });

    modeFullUnitRodRadio.addEventListener('change', () => {
        currentAbacusMode = 'fullUnitRod';
        console.log('Abacus Mode set to:', currentAbacusMode);
    });

    startButton.addEventListener('click', () => {
        player1Name = player1NameInput.value.trim();
        if (isTwoPlayerMode) {
            player2Name = player2NameInput.value.trim();
        }

        if (player1Name && (!isTwoPlayerMode || player2Name)) {
            displayPlayer1Name.textContent = player1Name;
            if (isTwoPlayerMode) {
                displayPlayer2Name.textContent = player2Name;
                player2ScoreCard.classList.remove('hidden');
            } else {
                player2ScoreCard.classList.add('hidden');
            }
            showScreen(settingsScreen);
        } else {
            alert('Please enter names for all active players!');
            if (!player1Name) player1NameInput.focus();
            else if (isTwoPlayerMode && !player2Name) player2NameInput.focus();
        }
    });

    player1NameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (isTwoPlayerMode) player2NameInput.focus();
            else startButton.click();
        }
    });
    player2NameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startButton.click();
        }
    });

    startGameButton.addEventListener('click', () => {
        console.log('Start Game button clicked.');

        if (diffEasy.checked) {
            operationsPerSequence = 20;
        } else if (diffModerate.checked) {
            operationsPerSequence = 40;
        } else if (diffHard.checked) {
            operationsPerSequence = 60;
        }

        if (speedSlow.checked) {
            operationDisplayDelay = 1000;
        } else if (speedNormal.checked) {
            operationDisplayDelay = 800; // Adjusted back to 800ms for "Normal"
        } else if (speedFast.checked) {
            operationDisplayDelay = 200;
        }

        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        overallGameRound = 1;

        showScreen(gamePlayScreen);
        showTransitionScreen(player1Name, "Your Turn!", overallGameRound);
    });

    submitAnswerButton.addEventListener('click', () => {
        console.log('Submit Answer button clicked.');
        const studentAnswer = parseInt(studentAnswerInput.value, 10);
        if (isNaN(studentAnswer)) {
            feedbackMessage.textContent = "Please enter a number.";
            feedbackMessage.className = 'feedback-message incorrect';
            return;
        }
        endRound(studentAnswer === correctAnswer);
    });

    studentAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswerButton.click();
        }
    });

    playAgainAwardButton.addEventListener('click', () => {
        console.log('Play Again (Award Screen) button clicked.');
        resetGame();
    });

    // Initial screen display on load
    resetGame();
});