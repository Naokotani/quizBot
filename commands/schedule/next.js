const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('next')
		.setDescription('Show the next upcoming task.')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('What type of task?')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'type') {
			choices = ['All', 'Assignment', 'Quiz'];
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction) {
		const db = new sqlite3.Database('database/tasks.db');
		const type = interaction.options.getString('type');
		const typeQuery = type=='All'?"":`WHERE t.type='${type}'`
		const query = `
SELECT t.id, t.name, t.className, t.date, a.info
FROM task t
LEFT JOIN addInfo a
ON t.id=a.taskID
WHERE t.date > date('now')
${typeQuery}
ORDER BY t.date ASC
LIMIT 1
`

		await interaction.reply("Here is your next task.");
		
		db.get(query, (err, row) => {
			try {
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
				
			} catch (e) {
			interaction.followUp({content: "Something went wrong!"});
			}
		});

		db.close();
	},
};
