const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show the current tasks')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('What type of task?')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('class')
				.setDescription('What class is the task for?')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'type') {
			choices = ['All', 'Assignment', 'Quiz'];
		}

		if (focusedOption.name === 'class') {
			choices = ['All', 'Web', 'Database', 'Programming', 'Windows', 'Network'];
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction) {
		const type = interaction.options.getString('type');
		const className = interaction.options.getString('class');
		await interaction.reply({content: `You are viewing ${type} tasks for ${className}.`, ephemeral: true});
	},

};
