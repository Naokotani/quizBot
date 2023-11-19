const { REST, Routes } = require('discord.js');
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.CLIENT_TOKEN;

const rest = new REST().setToken(token);


const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter Command ID: ', commandId => {
	rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
		.then(() => console.log('Successfully deleted guild command'))
		.catch(console.error);

	rest.delete(Routes.applicationCommand(clientId, commandId))
		.then(() => console.log('Successfully deleted application command'))
		.catch(console.error);

  readline.close();
});
