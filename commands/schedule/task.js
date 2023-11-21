const { SlashCommandBuilder,
				ActionRowBuilder,
				ModalBuilder,
				TextInputBuilder,
				TextInputStyle
			} = require('discord.js');

const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('task')
		.setDescription('Create a new scheduling task')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('What type of task?')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('class')
				.setDescription('What class is the task for?')
				.setAutocomplete(true))
		.addIntegerOption(option =>
			option.setName('day')
				.setDescription('Enter a day of the month'))
		.addStringOption(option =>
			option.setName('month')
				.setDescription('Enter a month of the year')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'type') {
			choices = ['Assignment', 'Quiz'];
		}

		if (focusedOption.name === 'class') {
			choices = ['Web', 'Database', 'Programming', 'Windows', 'Network'];
		}

		if (focusedOption.name === 'month') {
			choices = ['January', 'February', 'March', 'April', 'May', 'June',
								 'July', 'August', 'September', 'October', 'November', 'December'];
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction) {
		const type = interaction.options.getString('type');
		const month = interaction.options.getString('month');
		const day = interaction.options.getInteger('day');
		const className = interaction.options.getString('class');

			
		const modal = new ModalBuilder()
					.setCustomId('taskModal')
					.setTitle(`Create ${type} for ${month} ${day}`);

		const taskInput = new TextInputBuilder()
					.setCustomId('taskName')
					.setLabel(`What is the ${type} name?`)
					.setStyle(TextInputStyle.Short);

		const descriptionInput = new TextInputBuilder()
					.setCustomId('additionalInfo')
					.setLabel(`Description of the ${type}?`)
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder(`Enter any addiontional infotmation about the ${type}`)
					.setRequired(false);


		const firstActionRow = new ActionRowBuilder().addComponents(taskInput);
		const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
		

		modal.addComponents(firstActionRow, secondActionRow);


		await interaction.showModal(modal);

		const filter = (interaction) => interaction.customId === 'taskModal';

		const db = new sqlite3.Database('database/tasks.db');

		interaction.awaitModalSubmit({ filter, time: 60_000 })
			.then(interaction => {
				const taskName = interaction.fields.getTextInputValue('taskName');
				console.log('modal was received');
				let date;

		switch (month) {
		case 'January':
			date = `2023-1-${day} 11:59`;
			break;
  	case 'February':
			date = `2023-2-${day} 11:59`;
			break;
		case 'March':
			date = `2023-3-${day} 11:59`;
			break;
		case 'April':
			date = `2023-4-${day} 11:59`;
			break;
		case 'May':
			date = `2023-5-${day} 11:59`;
			break;
		case 'June':
			date = `2023-6-${day} 11:59`;
			break;
		case 'July':
			date = `2023-7-${day} 11:59`;
			break;
		case 'August':
			date = `2023-8-${day} 11:59`;
	  	break;
		case 'September':
			date = `2023-9-${day} 11:59`;
			break;
		case 'October':
			date = `2023-10-${day} 11:59`;
			break;
		case 'November':
			date = `2023-11-${day} 11:59`;
			break;
		case 'December':
			date = `2023-12-${day} 11:59`;
			break;
		}

				interaction.reply(`\n> **__Creating ${taskName}__**\n> \n> **Date:** ${month} ${day}\n> **Type** ${type}\n> **Class:** ${className}`);
				let err;
				db.run(`
INSERT INTO task (type, name, className, date)
VALUES (?, ?, ?, ?)
		`, {
			1: type,
			2: taskName,
			3: className,
			4: date,
		}, (err) => {
			if (err) {
				console.log(err)
				interaction.followUp(err);
			}
		});
				db.close();

			}).catch(console.error);
	}
};
