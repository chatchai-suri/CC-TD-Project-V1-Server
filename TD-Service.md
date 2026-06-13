## TD Project Service: e.g. api/v1/auth/register
| path: api/v1/... | method | authen | params | query | body | description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *** Authentication Routing |
| auth/register | post | - | - | - | { username, password, confirmPassword } | - for register |
| auth/login | post | - | - | - | { username, password, confirmPassword } | - for login |
| auth/getCurrentUser | get| y | - | - | - | - for token |
||
| *** Administrator Routing|
| admin/user/changeRole | post | y | - | - | { username, global_role } | - for change role to be amoung Admin, TD, Scorer, User, etc. |
| admin/user/addGolfer| post | y | - | - | { username, password, confirmPassword } | - for create new user |
| admin/user/del | delete | y | :id | - | { username, password } | - for delete user |
| admin/course/register | post | y | - | - | { course_name, section_name, hole_number, par, distance_yards } | - for register course: name, section & holes information |
| admin/tournament/register | post | y | - | - | { tournament_name, tournament_mode, use_age_option, section_1_id, section_2_id, event_date, status } | - for register tournament |
| admin/tournamnet/editScore | post | y | - | - | { tournament_name, username, ...all scores } | - edit all score for each user |
| admin/tournament/close | put | y | :id | - | { status } | - for close tournament |
| *** Tournament Director (TD) Routing |
| td/course/register | post | y | - | - | { course_name, section_name, hole_number, par, distance_yards } | - for register course: name, section & holes information |
| td/tournament/register | post | y | - | - | { tournament_name, tournament_mode, use_age_option, section_1_id, section_2_id, event_date, status } | - for register tournament |
| td/tournamnet/editScore | post | y | - | - | { tournament_name, username, ...all scores } | - edit all score for each user |
| td/tournament/close | put | y | :id | - | { status } | - for close tournament |
| ***Scorer Routing |
| scorer/tournamnet/editFlightScore | post | y | - | - | { username, hole_number, travelling, putts } | - edit all score for member in same flight |
| *** User Routing |
| user/tournamnet/viewScore | get | y | :id | - | - | - edit all score for member in same flight |
| user/tournamnet/editUserScore | post | y | - | - | { username, hole_number, travelling, putts } | - edit score of userhimself when tournament mode is casual |