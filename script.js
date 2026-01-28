// Initialize Supabase client (UMD version)
const supabase = window.supabase.createClient(
  "https://crwwkyoonmmcdurrbpfh.supabase.co",
  "sb_publishable_Czuc7wvfOKC92eTPRKbo1A_Qa8B1x70"
)

// ---------------- Auth ----------------
async function signUp() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    alert(error.message)
  } else {
    alert("Sign up successful! Please check your email if confirmation is required.")
    console.log(data)
  }
}

async function signIn() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert(error.message)
  } else {
    alert("Login successful!")
    console.log(data)
    getLeaderboard()
  }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) alert(error.message)
  else alert("Logged out")
}

// ---------------- Test Score ----------------
async function testScore() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) { 
    alert("Please login first!")
    return 
  }

  // Example test score
  const score = Math.floor(Math.random() * 20)
  const percent = Math.floor(Math.random() * 100)

  const { data, error } = await supabase.from("scores").insert({
    user_id: user.id,
    score: score,
    percent: percent
  })
  if (error) alert(error.message)
  else {
    alert(`Score saved! Score: ${score}, Percent: ${percent}%`)
    getLeaderboard()
  }
}

// ---------------- Leaderboard ----------------
async function getLeaderboard() {
  const { data, err
