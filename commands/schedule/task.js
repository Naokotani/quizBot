const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { getChoices } = require("../../utilityModules/utility");
const sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("task")
    .setDescription("Create a new scheduling task")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("What type of task?")
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("class")
        .setDescription("What class is the task for?")
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option.setName("day").setDescription("What day is it due?")
    )
    .addStringOption((option) =>
      option
        .setName("month")
        .setDescription("What month is it due?")
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("year")
        .setDescription("What year is it due?")
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;

    if (focusedOption.name === "type") {
      choices = ["Assignment", "Quiz"];
    }

		const classChoices = await getChoices();
		let classArray = [];
		classChoices.forEach( i => classArray.push(i.className));
    if (focusedOption.name === "class") {
      choices = classArray;
    }

    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const d = new Date();
    let monthName = month[d.getMonth()];
    const endMonth = month.slice(month.indexOf(monthName));
    const startMonth = month.slice(0, month.indexOf(monthName));
    const defMonth = endMonth.concat(startMonth);

    if (focusedOption.name === "month") {
      choices = defMonth;
    }

    const yearString = (inc = 0) => {
      let year = new Date().getFullYear();
      year += inc;
      return year.toString();
    };

    if (focusedOption.name === "year") {
      choices = [
        yearString(),
        yearString(1),
        yearString(2),
        yearString(3),
        yearString(4),
      ];
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const className = interaction.options.getString("class");
    const day = interaction.options.getInteger("day");
    const month = interaction.options.getString("month");
    const year = interaction.options.getString("year");
    const classArray = await getChoices();
    let classID = false;
    for (i in classArray) {
      if ((classArray[i].className = className)) {
        classID = classArray[i].id;
        break;
      }
    }

    const modal = new ModalBuilder()
      .setCustomId("taskModal")
      .setTitle(`Create ${type} for ${month} ${day}, ${year}`);

    const taskInput = new TextInputBuilder()
      .setCustomId("taskName")
      .setLabel(`What is the ${type} name?`)
      .setStyle(TextInputStyle.Short);

    const timeInput = new TextInputBuilder()
      .setCustomId("time")
      .setLabel(`What time is it due? (default: 11:59pm)`)
      .setPlaceholder(`Enter in the same style as "11:59pm"`)
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("additionalInfo")
      .setLabel(`Description of the ${type}?`)
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(`Enter any addiontional infotmation about the ${type}`)
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(taskInput);
    const secondActionRow = new ActionRowBuilder().addComponents(timeInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(
      descriptionInput
    );

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);

    const filter = (interaction) => interaction.customId === "taskModal";
    const db = new sqlite3.Database("database/tasks.db");

    interaction
      .awaitModalSubmit({ filter, time: 60_000 })
      .then((interaction) => {
        const userTime = interaction.fields.getTextInputValue("time");
        const addInfo = interaction.fields.getTextInputValue("additionalInfo");
        const taskName = interaction.fields.getTextInputValue("taskName");
        const time = userTime ? userTime : "11:59pm";
        const yearTest = new Date().getFullYear() - year;
        let date;

        if (
          yearTest < 1 &&
          yearTest > -6 &&
          /^(0[1-9]|1[0-2]):[0-5][0-9](am|pm|AM|PM)$/i.test(time)
        ) {
          switch (month) {
            case "January":
              date = day < 32 ? `${year}-1-${day} ${time}` : "";
              break;
            case "February":
              date = day < 30 ? `${year}-2-${day} ${time}` : "";
              break;
            case "March":
              date = day < 32 ? `${year}-3-${day} ${time}` : "";
              break;
            case "April":
              date = day < 31 ? `${year}-4-${day} ${time}` : "";
              break;
            case "May":
              date = day < 32 ? `${year}-5-${day} ${time}` : "";
              break;
            case "June":
              date = day < 31 ? `${year}-6-${day} ${time}` : "";
              break;
            case "July":
              date = day < 32 ? `${year}-7-${day} ${time}` : "";
              break;
            case "August":
              date = day < 32 ? `${year}-8-${day} ${time}` : "";
              break;
            case "September":
              date = day < 31 ? `${year}-9-${day} ${time}` : "";
              break;
            case "October":
              date = day < 32 ? `${year}-10-${day} ${time}` : "";
              break;
            case "November":
              date = day < 31 ? `${year}-11-${day} ${time}` : "";
              break;
            case "December":
              date = day < 32 ? `${year}-12-${day} ${time}` : "";
              break;
            default:
              date = false;
          }
        } else {
          date = false;
        }

        if (date && classID) {
          interaction.reply(
            `\n> **__Creating ${taskName}__**\n> \n> **Date:** ${month} ${day}\n> **Type** ${type}\n> **Class:** ${className}`
          );
          db.run(
            `
INSERT INTO task (type, name, classID, date)
VALUES (?, ?, ?, ?);
		`,
            {
              1: type,
              2: taskName,
              3: classID,
              4: date,
            },
            (err) => {
              if (err) {
                console.log(err);
                interaction.followUp("Something went wrong.");
              } else {
                console.log("Data Entry Created successfully for " + taskName);

                db.get(
                  `
SELECT LAST_INSERT_ROWID() as id FROM task;
		`,
                  (err, row) => {
                    if (err) {
                      console.log(err);
                      interaction.followUp("Something went wrong.");
                    } else {
                      console.log(row);
                      db.run(
                        "INSERT INTO addInfo (taskID, type, info) VAlUES(?, ?, ?)",
                        { 1: row.id, 2: type, 3: addInfo }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          !date & classID && interaction.reply("Invalid date.");
          !date & !classID && interaction.reply("Invalid date and class name.");
          date & !classID && interaction.reply("Invalid class name");
        }
        db.close();
      });
  },
};
