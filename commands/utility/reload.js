const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('The category of the command.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setAutocomplete(true)
				.setRequired(true)),
	async autocomplete(interaction) {

		const foldersPath = path.join(__dirname, '../../commands');
		const commandFolders = fs.readdirSync(foldersPath);
		let commandFiles;

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		};

		let trimmedFiles = [];

		for (const file of commandFiles) {
			let split = file.split('.');
			split.pop();
			let finalName = split.join(".");
			trimmedFiles.push(finalName);
		}

		const focusedOption = interaction.options.getFocused(true);

		let choices

		if (focusedOption.name === 'category') {
			choices = commandFolders;
		}

		if (focusedOption.name === 'command') {
			choices = trimmedFiles;
		}


		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		const categoryName = interaction.options.getString('category', true).toLowerCase();
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`../${categoryName}/${command.data.name}.js`)];

		try {
	        interaction.client.commands.delete(command.data.name);
	    const newCommand = require(`../${categoryName}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		} catch (error) {
	        console.error(error);
	        await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};
