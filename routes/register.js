const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const salt    = 10;


module.exports = (db) => {

  // Helper functions
  const db_helpers = require('../lib/db_helpers')(db);
  const newUser = db_helpers.newUser;
  const isRegisteredBefore = db_helpers.isRegisteredBefore;

  // GET /register
  router.get("/", (req, res) => {
    const user = req.session['user_id'];
    const templateVars = { user };
    if (!user) {
      res.render("register", templateVars);
    } else {
      res.redirect(`/`);
    }
  });

  // // POST /register
  router.post("/", (req, res) => {
    let user = req.body.user;
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.pass, salt);
    let isRegistered = true;
    isRegisteredBefore(user).then(data => {
      if(!data){
      isRegistered = false;
      }
      if (user !== "" && req.body.pass !== "") {
        if (!isRegistered) {
          let newU = {username: user, email, password};
          newUser(newU);
          req.session['user_id'] = user;
          res.redirect("/");
        } else {
          res.status(400);
          let error_message = `<h1>Error:400</h1> <h2><b>This user(${user})   registered before!!!</h2><h3><a href="/register">Register</a></h3></  b>\n`;
          templateVars ={ error_message }
          res.render("error", templateVars);
        }
      } else {
        res.status(400);
        let error_message = `<h1>Error:400</h1> <h2><b>Email or Password   cannot be empty!!!</h2><h3><a href="/register">Register</a></h3></  b>\n`;
          templateVars ={ error_message }
          res.render("error", templateVars);
    }})
  });

return router;
};
