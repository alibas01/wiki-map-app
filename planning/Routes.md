# Routes for Wiki-Map-App

The end-user wants to see a list of available maps
GET /maps

The end-user wants to view a particular map
GET /maps/:id

The authenticated end-user wants to create a new map
GET /maps/new
POST/maps

The authenticated end-user wants to modify an existing map
GET /maps/:id/update
PUT(POST) /maps/:id

The end-user wants to register
POST /register
GET /register

The end-user wants to login
POST /login
GET /login

<!-- The authenticated end-user wants to view maps which he/she fovourited and contributed to
GET /users/myprofile -->

The end-user wants to see a list of user profiles
GET /users

The end-user wants to see a specific profile
GET /users/:id

The end-user wants to see a list of the maps for a specific profile
GET /users/:id/maps

The end-user wants to see one particular map of a particular user
GET/users/:userId/maps/:id
