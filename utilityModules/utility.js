const sqlite3 = require("sqlite3").verbose();

const getChoices = async () => {
  return new Promise((resolve, reject) => {
    let classChoices = [];
    const db = new sqlite3.Database("database/tasks.db");
    let err;
    db.each(
      `
SELECT id, className FROM classes
WHERE active = 1
`,
      (e, row) => {
        err = e;
        classChoices.push({className: row.className, id: row.id});
      },
      (e) => {
        err += e;
        if (!err) {
          resolve(classChoices);
        } else {
          reject(() => console.log(err));
        }
      }
    );
  });
}

exports.getChoices = getChoices;
