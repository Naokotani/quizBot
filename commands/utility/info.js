const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const { help } = require("../../utilityModules/help");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Provides information about Quizbot.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("What type of command would you like?")
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;

    if (focusedOption.name === "command") {
      choices = ["show", "task", "class", "next"];
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    const command = interaction.options.getString("command");

    const select = new StringSelectMenuBuilder({
      custom_id: "commands",
      placeholder: "Choose a command to view.",
      max_values: 2,
      options: [
        { label: "show", value: "show" },
        { label: "task", value: "task" },
        { label: "class", value: "class" },
        { label: "next", value: "next" },
      ],
    });

    const selectRow = new ActionRowBuilder().addComponents(select);

    let response;

    if (!command) {
      response = await interaction.reply({
        content: help("overview"),
        components: [selectRow],
      });
    } else {
      response = await interaction.reply({
        content: help(command),
      });
    }

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    let confirmation;
    try {
      confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });
      if (confirmation.customId === "commands") {
        response = confirmation.reply({
          content: help(confirmation.values[0]),
        });
        console.log(confirmation);
			}
    } catch (e) {
      console.log(e);
    }
  },
};
