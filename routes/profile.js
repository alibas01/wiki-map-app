const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const salt    = 10;


module.exports = (db) => {

    // Helper functions
    const db_helpers = require('../lib/db_helpers')(db);
    const updateUsername = db_helpers.updateUsername;
    const updateEmail = db_helpers.updateEmail;
    const updatePass = db_helpers.updatePass;
    const getUsers = db_helpers.getUsers;
    const isRegisteredBefore = db_helpers.isRegisteredBefore;

    // GET /profile
    router.get('/', (req, res) => {
      const user = req.session['user_id'];
      getUsers().then(data => {
        for(let dat of data) {
          if(dat['username'] === user) {
            password = '********';
            username = dat['username'];
            email = dat['email'];
            const templateVars = { user, password, username, email };
            res.render('profile', templateVars)
          }
        }
      })
    });

    // POST /profile
    router.post("/", (req, res) => {
      const user = req.session['user_id'];
      if(req.body.user) {
        const new_user = req.body.user;
        isRegisteredBefore(new_user).then(isRegistered => {
        if(!isRegistered) {
          updateUsername(new_user, user);
          req.session['user_id'] = new_user;
          res.redirect("/profile");
        } else {
          res.status(400);
          let error_message = `<h1>Error:400</h1> <h2><b>This user(${new_user})   registered before!!!</h2><h3><a href="/profile">Profile Page</a></h3></  b>\n`;
          templateVars ={ error_message };
          res.render("error", templateVars);
        }
      })} else if(req.body.email) {
          const new_email = req.body.email;
          updateEmail(new_email, user);
          res.redirect("/profile");
        } else {
          const new_pass = bcrypt.hashSync(req.body.pass, salt);
          updatePass(new_pass, user);
          res.redirect("/profile");
        }
    });
  return router;
};
