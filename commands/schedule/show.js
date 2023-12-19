const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show")
    .setDescription("Show the current tasks")
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
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;

    if (focusedOption.name === "type") {
      choices = ["All", "Assignment", "Quiz"];
    }

    if (focusedOption.name === "class") {
      choices = ["All", "Web", "Database", "Programming", "Windows", "Network"];
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    const db = new sqlite3.Database("database/tasks.db");
    const type = interaction.options.getString("type");
    const className = interaction.options.getString("class");
    const classQuery =
      className == "All" ? "" : `AND t.className='${className}'`;
    const typeQuery = type == "All" ? "" : `AND t.type='${type}'`;
		let typeRes = "Here are your upcoming ";
		switch (type) {
			case "Quiz":
				typeRes += "quizes."
				break;
			case "Assignment":
				typeRes += "assignments."
				break;
			default:
				typeRes += "tasks."
				

		}
    const query = `
SELECT t.id, t.name, t.className, t.date, a.info, t.type
FROM task t
LEFT JOIN addInfo a
ON t.id=a.taskID
WHERE t.date > date('now')
${classQuery}
${typeQuery}
`;

    const remove = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel("Remove Task")
      .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(remove);

    const response = await interaction.reply({
      content: typeRes,
      components: [buttonRow],
    });

    let tasksList = [];
    let select;
    let selectRow;

    db.each(
      query,
      (err, row) => {
        try {
          const replyHead = `
> **__${row.name}__**
> 
> Type: ${row.type}
> Class: ${row.className}
> Due Date: ${row.date}
`;
          const replyBody = `
__Additional Information__

${row.info}
`;
          tasksList.push({ label: row.name, value: row.id.toString() });
          interaction.followUp({
            content: row.info ? replyHead + replyBody : replyHead,
          });
        } catch (e) {
          console.log(e);
          console.log(err);
          interaction.followUp({ content: "Something went wrong." });
        }
      },
      (err) => {
        select = new StringSelectMenuBuilder({
          custom_id: "class menu",
          placeholder: "Choose a task to remove.",
          max_values: 2,
          options: tasksList,
        });

        selectRow = new ActionRowBuilder().addComponents(select);
      }
    );

    const collectorFilter = (i) => i.user.id === interaction.user.id;
    let selectMessage;
    let confirmation;
    try {
      confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });
      if (confirmation.customId === "remove") {
        await confirmation.reply("Loading tasks...");
        selectMessage = await interaction.followUp({
          content: "Select task to remove",
          components: [selectRow],
        });
      }
    } catch (e) {
      console.log("Tasks remove button deleted");
      await interaction.editReply({
        content: "Here are your upcoming quizes",
        components: [],
      });
    }

    const selectFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmSelect = await selectMessage.awaitMessageComponent({
        filter: selectFilter,
        time: 60000,
      });
      if (confirmSelect.customId === "class menu") {
        confirmation.deleteReply();
        db.run(
          `DELETE FROM task WHERE id=?`,
          { 1: parseInt(confirmSelect.values[0]) },
          (err) => {
            !err
              ? confirmSelect.reply("Task removed successfully.")
              : confirmSelect.reply("Error removing task.");
            err && console.log(err);
          }
        );
      }
    } catch (e) {
      await interaction.editReply({
        content: "Here are your upcoming quizes",
        components: [],
      });
    }
  },
};
