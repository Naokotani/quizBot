const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/tasks.db');
//const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
CREATE TABLE task
(id INTEGER PRIMARY KEY, type VARCHAR[6000], name VARCHAR[6000], className VARCHAR[6000], date DATE)`);
  db.run("CREATE TABLE addInfo (taskID INTEGER, type VARCHAR[6000], info VARCHAR[4000])");


	db.run("INSERT INTO task (type, name, className, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Quiz",
		2: "quizzler!",
		3: "Web",
	});

	db.run("INSERT INTO task (type, name, className, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Assignment",
		2: "Cool Assignment",
		3: "network",
	});

	db.run("INSERT INTO task (type, name, className, date) VALUES (?, ?, ?, datetime('now'))", {
		1: "Quiz",
		2: "quiz Time!",
		3: "network",
	});

	db.run("INSERT INTO addInfo VALUES (?, ?, ?)", {
		1: 2,
		2: "Assignment",
		3: "This is a whole buncha text yo",
	});
  db.each("SELECT id, name, className, date FROM task", (err, row) => {
		console.log("task");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date}`);
  });
  db.each("SELECT rowid AS id, type, taskID, info FROM addInfo", (err, row) => {
	console.log("addInfos");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.type} ${row.taskID} ${row.info}`);
  });
	
  db.each("SELECT id, name, className, date, info FROM task JOIN addInfo ON addinfo.taskID=task.id", (err, row) => {
	console.log("joins");
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date} ${row.info}`);
  });


});

db.close();
