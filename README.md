# rest-express-mongo-crud-todo-api

REST, MonogDB, Express server of todo app.

Compiled code situated in dist directory. Source code in src. Node modules in node_modules.

Has 2 versions of api:
v1 - means storage credentials and tasks in file by ./storage/v1; Can be launched by using CORS
v2 - means storage credentials and tasks in MongoDB client ./storage/v2.

For handling session management uses express-session middleware in ./session-middleware.
Routing situated in ./routes  for v1, v2 and static (without cors).
Page for CORS situated in ./new-client with "ran_linux_amd64" binary file for launching "ran"
Functions for v2 commands situated in ./methods/v2.

Server launch command in bash: "npm run dev".
