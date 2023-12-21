const {
  SlashCommandBuilder,
  roleMention,
  PermissionsBitField,
} = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("class")
    .setDescription("Commands to manage classses")
    .addSubcommand((subcommand) =>
      subcommand.setName("show").setDescription("Show the class list")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Toggle the status of a class")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("What is the ID of the class to be changed")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a class from the list")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("What is the ID of the class to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a class to the class list")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("What is the class name to add?")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const db = new sqlite3.Database("database/tasks.db");
    const type = interaction.options.getSubcommand();
    const id = interaction.options.getString("id");
    let reply;

    if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      switch (type) {
        case "add":
          await interaction.reply("Adding new class.");
          add();
          break;
        case "show":
          await interaction.reply("Here is your class list!");
          show();
          break;
        case "status":
          await interaction.reply(`Updating Status of ${id}`);
          status();
          break;
        case "remove":
          await interaction.reply(`Removing ${id} from the list`);
          remove();
          break;
      }
    } else {
      interaction.reply("This command requires Admin priviledges");
    }

    function add() {
      const className = interaction.options.getString("name");

      db.run(
        "INSERT INTO classes (className, active) VALUES (?, ?)",
        {
          1: className,
          2: 1,
        },
        (err) => {
          err
            ? console.error(err)
            : console.log(className + " Successfully Created");
          interaction.followUp(
            err
              ? "Failed to create " + className
              : className + " created successfully"
          );
        }
      );
    }

    function show() {
      db.each("SELECT id, className, active FROM classes", (err, row) => {
        try {
          const active = row.active ? "Active" : "Inactive";
          err
            ? interaction.followUp("failed to retrieve from DB")
            : interaction.followUp(`
Name: ${row.className}
ID: ${row.id}
Status: ${active}`);
        } catch (e) {
          console.log(e);
          console.log(err);
        }
      });
    }

    function status() {
      db.run(
        `
UPDATE classes
SET active = NOT active
WHERE id = ?`,
        { 1: id },
        (err) => {
          err
            ? console.error(err)
            : console.log("Status successfully changed for " + id);
          err
            ? interaction.followUp("Error changing status of " + id)
            : interaction.followUp("Status successfully changed for " + id);
        }
      );
    }

    function remove() {
      db.run(`DELETE FROM classes WHERE id=?`, { 1: id }, (err) => {
				if (err) {
					interaction.followUp("Error removing " + id)
					console.error(err);
				} else {
					db.run("DELETE FROM task WHERE classID=?", {1: id}, (err) => {
						if(err) {
							interaction.followUp("Error removing " + id)
							console.log(err)
						} else {
							interaction.followUp("Class and tasks successfully removed: " + id);
						}
					})
				}
      });
    }

    db.close();
  },
};
