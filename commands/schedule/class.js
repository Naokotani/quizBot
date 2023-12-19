const { SlashCommandBuilder } = require("discord.js");
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

    await interaction.reply(await reply("reply"));
    reply("edit");

    async function reply(type) {
      if (interaction.options.getSubcommand() === "add") {
        return add(type);
      } else if (interaction.options.getSubcommand() === "show") {
        return show(type);
      } else if (interaction.options.getSubcommand() === "status") {
        return status(type);
      } else if (interaction.options.getSubcommand() === "remove") {
        return remove(type);
      }
    }

    function add(type) {
      if (type === "reply") {
        return "Adding new class.";
      } else if (type === "edit") {
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
            interaction.editReply(
              err
                ? "Failed to create " + className
                : className + " created successfully"
            );
          }
        );
      }
    }

    function show(type) {
      if (type == "reply") {
        return "Here is your class list!";
      } else if (type === "edit") {
        db.each("SELECT id, className, active FROM classes", (err, row) => {
          try {
            const active = row.active ? "Active" : "Inactive";
            err
              ? interaction.editReply("failed to retrieve from DB")
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
    }

    function status(type) {
      const id = interaction.options.getString("id");
      if (type === "reply") {
        return `Updating Status of ${id}`;
      } else if (type === "edit") {
        db.run(
          `
UPDATE classes
SET active = NOT active
WHERE id = ?`, {1: id},
          (err) => {
            err
              ? console.error(err)
              : console.log("Status successfully changed for " + id);
            err
              ? interaction.editReply("Error changing status of " + id)
              : interaction.editReply("Status successfully changed for " + id);
          }
        );
      }
    }

    function remove(type) {
      const id = interaction.options.getString("id");
      if (type === "reply") {
        return `Removing ${id} from the list`;
      } else if (type === "edit") {
        const id = interaction.options.getString("id");
        db.run(`DELETE FROM classes WHERE id=?`, { 1: id }, (err) => {
          err ? console.error(err) : console.log("Successfully removed" + id);
          err
            ? interaction.editReply("Error removing " + id)
            : interaction.editReply("Status successfully removed " + id);
        });
      }
    }

    db.close();
  },
};
