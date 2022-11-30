const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(6);
};

const getUserByEmail = (email) => {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return null;
};

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "321"
  }
};

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const username = users[userId];
  const templateVars = {
    urls: urlDatabase,
    username
  };
  return res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete" , (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {username: users[userId]};
  return res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {userId};
  return res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (email === "" || password === "") {
    return res.send("Status Code 400");
  }
  if (!getUserByEmail(email)) {
    users[id] = {id, email, password};
    res.cookie("user_id", id);
    return res.redirect("/urls");
  }
  return res.send("Status Code 400");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email);
    if (user) {
      const password = req.body.password;
      if (user.password === password) {
        res.cookie("user_id", user.id);
        return res.redirect("/urls");
      }
    }
  return res.send("Error Code 403 password or email is incorrect");
  
});

app.get("/login", (req, res) => {
  return res.render("urls_login");
});

app.post("/logout", (req, res) => {
  user_id = req.cookies.user_id;
  res.clearCookie("user_id", user_id);
  return res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {id, longURL, username: users[userId]};
  return res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  return res.redirect(`/urls/${id}`);
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  return res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
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