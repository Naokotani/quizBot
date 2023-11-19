const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether or not the echo should be ephemeral')
				.setRequired(true)
		),
	async execute(interaction) {
		const reply = interaction.options.getString('input', true).toLowerCase();
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(ephemeral);
		if (ephemeral === true) {
			await interaction.reply({content: reply, ephemeral: true});
		} else {
			await interaction.reply(reply);
		}
	},
};
