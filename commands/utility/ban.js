const { ButtonBuilder,
				ButtonStyle,
				StringSelectMenuBuilder,
				StringSelectMenuOptionBuilder,
				ActionRowBuilder,
				SlashCommandBuilder,
				PermissionFlagsBits
			} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);
		
		const select = new StringSelectMenuBuilder()
					.setCustomId('starter')
					.setPlaceholder('Make a selection!')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Bulbasaur')
							.setDescription('The dual-type Grass/Poison Seed Pokémon.')
							.setValue('bulbasaur'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Charmander')
							.setDescription('The Fire-type Lizard Pokémon.')
							.setValue('charmander'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Squirtle')
							.setDescription('The Water-type Tiny Turtle Pokémon.')
							.setValue('squirtle'),
			);

		const selectRow = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
			components: [row, selectRow],
		});

		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
			
			if (confirmation.customId === 'confirm') {
				//await interaction.guild.members.ban(target);
				await confirmation.update({ content: `${target.username} has been banned for reason: ${reason}`, components: [] });
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({ content: 'Action cancelled', components: [] });
			}
		} catch (e) {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
	},
};
