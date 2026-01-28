// --- Supabase setup ---
const supabase = window.supabase.createClient(
  "https://crwwkyoonmmcdurrbpfh.supabase.co",
  "sb_publishable_Czuc7wvfOKC92eTPRKbo1A_Qa8B1x70"
);

// --- Auth functions ---
function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  supabase.auth.signUp({ email, password })
    .then(({ data, error }) => {
      if (error) {
        document.getElementById('auth-message').innerText = "Error: " + error.message;
      } else {
        document.getElementById('auth-message').innerText = "Sign up successful! Please check your email to confirm.";
      }
    });
}

function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  supabase.auth.signInWithPassword({ email, password })
    .then(({ data, error }) => {
      if (error) {
        document.getElementById('auth-message').innerText = "Error: " + error.message;
      } else {
        document.getElementById('auth-message').innerText = "Logged in!";
        document.getElementById('auth').style.display = "none";
        document.getElementById('game').style.display = "block";
        loadRandomMuscle();
      }
    });
}

function signOut() {
  supabase.auth.signOut()
    .then(({ error }) => {
      if (error) {
        document.getElementById('auth-message').innerText = "Error signing out: " + error.message;
      } else {
        document.getElementById('auth').style.display = "block";
        document.getElementById('game').style.display = "none";
        document.getElementById('auth-message').innerText = "Logged out!";
      }
    });
}

let currentMuscle = null;

function loadRandomMuscle() {
  const index = Math.floor(Math.random() * muscles.length);
  currentMuscle = muscles[index];
  const imgIndex = Math.floor(Math.random() * currentMuscle.images.length);
  document.getElementById('muscle-image').src = currentMuscle.images[imgIndex];
  document.getElementById('muscle-name').value = "";
  document.getElementById('result').innerText = "";
}

function checkAnswer() {
  const userInput = document.getElementById('muscle-name').value.trim().toLowerCase();
  if (!currentMuscle) return;
  const correct = currentMuscle.name.toLowerCase();
  if (userInput === correct) {
    document.getElementById('result').innerText = "✅ Correct!";
    loadRandomMuscle();
  } else {
    document.getElementById('result').innerText = "❌ Try again!";
  }
}

// Optional test score button
function testScore() {
  alert("This will save the score later!");
}
