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
    const getPassword = db_helpers.getPassword;

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
          res.redirect("/");
        } else {
          res.status(404);
          let error_message = `This user(${new_user})   registered before!!!`;
          let code = 404;
          templateVars ={ user, error_message, code};
          res.render("error", templateVars);
        }
      })} else if(req.body.email) {
          const new_email = req.body.email;
          updateEmail(new_email, user);
          res.redirect("/");
        } else if (req.body.old_pass) {
          getPassword(user).then( pass => {
            if (bcrypt.compareSync(req.body.old_pass, pass) && req.body.pass) {
              const new_pass = bcrypt.hashSync(req.body.pass, salt);
              updatePass(new_pass, user);
              res.redirect("/");
            } else {
              res.status(403);
              let error_message = `Please check your password!!`;
              let code = 403;
              templateVars = { user, error_message, code};
              res.render("error", templateVars);
            }
          });
        } else {
          res.redirect("/profile");
        }

    });

  return router;
};
