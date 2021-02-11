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

  // POST /register
  router.post("/", (req, res) => {
    let user = req.body.user;
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.pass, salt);
    isRegisteredBefore(user).then(isRegistered => {
      if (user !== "" && req.body.pass !== "") {
        if (!isRegistered) {
          let newU = {username: user, email, password};
          newUser(newU);
          req.session['user_id'] = user;
          res.redirect("/");
        } else {
          user = null;
          res.status(404);
          let error_message = `This username registered before! Please choose an available one!`;
          let code = 404;
          templateVars ={ user, error_message, code};
          res.render("error", templateVars);
        }
      } else {
        user = null;
          res.status(404);
          let error_message = `Username or password cannot be empty!`;
          let code = 404;
          templateVars ={ user, error_message, code};
          res.render("error", templateVars);
    }})
  });

return router;
};
