const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const {getUserByEmail} = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ["Dance-Monkey"],
}));


const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));




const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(6);
};

const urlsForUsers = (id) => {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

const urlDatabase = {
  "b2xVn2" : {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },

};

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


app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    const username = users[userId];
    const templateVars = {
      urls: urlsForUsers(userId),
      username
    };
    return res.render("urls_index", templateVars);
  }
  return res.send("Error you need account to view URLs");
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
    
  if (user_id) {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = {longURL: longURL, userID: user_id};
    return res.redirect(`/urls/${id}`);
  }
  return res.send("You must have account to shorten URLS \n");
});

app.post("/urls/:id/delete" , (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.send("Error you cannot delete this URL because you are not logged in.\n");
  }
  if (urlDatabase[id] === undefined) {
    return res.send("Error you cannot delete this URL because it does not exist.\n");
  }
  console.log("user", user_id, "database", urlDatabase[id].userID);
  if (user_id !== urlDatabase[id].userID) {
    return res.send("Error you cannot delete this URL because it does not belong to you.\n");
  }
  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    const templateVars = {username: users[userId]};
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {username: userId};
  if (userId) {
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (email === "" || password === "") {
    return res.send("Status Code 400");
  }
  if (!getUserByEmail(email, users)) {
    const password = req.body.password;
    const hashPass2 = bcrypt.hashSync(password, password.length);
    users[id] = {id, email, password: hashPass2};
    req.session.user_id = users[id].id;
    return res.redirect("/urls");
  }
  return res.send("Status Code 400");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (user) {
    const password = req.body.password;
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect("/urls");
    }
  }
  return res.send("Error Code 403 password or email is incorrect");
  
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {username: userId};
  if (userId) {
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  const user_id = req.session.user_id;
  req.session = null;
  return res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const user_Id = req.session.user_id;
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const urlUserID = urlDatabase[id].userID;
  if (!user_Id) {
    return res.send("Error you cannot edit URLS if are not logged in.");

  }
  if (urlUserID === user_Id) {
    const templateVars = {urlUserID, id, longURL, username: users[user_Id]};
    return res.render("urls_show", templateVars);
  }
  return res.send("Error you do not own this URL.");
});

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
  return res.redirect(`/urls/${id}`);
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.send("This shortened URL does not exist");
  }
  const longURL = urlDatabase[id].longURL
  return res.redirect(longURL);

});










app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json" , (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html\n");
});