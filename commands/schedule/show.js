const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

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

		const db = new sqlite3.Database('database/tasks.db');

		
		db.each("SELECT id, name, className, date, info FROM assignment JOIN addInfo ON addinfo.taskID=assignment.id", (err, row) => {
			if (err) console.log(err)
			console.log(`${row.id}: ${row.name} ${row.className} ${row.date} ${row.info}`);
			const replyHead =
						`
> **__${row.name}__**
> class: ${row.className}
> Due Date: ${row.date}
`
			const replyBody =
						`
__Additional Information__

${row.info}
`
			interaction.reply({content: row.info?replyHead + replyBody:replyHead});
		});

		db.close();
	},
};
