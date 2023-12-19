const { SlashCommandBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("next")
    .setDescription("Show the next upcoming task.")
    .addStringOption((option) =>
      option.setName("limit").setDescription("How many to show?")
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("What type of task?")
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("class")
        .setDescription("What class?")
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;

    if (focusedOption.name === "type") {
      choices = ["Assignment", "Quiz"];
    }

    async function getChoices() {
      return new Promise((resolve, reject) => {
        let classChoices = [];
        const db = new sqlite3.Database("database/tasks.db");
        let err;
        db.each(
          `
SELECT className FROM classes
WHERE active = 1
`,
          (e, row) => {
            err = e;
            classChoices.push(row.className);
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

    const classChoices = await getChoices();
    if (focusedOption.name === "class") {
      choices = classChoices;
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    async function getChoices() {
      return new Promise((resolve, reject) => {
        let classChoices = [];
        const db = new sqlite3.Database("database/tasks.db");
        let err;
        db.each(
          `
SELECT className FROM classes
WHERE active = 1
`,
          (e, row) => {
            err = e;
            classChoices.push(row.className);
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

    const db = new sqlite3.Database("database/tasks.db");
    const types = ["Assignment", "Quiz"];
    const classes = ["Web", "Database", "Programming", "Windows", "Network"];
    const getType = interaction.options.getString("type");
    const getClass = interaction.options.getString("class");
    const getLimit = parseInt(interaction.options.getString("limit"));
    const typeQuery = types.includes(getType)
      ? `AND t.type = '${getType}'`
      : "";
		const choices = await getChoices();
    const classQuery = (choices.includes(getClass))
      ? `AND t.className = '${getClass}'`
      : "";
    const limit = (getLimit > 1) & (getLimit < 20) ? getLimit : 1;
    const query = `
SELECT t.id, t.name, t.className, t.date, a.info
FROM task t
LEFT JOIN addInfo a
ON t.id=a.taskID
WHERE t.date > date('now')
${typeQuery}
${classQuery}
ORDER BY t.date ASC
LIMIT ?
`;
    await interaction.reply("Here is your next task.");

    db.each(query, { 1: limit }, (err, row) => {
      try {
        if (err) console.log(err);
        const replyHead = `
> **__${row.name}__**
> 
> Class: ${row.className}
> Due Date: ${row.date}
`;
        const replyBody = `
__Additional Information__

${row.info}
`;
        interaction.followUp({
          content: row.info ? replyHead + replyBody : replyHead,
        });
      } catch (e) {
        interaction.followUp({ content: "Something went wrong!" });
      }
    });

    db.close();
  },
};
