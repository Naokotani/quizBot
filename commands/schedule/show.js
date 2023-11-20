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

		const type = interaction.options.getString('type');
		const className = interaction.options.getString('class');

		
		const classQuery = className=='All'?"":`WHERE t.className='${className}'`
		const typeQuery = type=='All'?"":`WHERE t.type='${type}'`

		const query = `
SELECT t.id, t.name, t.className, t.date, a.info
FROM task t
LEFT JOIN addInfo a
ON t.id=a.taskID
${classQuery}
${typeQuery}
`

		await interaction.reply("Here are your upcoming quizes");
		
		db.each(query, (err, row) => {
			if (err) console.log(err)
			const replyHead =
						`
> **__${row.name}__**
> 
> Class: ${row.className}
> Due Date: ${row.date}
`
			const replyBody =
						`
__Additional Information__

${row.info}
`
			interaction.followUp({content: row.info?replyHead + replyBody:replyHead});
		});

		db.close();
	},
};
