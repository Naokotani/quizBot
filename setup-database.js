const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/tasks.db');

db.serialize(() => {
  db.run(`
CREATE TABLE task
(id INTEGER PRIMARY KEY,
 type VARCHAR[6000],
 name VARCHAR[6000],
 classID INTEGER,
 date DATE)
`);

  db.run("CREATE TABLE addInfo (taskID INTEGER, type VARCHAR[6000], info VARCHAR[4000])");
	db.run("CREATE TABLE classes (id INTEGER PRIMARY KEY, className VARCHAR[6000], active BOOLEAN)");

	db.run("INSERT INTO classes (className, active) VALUES (?, ?)", {
		1: "Programming",
		2: 1,
	});

	db.run("INSERT INTO classes (className, active) VALUES (?, ?)", {
		1: "DATABASE",
		2: 1,
	});

	db.run("INSERT INTO classes (className, active) VALUES (?, ?)", {
		1: "Netowrking",
		2: 1,
	});

	db.run("INSERT INTO classes (className, active) VALUES (?, ?)", {
		1: "Websites",
		2: 1,
	});

	db.run("INSERT INTO task (type, name, classID, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Quiz",
		2: "quizzler!",
		3: 1,
	});

	db.run("INSERT INTO task (type, name, classID, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Assignment",
		2: "Cool Assignment",
		3: 2,
	});

	db.run("INSERT INTO task (type, name, classID, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Quiz",
		2: "quiz Time!",
		3: 3,
	});

	db.run("INSERT INTO addInfo VALUES (?, ?, ?)", {
		1: 2,
		2: "Assignment",
		3: "This is a whole buncha text yo",
	});

  db.each("SELECT t.id, name, c.className, date FROM task t JOIN classes c ON t.classID = c.id", (err, row) => {
		console.log("task");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date}`);
  });
  db.each("SELECT rowid AS id, type, taskID, info FROM addInfo", (err, row) => {
	console.log("addInfos");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.type} ${row.taskID} ${row.info}`);
  });
	
  db.each("SELECT id, name, classID, date, info FROM task JOIN addInfo ON addinfo.taskID=task.id", (err, row) => {
	console.log("joins");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date} ${row.info}`);
  });

  db.each("SELECT id, className, active FROM classes", (err, row) => {
		if (err) console.log(err)
    console.log(`${row.id}: ${row.className} ${row.active}`);
  });


});

db.close();
