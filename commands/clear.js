module.exports = {
	name: 'clear',
	description: 'clear the latest messages of the channel',
	execute(client, message, args) {
		var amount = parseInt(args[0]);
	
		if (isNaN(amount)) {
			return message.reply('Tu n\'a pas rentré un nombre valide');
		} else if (amount < 2 || amount > 100) {
			return message.reply('Tu dois rentrer un nombre entre 2 et 100');
		}
	
		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			message.channel.send('ERROR');
		});
	},
};