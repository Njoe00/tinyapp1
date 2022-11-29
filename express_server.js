const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));

const generateRandomString = () => {
    return (Math.random() + 1).toString(36).substring(6);
  };


const urlDatabase = {
    "b2xVn2" : "http://www.lighthouselabs.ca",
    "9sm5xK" : "http://www.google.com"
};


app.post("/urls/:id/delete" , (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

app.get("/urls", (req, res) => {
    const templateVars = {urls: urlDatabase};
    return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = longURL;
    return res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
    return res.render("urls_show", templateVars);
  });

  app.get("/u/:id", (req, res) => {
    const id = req.params.id;
    const longURL = urlDatabase[id];
    return res.redirect(longURL);
  })

 













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