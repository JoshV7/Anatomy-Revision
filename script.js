// Supabase Configuration
const SUPABASE_URL = 'https://crwwkyoonmmcdurrbpfh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd3dreW9vbm1tY2R1cnJicGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTAzMjMsImV4cCI6MjA1Mzk4NjMyM30.Czuc7wvfOKC92eTPRKbo1A_Qa8B1x70';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State
let currentUser = null;
let muscles = [];
let currentMuscleIndex = 0;
let difficulty = null;
let hiddenCount = 0;
let score = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let timerInterval = null;
let startTime = null;
let currentMuscle = null;
let shuffledMuscles = [];
let hiddenFields = [];
let userAnswers = {};

// DOM Elements - Auth
const authScreen = document.getElementById('auth-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const quizScreen = document.getElementById('quiz-screen');
const authTabs = document.querySelectorAll('.auth-tab');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const signinError = document.getElementById('signin-error');
const signupError = document.getElementById('signup-error');

// DOM Elements - Difficulty
const difficultyCards = document.querySelectorAll('.difficulty-card');
const startQuizBtn = document.getElementById('start-quiz-btn');
const signoutBtnDifficulty = document.getElementById('signout-btn-difficulty');

// DOM Elements - Quiz
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const muscleImage = document.getElementById('muscle-image');
const muscleNameInput = document.getElementById('muscle-name-input');
const checkNameBtn = document.getElementById('check-name-btn');
const nameFeedback = document.getElementById('name-feedback');
const coinaSection = document.getElementById('coina-section');
const coinaTbody = document.getElementById('coina-tbody');
const submitCoinaBtn = document.getElementById('submit-coina-btn');
const nextMuscleBtn = document.getElementById('next-muscle-btn');
const signoutBtnQuiz = document.getElementById('signout-btn-quiz');
const resultsSection = document.getElementById('results-section');
const finalScore = document.getElementById('final-score');
const finalAccuracy = document.getElementById('final-accuracy');
const finalTime = document.getElementById('final-time');
const restartQuizBtn = document.getElementById('restart-quiz-btn');

// Initialize App
async function init() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showScreen('difficulty');
    } else {
        showScreen('auth');
    }
    
    // Load muscles data
    await loadMuscles();
    
    // Set up event listeners
    setupEventListeners();
}

// Load Muscles JSON
async function loadMuscles() {
    try {
        const response = await fetch('muscles.json');
        muscles = await response.json();
    } catch (error) {
        console.error('Error loading muscles:', error);
        alert('Failed to load muscle data. Please refresh the page.');
    }
}

// Screen Management
function showScreen(screenName) {
    const screens = [authScreen, difficultyScreen, quizScreen];
    screens.forEach(screen => screen.classList.remove('active'));
    
    switch(screenName) {
        case 'auth':
            authScreen.classList.add('active');
            break;
        case 'difficulty':
            difficultyScreen.classList.add('active');
            break;
        case 'quiz':
            quizScreen.classList.add('active');
            break;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.getElementById('signin-form').classList.remove('active');
            document.getElementById('signup-form').classList.remove('active');
            
            if (tabName === 'signin') {
                document.getElementById('signin-form').classList.add('active');
            } else {
                document.getElementById('signup-form').classList.add('active');
            }
        });
    });
    
    // Auth forms
    signinForm.addEventListener('submit', handleSignIn);
    signupForm.addEventListener('submit', handleSignUp);
    
    // Difficulty selection
    difficultyCards.forEach(card => {
        card.addEventListener('click', () => {
            difficultyCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            difficulty = card.dataset.difficulty;
            hiddenCount = parseInt(card.dataset.hidden);
            startQuizBtn.disabled = false;
        });
    });
    
    startQuizBtn.addEventListener('click', startQuiz);
    signoutBtnDifficulty.addEventListener('click', signOut);
    signoutBtnQuiz.addEventListener('click', signOut);
    
    // Quiz interactions
    checkNameBtn.addEventListener('click', checkMuscleName);
    muscleNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkMuscleName();
        }
    });
    
    submitCoinaBtn.addEventListener('click', submitCoinaAnswers);
    nextMuscleBtn.addEventListener('click', loadNextMuscle);
    restartQuizBtn.addEventListener('click', () => {
        showScreen('difficulty');
        resetQuiz();
    });
}

// Authentication Handlers
async function handleSignIn(e) {
    e.preventDefault();
    signinError.textContent = '';
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        signinError.textContent = error.message;
    } else {
        currentUser = data.user;
        showScreen('difficulty');
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    signupError.textContent = '';
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    
    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        return;
    }
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        signupError.textContent = error.message;
    } else {
        signupError.style.background = 'rgba(62, 207, 142, 0.1)';
        signupError.style.borderColor = 'var(--success)';
        signupError.style.color = 'var(--success)';
        signupError.textContent = 'Account created! Please check your email to confirm.';
        
        // Auto switch to sign in after 2 seconds
        setTimeout(() => {
            authTabs[0].click();
            signupForm.reset();
            signupError.textContent = '';
            signupError.style.background = '';
            signupError.style.borderColor = '';
            signupError.style.color = '';
        }, 3000);
    }
}

async function signOut() {
    await supabase.auth.signOut();
    currentUser = null;
    resetQuiz();
    showScreen('auth');
}

// Quiz Functions
function startQuiz() {
    // Shuffle muscles
    shuffledMuscles = [...muscles].sort(() => Math.random() - 0.5);
    currentMuscleIndex = 0;
    score = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    
    // Update UI
    currentDifficultyDisplay.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).replace('-', ' ');
    updateScoreDisplay();
    
    // Start timer
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    // Show quiz screen and load first muscle
    showScreen('quiz');
    loadMuscle();
}

function loadMuscle() {
    if (currentMuscleIndex >= shuffledMuscles.length) {
        endQuiz();
        return;
    }
    
    currentMuscle = shuffledMuscles[currentMuscleIndex];
    
    // Reset UI
    muscleNameInput.value = '';
    muscleNameInput.disabled = false;
    checkNameBtn.disabled = false;
    nameFeedback.textContent = '';
    nameFeedback.className = 'feedback';
    coinaSection.style.display = 'none';
    
    // Display random muscle image
    const randomImage = currentMuscle.images[Math.floor(Math.random() * currentMuscle.images.length)];
    muscleImage.src = randomImage;
    muscleImage.alt = 'Muscle to identify';
}

function checkMuscleName() {
    const userInput = muscleNameInput.value.trim().toLowerCase();
    const correctName = currentMuscle.name.toLowerCase();
    
    if (userInput === correctName) {
        nameFeedback.textContent = '✓ Correct! Now identify the COINA values.';
        nameFeedback.className = 'feedback success';
        muscleNameInput.disabled = true;
        checkNameBtn.disabled = true;
        
        score++;
        correctAnswers++;
        totalQuestions++;
        updateScoreDisplay();
        
        // Show COINA section
        loadCoinaQuestions();
    } else {
        nameFeedback.textContent = '✗ Incorrect. Try again.';
        nameFeedback.className = 'feedback error';
        totalQuestions++;
        updateScoreDisplay();
    }
}

function loadCoinaQuestions() {
    coinaSection.style.display = 'block';
    coinaTbody.innerHTML = '';
    
    const coinaKeys = Object.keys(currentMuscle.COINA);
    
    // Randomly select fields to hide
    hiddenFields = [];
    const shuffledKeys = [...coinaKeys].sort(() => Math.random() - 0.5);
    hiddenFields = shuffledKeys.slice(0, Math.min(hiddenCount, coinaKeys.length));
    
    userAnswers = {};
    
    // Build COINA table
    coinaKeys.forEach(key => {
        const tr = document.createElement('tr');
        const labelTd = document.createElement('td');
        const valueTd = document.createElement('td');
        
        labelTd.textContent = key;
        
        if (hiddenFields.includes(key)) {
            // Create multiple choice options
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'coina-options';
            
            const options = generateOptions(key, currentMuscle.COINA[key]);
            
            options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option;
                btn.dataset.key = key;
                btn.dataset.value = option;
                btn.addEventListener('click', function() {
                    // Deselect other options for this key
                    optionsDiv.querySelectorAll('.option-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    userAnswers[key] = option;
                });
                optionsDiv.appendChild(btn);
            });
            
            valueTd.appendChild(optionsDiv);
        } else {
            valueTd.textContent = currentMuscle.COINA[key];
        }
        
        tr.appendChild(labelTd);
        tr.appendChild(valueTd);
        coinaTbody.appendChild(tr);
    });
    
    submitCoinaBtn.style.display = 'block';
    nextMuscleBtn.style.display = 'none';
}

function generateOptions(key, correctAnswer) {
    const options = [correctAnswer];
    
    // Get all possible answers from other muscles for this key
    const allAnswers = muscles
        .map(m => m.COINA[key])
        .filter(answer => answer && answer !== correctAnswer);
    
    // Shuffle and pick 4 random incorrect answers
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    const incorrectOptions = shuffled.slice(0, 4);
    
    options.push(...incorrectOptions);
    
    // Shuffle all options
    return options.sort(() => Math.random() - 0.5);
}

function submitCoinaAnswers() {
    let allCorrect = true;
    let coinaCorrect = 0;
    
    hiddenFields.forEach(key => {
        const correctAnswer = currentMuscle.COINA[key];
        const userAnswer = userAnswers[key];
        
        // Find all option buttons for this key
        const optionButtons = document.querySelectorAll(`.option-btn[data-key="${key}"]`);
        
        optionButtons.forEach(btn => {
            btn.disabled = true;
            const btnValue = btn.dataset.value;
            
            if (btnValue === correctAnswer) {
                btn.classList.add('correct');
            } else if (btnValue === userAnswer && btnValue !== correctAnswer) {
                btn.classList.add('incorrect');
                allCorrect = false;
            }
        });
        
        if (userAnswer === correctAnswer) {
            coinaCorrect++;
        }
    });
    
    // Update score
    score += coinaCorrect;
    correctAnswers += coinaCorrect;
    totalQuestions += hiddenFields.length;
    updateScoreDisplay();
    
    submitCoinaBtn.style.display = 'none';
    nextMuscleBtn.style.display = 'block';
}

function loadNextMuscle() {
    currentMuscleIndex++;
    loadMuscle();
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `${correctAnswers}/${totalQuestions}`;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

async function endQuiz() {
    clearInterval(timerInterval);
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Hide quiz elements, show results
    document.querySelector('.quiz-header').style.display = 'none';
    document.querySelector('.muscle-image-container').style.display = 'none';
    document.querySelector('.name-input-section').style.display = 'none';
    coinaSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Display results
    finalScore.textContent = `${correctAnswers}/${totalQuestions}`;
    finalAccuracy.textContent = `${accuracy}%`;
    
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    finalTime.textContent = `${minutes}:${seconds}`;
    
    // Save score to Supabase
    await saveScore(correctAnswers, totalQuestions);
}

async function saveScore(correct, total) {
    try {
        const { data, error } = await supabase
            .from('scores')
            .insert([
                {
                    user_id: currentUser.id,
                    score: correct,
                    correct_answers: correct,
                    total_questions: total,
                    date: new Date().toISOString()
                }
            ]);
        
        if (error) {
            console.error('Error saving score:', error);
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

function resetQuiz() {
    clearInterval(timerInterval);
    currentMuscleIndex = 0;
    score = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    difficulty = null;
    hiddenCount = 0;
    
    // Reset UI
    difficultyCards.forEach(c => c.classList.remove('selected'));
    startQuizBtn.disabled = true;
    
    document.querySelector('.quiz-header').style.display = 'flex';
    document.querySelector('.muscle-image-container').style.display = 'flex';
    document.querySelector('.name-input-section').style.display = 'block';
    resultsSection.style.display = 'none';
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);