const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const salt    = 10;


module.exports = (db) => {
  // Helper functions
  const db_helpers = require('../lib/db_helpers')(db);
  const newUser = db_helpers.newUser;
  const getPassword = db_helpers.getPassword;
  const isRegisteredBefore = db_helpers.isRegisteredBefore;

  // GET /login
  router.get("/", (req, res) => {
    const user = req.session['user_id'];
    const templateVars = { user: user };
    if (!user) {
      res.render("login", templateVars);
    } else {
      res.redirect(`/`);
    }
  });

  // POST /login
  router.post("/", (req, res) => {
    let user = req.body.user;
    let password = req.body.pass;
    isRegisteredBefore(user).then(isRegistered => {
      if (isRegistered) {
        getPassword(user).then(pass => {
          if (bcrypt.compareSync(password, pass)) {
            req.session['user_id'] = user;
            res.redirect("/");
          } else {
            user = null;
            res.status(403);
            let error_message = `Please check your password!!`;
            let code = 403;
            templateVars = { user, error_message, code};
            res.render("error", templateVars);
          }
        });
      } else {
        user = null;
        res.status(403);
        let error_message = `This username is not registered! Please Register first!`;
        let code = 403;
        templateVars = { user, error_message, code};
        res.render("error", templateVars);
      }
    });
  });

  return router;
};
