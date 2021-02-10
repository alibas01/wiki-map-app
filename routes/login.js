const express = require('express');
const router  = express.Router();

module.exports = (db) => {

// GET /login
router.get("/login", (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user: user };
  if (!user) {
    res.render("login", templateVars);
  } else {
    res.redirect(`/`);
  }
});

// POST /login
router.post("/login", (req, res) => {
  let user = req.body.user;
  let password = req.body.pass;
  let isRegistered = false;
  isRegisteredBefore(user).then(data => {
    if(data){
    isRegistered = true;
    }
    if (isRegistered) {
      getPassword(user).then( pass => {
        if (bcrypt.compareSync(password, pass)) {
          let newU = {username: user, password};
          newUser(newU);
          req.session['user_id'] = user;
          res.redirect("/");
        } else {
          res.status(403);
          let error_message = `<h1>Error:403</h1> <h2><b>Please check your password!!!</h2><h3><a href="/login">Login</a></h3></b>\n`;
          templateVars ={ error_message }
          res.render("error", templateVars);
        }})
    } else {
      res.status(403);
      let error_message = `<h1>Error:403</h1> <h2><b>This email(${user}) is not registered!!!\n Please Register first!</h2><h3><a href="/register">Register</a></h3></b>\n`;
        templateVars ={ error_message }
        res.render("error", templateVars);
  }})
});

return router;
};
