const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/tasks.db');

db.serialize(() => {
  db.run("CREATE TABLE quiz (id INTEGER, name VARCHAR[6000], className VARCHAR[6000], date DATE)");
  db.run("CREATE TABLE assignment (id INTEGER, name VARCHAR[6000], className VARCHAR[6000], date DATE)");
  db.run("CREATE TABLE addInfo (taskID INTEGER, type VARCHAR[6000], info VARCHAR[4000])");

	db.run("INSERT INTO quiz VALUES (?, ?, ?, datetime('now'))", {
		1: 1,
		2: "Nasty Assignment",
		3: "Web",
	});

	db.run("INSERT INTO assignment VALUES (?, ?, ?, datetime('now'))", {
		1: 1,
		2: "quizzler!",
		3: "Web",
	});

	db.run("INSERT INTO addInfo VALUES (?, ?, ?)", {
		1: 1,
		2: "Assignment",
		3: "This is a whole buncha text yo",
	});

  db.each("SELECT id, name, className, date FROM assignment", (err, row) => {
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date}`);
  });

  db.each("SELECT id, name, className, date FROM quiz", (err, row) => {
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date}`);
  });

  db.each("SELECT rowid AS id, type, taskID, info FROM addInfo", (err, row) => {
		if (err) console.log(err)
    console.log(`${row.id}: ${row.type} ${row.taskID} ${row.info}`);
  });

  db.each("SELECT id, name, className, date, info FROM assignment JOIN addInfo ON addinfo.taskID=assignment.id", (err, row) => {
		if (err) console.log(err)
    console.log(`${row.id}: ${row.name} ${row.className} ${row.date} ${row.info}`);
  });


});

db.close();
