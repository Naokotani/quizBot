const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database/tasks.db");

db.each("SELECT * FROM task", (err, row) => {
	console.log(row);
})

db.each("SELECT * FROM classes", (err, row) => {
	console.log(row);
})

db.each("SELECT * FROM addInfo", (err, row) => {
	console.log(row);
})
