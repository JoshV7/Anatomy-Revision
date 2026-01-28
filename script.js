const supabase = window.supabase.createClient(
  "https://crwwkyoonmmcdurrbpfh.supabase.co",
  "sb_publishable_Czuc7wvfOKC92eTPRKbo1A_Qa8B1x70"
)

async function signUp() {
  const email = emailInput()
  const password = passInput()

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) alert(error.message)
  else alert("Account created")
}

async function signIn() {
  const email = emailInput()
  const password = passInput()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) alert(error.message)
  else alert("Logged in")
}

async function signOut() {
  await supabase.auth.signOut()
}

function emailInput() {
  return document.getElementById("email").value
}

function passInput() {
  return document.getElementById("password").value
}

async function testScore() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    alert("Login first")
    return
  }

  await supabase.from("scores").insert({
    user_id: user.id,
    score: Math.floor(Math.random()*20),
    percent: 80
  })

  alert("Score saved")
}
