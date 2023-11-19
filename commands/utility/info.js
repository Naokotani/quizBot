const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information about the user.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),

	async execute(interaction) {
	const command =  interaction.options.getSubcommand();
		if (command === 'user') {
			await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
		} else if (command === 'server') {
			await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		}
	},
};
