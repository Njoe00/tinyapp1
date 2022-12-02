
// SERVER SET-UP
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");

const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["Dance-Monkey"],
}));

// HELPER FUNCTION IMPORTS
const { getUserByEmail, generateRandomString, urlsForUsers } = require("./helpers");

// USER URLDATABASE
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },

};

// USER DATABSAE
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "321",
  }
};

// URL ROUTE FOR INDEX PAGE
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
    const username = users[user_id];
    const templateVars = {
      urls: urlsForUsers(user_id, urlDatabase),
      username,
    };
    return res.render("urls_index", templateVars);
  }
  return res.send("Error you need account to view URLs\n");
});

// POST ROUTE FOR URLS INDEX
app.post("/urls", (req, res) => {
  // GET USER ID FROM SESSION
  const user_id = req.session.user_id;

  if (user_id) {
    // Generate 6 digit id for database
    const id = generateRandomString();
    const longURL = req.body.longURL;
    //Create new urldatabase obj for user
    urlDatabase[id] = { longURL, userID: user_id };
    return res.redirect(`/urls/${id}`);
  }
  return res.send("You must have account to shorten URLS \n");
});

// DELETE URLS ROUTE FOR SPECIFIC URLDATABASE OBJ
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.send("Error you cannot delete this URL because you are not logged in.\n");
  } else if (urlDatabase[id] === undefined) {
    return res.send("Error you cannot delete this URL because it does not exist.\n");
  } else if (user_id !== urlDatabase[id].userID) {
    return res.send("Error you cannot delete this URL because it does not belong to you.\n");
  }
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// GET ROUTE FOR NEW URLS
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    const templateVars = { username: users[user_id] };
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

// REGISTER USER GET ROUTE
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { username: userId };
  //if existing cookie then redirect to /urls
  if (userId) {
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);
});

// REGISTER USER POST ROUTE
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // if email or password is empty return error code
  if (email === "" || password === "") {
    return res.send("Status Code 400");
  }
  //if there is no existing email in the database
  if (!getUserByEmail(email, users)) {
    // create new user object with hashpassword, email,  & id
    const password = req.body.password;
    const hashPass2 = bcrypt.hashSync(password, password.length);
    users[id] = { id, email, password: hashPass2 };
    req.session.user_id = users[id].id;
    return res.redirect("/urls");
  }
  return res.send("Status Code 400");
});

// LOGIN ROUTE POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  // if email exists in userdatabase then check passwords
  if (user) {
    const password = req.body.password;
    // if bcrypt returns true and the passwords match create user cookie and redirect to /urls
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect("/urls");
    }
  }
  return res.send("Error Code 403 password or email is incorrect");

});

// LOGIN GET ROUTE
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { username: userId };
  if (userId) {
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});


// LOGOUT USER POST ROUTE
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

// SHORT URL GET ROUTE
app.get("/urls/:id", (req, res) => {
  const user_Id = req.session.user_id;
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const urlUserID = urlDatabase[id].userID;

  if (!urlDatabase[id]) {
    return res.send("Error this URL does not exist");
  }
  if (!user_Id) {
    return res.send("Error you cannot edit URLS if are not logged in.");
  }
  if (urlUserID === user_Id) {
    const templateVars = { urlUserID, id, longURL, username: users[user_Id] };
    return res.render("urls_show", templateVars);
  }
  return res.send("Error you do not own this URL.");
});

// SHORT URL POST ROUTE
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.send("Error you cannot edit this URL because you are not logged in.\n");
  }
  if (urlDatabase[id] === undefined) {
    return res.send("Error you cannot edit this URL because it does not exist.\n");
  }
  if (user_id !== urlDatabase[id].userID) {
    return res.send("Error you cannot edit this URL because it does not belong to you.\n");
  }
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  return res.redirect(`/urls`);
});

//LONGURL GET ROUTE TO REDIRCT TO LONGURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  // if URL does not exist in database return error
  if (!urlDatabase[id]) {
    return res.send("This shortened URL does not exist");
  }
  const longURL = urlDatabase[id].longURL;
  return res.redirect(longURL);
});

// TESTING ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html\n");
});