# Meetings minutes

## Meeting 1.
* **DATE:**
* **PARTICIPANTS:**
* **TEACHER:**

### Action points
*List here the actions points discussed with assistants*

### Notes
*Add here notes that you consider important. This is not mandatory*


## Meeting 2.
* **DATE:**
* **PARTICIPANTS:**
* **TEACHER:**

### Action points
*List here the actions points discussed with assistants*

### Notes
*Add here notes that you consider important. This is not mandatory*


## Meeting 3.
* **DATE:**
* **PARTICIPANTS:**
* **TEACHER:**

### Action points
*List here the actions points discussed with assistants*

### Notes
*Add here notes that you consider important. This is not mandatory*


## Meeting 4.
* **DATE:**
* **PARTICIPANTS:**
* **TEACHER:**

### Action points
*List here the actions points discussed with assistants*

### Notes
*Add here notes that you consider important. This is not mandatory*


## Midterm meeting
* **DATE: 10/04/2026**
* **PARTICIPANTS: Ibrahim Odetunde, Jessica Suárez, Vladislav Ekushev**
* **TEACHER: Iván Sánchez**

### Action points
- Usecase review:
  - Expand this section to include client use cases for functionalities and possible services (check out HOMEY.app and HomeAssistant.io). Not mandatory but ideal to expand on this.
- Login and Logout are not necessary for this course so remove it.
- Keep in mind RESTFUL consistence!! [1]
- Connectedness to be review to match required criteria
- Javascript-> to avoid issues, explain project structure, just a link to NestJs
- Documenting inside the code is part of the criteria (including in tests)

### Notes
- For some reason, the diagram from deliverable 0 did not show, although it was there.
- [1]: To expand on this section:
  - Apartments was ok, Rooms… not wrong but GET api/rooms?apartment-id=347435 -> list of room in two different apartment and so
  - GET  /api/room?location=Oulu(query implementation)
  - POST avatar would require resource inside avatar -> post to that avatar api/user/userid/avatar (again, Ibrahim will know)
  - DEVICES: Add again a new resource and stuff → careful because it may break statelesness. Not a wrong way to do it but it can be improved. Good example is: GET api/users/userid/favorites is a better way, just remember to specify the USER!
  - One more resource + different status instead of using GET-> toggling
  - ONLY USER is authorized to see what it is inside their userId, so try to address that issue.
- Instructions for running app went missing, even though they were included in original repository.
- For some reason no test results were found inside the folder, even though in earlier versions there was a generated script in the repo.
- Schema was good.
- Caching is good, but please explain why was it implemented (and why was it necessary to include it along the code)
- Home server is OK as long as they can access it
- FOR FINAL REVIEW: More time to go through the code in general (1 hour meeting) + Controller / Module / Services


## Final meeting
* **DATE:**
* **PARTICIPANTS:**
* **TEACHER:**

### Minutes
*Summary of what was discussed during the meeting*

### Notes
*Add here notes that you consider important. This is not mandatory*



