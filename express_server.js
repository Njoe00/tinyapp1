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

const urlDatabase = {
    "b2xVn2" : "http://www.lighthouselabs.ca",
    "9sm5xK" : "http://www.google.com"
};

app.get("/urls", (req, res) => {
    const username = req.cookies.username
    console.log(req.cookies);
    const templateVars = {
        urls: urlDatabase, 
        username
    };
    return res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete" , (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    return res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
    const templateVars = {username: req.cookies["username"]}
    return res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
    const username = req.body.username
    res.cookie("username", username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie("username")
    return res.redirect("/urls")
})

app.get("/urls/:id", (req, res) => {
    console.log("cookies", req.cookies);
    const username = req.cookies.username;
    console.log("test2", req.cookies)
    const id = req.params.id;
    const longURL = urlDatabase[id];
    const templateVars = {id, longURL, username};
    return res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
    const id = req.params.id;
    urlDatabase[id] = req.body.longURL
    return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
   const id = req.params.id
   const longURL = urlDatabase[id]
   return res.redirect(`/urls/${id}`)
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