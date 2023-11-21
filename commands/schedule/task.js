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
				.setDescription('What day is it due?'))
		.addStringOption(option =>
			option.setName('month')
				.setDescription('What month is it due?')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('year')
				.setDescription('What year is it due?')
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

		const yearString = (inc=0) => {
			let year = new Date().getFullYear();
			year+=inc;
		  return year.toString();
		}

		if (focusedOption.name === 'year') {
			choices = [yearString(),
								 yearString(1),
								 yearString(2),
								 yearString(3),
								 yearString(4)];
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction) {
		const type = interaction.options.getString('type');
		const className = interaction.options.getString('class');
		const day = interaction.options.getInteger('day');
		const month = interaction.options.getString('month');
		const year = interaction.options.getString('year');

			
		const modal = new ModalBuilder()
					.setCustomId('taskModal')
					.setTitle(`Create ${type} for ${month} ${day}, ${year}`);

		const taskInput = new TextInputBuilder()
					.setCustomId('taskName')
					.setLabel(`What is the ${type} name?`)
					.setStyle(TextInputStyle.Short);

		const timeInput = new TextInputBuilder()
					.setCustomId('time')
					.setLabel(`What time is it due? (default: 11:59pm)`)
					.setPlaceholder(`Enter in the same style as "11:59pm"`)
					.setStyle(TextInputStyle.Short)
					.setRequired(false);

		const descriptionInput = new TextInputBuilder()
					.setCustomId('additionalInfo')
					.setLabel(`Description of the ${type}?`)
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder(`Enter any addiontional infotmation about the ${type}`)
					.setRequired(false);


		const firstActionRow = new ActionRowBuilder().addComponents(taskInput);
		const secondActionRow = new ActionRowBuilder().addComponents(timeInput);
		const thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);
		

		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

		await interaction.showModal(modal);

		const filter = (interaction) => interaction.customId === 'taskModal';

		const db = new sqlite3.Database('database/tasks.db');

		interaction.awaitModalSubmit({ filter, time: 60_000 })
			.then(interaction => {
				const userTime = interaction.fields.getTextInputValue('time');
				const taskName = interaction.fields.getTextInputValue('taskName');
				const time = userTime?userTime:"11:59pm"; 

				let date;

		switch (month) {
		case 'January':
			date = `${year}-1-${day} ${time}`;
			break;
  	case 'February':
			date = `${year}-2-${day} ${time}`;
			break;
		case 'March':
			date = `${year}-3-${day} ${time}`;
			break;
		case 'April':
			date = `${year}-4-${day} ${time}`;
			break;
		case 'May':
			date = `${year}-5-${day} ${time}`;
			break;
		case 'June':
			date = `${year}-6-${day} ${time}`;
			break;
		case 'July':
			date = `${year}-7-${day} ${time}`;
			break;
		case 'August':
			date = `${year}-8-${day} ${time}`;
	  	break;
		case 'September':
			date = `${year}-9-${day} ${time}`;
			break;
		case 'October':
			date = `${year}-10-${day} ${time}`;
			break;
		case 'November':
			date = `${year}-11-${day} ${time}`;
			break;
		case 'December':
			date = `${year}-12-${day} ${time}`;
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
			} else {
				console.log('Data Entry Created successfully for' + taskName)
			}
		});
				db.close();

			}).catch(console.error);
	}
};
