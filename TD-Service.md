## TD Project Service: e.g. api/v1/auth/register
| path: api/v1/... | method | authen | params | query | body | description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *** Authentication Routing |
| auth/registerUser | post | - | - | - | { username, password, confirmPassword } | - for register user |
| auth/login | post | - | - | - | { username, password } | - for login |
| auth/getCurrentUser | get| y | - | - | - | - for token |
||
| *** Administrator Routing|
| admin/user/changeRole | post | y | - | - | { username, global_role } | - for change role to be amoung Admin, TD, Scorer, User, etc. |
| admin/user/addGolfer| post | y | - | - | { username, password, confirmPassword } | - for create new user |
| admin/user/delGolfer | delete | y | :id | - | { username, password } | - for delete user |
| admin/course/registerCourse | post | y | - | - | { course_name, section_name, hole_number, par, distance_yards } | - for register course: name, section & holes information |
| admin/course/updateCourse | put | y | - | - | { course_name, section_name, hole_number, par, distance_yards } | - for update course: name, section & holes information |
| admin/course/deleteCourse | post | y | :id | - | - | - for delete course: name, section & holes information |
| admin/tournament/registerTournament | post | y | - | - | { tournament_name, tournament_mode, use_age_option, section_1_id, section_2_id, event_date, status } | - for register tournament |
| admin/tournamnet/editScore | post | y | - | - | { tournament_name, username, ...all scores } | - edit all score for each user |
| admin/tournament/closeTournament | put | y | :id | - | { status } | - for close tournament |
| *** Tournament Director (TD) Routing |
| td/course/registerCourse | post | y | - | - | { course_name, section_name, hole_number, par, distance_yards } | - for register course: name, section & holes information |
| td/tournament/registerTournament | post | y | - | - | { tournament_name, tournament_mode, use_age_option, section_1_id, section_2_id, event_date, status } | - for register tournament |
| td/tournamnet/editScore | post | y | - | - | { tournament_name, username, ...all scores } | - edit all score for each user |
| td/tournament/closeTourment | put | y | :id | - | { status } | - for close tournament |
| td/flight/setupFlightWithMembers | post | y | :id | - | { fligh_id, user_id,... } | - for setup flight with members |
| td/flight/deleteFlight | put | y | :id | - | { password } | - for delete flight |
| td/flight/changeFlightName | put | y | :id | - | { flight_id, flight_name, password } | - for change flight name |
| td/flight/changeFlightMembers | put | y | :id | - | { flight_id, user-id, password } | - for change flight-members name list |
| ***Scorer Routing |
| scorer/tournamnet/recordHoleScore | post | y | - | - | { flight_id, user_id, hole_id, stroke, par } | - record score for all members in same flight |
| *** User Routing |
| user/tournamnet/viewScore | get | y | :id | - | - | - edit all score for member in same flight |
| user/tournamnet/editUserScore | post | y | - | - | { username, hole_number, travelling, putts } | - edit score of userhimself when tournament mode is casual |