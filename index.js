// require the discord.js module
const Discord = require('discord.js');
const { Tedis, TedisPool } = require("tedis");
const config = require('./config.json')

const tedis = new Tedis({
	port: 6379,
	host: "127.0.0.1"
  });

const discordClient = new Discord.Client(); // create a new Discord client

// create the void instance
var theVoid;

// when the client is ready, run this code
// this event will only trigger one time after logging in
discordClient.once('ready', () => {
	console.log('Ready!');
	theVoid = discordClient.channels.resolve('694592050775064749');
});

discordClient.on('guildMemberAdd', member => {
	theVoid.send("Bienvenue dans le grand vide <@" + member.user.id + ">"); // Tag the new user
	theVoid.send("https://tenor.com/view/dishonored-death-of-the-outsider-looking-gaming-video-game-gif-17574995") // A gif of the outsider
});

discordClient.on('guildMemberRemove', member => {
	theVoid.send("Cours-tu après quelque chose, <@" + member.user.id + "> ? Ou prends-tu la fuite ?"); // Tag the new user
	theVoid.send("https://media.giphy.com/media/xT39DiEPkiN6tO7Oow/giphy.gif")
});

discordClient.on('message', message => {
	logMessage(message);
	checkSpam(message);

	// COMMAND HANDLER
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	if (command === 'clear') {
		if (message.author.id != config.owner) {
			return message.send("<@" + message.author.id + "> tu ne peux pas utiliser cette commande")
		}

		const amount = parseInt(args[0]);
	
		if (isNaN(amount)) {
			return message.reply('Tu n\'a pas rentré un nombre valide');
		} else if (amount < 2 || amount > 100) {
			return message.reply('Tu dois rentrer un nombre entre 2 et 100');
		}
	
		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			message.channel.send('ERROR');
		});
	}
});

async function checkSpam(message) {
	if (message.author.bot) { return; }
	console.log("La clef : " + (message.channel + ":" + message.author));
	if ( await tedis.exists( (message.channel + ":" + message.author) )) {
		console.log("La clef existe déjà");
		let value = await tedis.get((message.channel + ":" + message.author));
	    if (parseInt(value) >= 3 ) {
			console.log("Envoie message de spamm");
			message.channel.send( "<@" + message.author + ">" + "Arrête de spam le grand vide :")
			message.delete();
		} else {
			console.log("Incrémentation de la clef");
			await tedis.incr((message.channel + ":" + message.author), parseInt(value) + 1 );
		}
	} else {
		console.log("Création de la clef");
		await tedis.set((message.channel + ":" + message.author), "1");
		await tedis.expire((message.channel + ":" + message.author), 60)
	}
}

function logMessage(message) {
	/*
	let date = new Date();
	console.log("new message :");
	console.log("	author   : " + message.author);
	console.log("	bot      : " + message.author.bot);
	console.log("	activity : " + message.activity);
	console.log("	content  : " + message.content); 
	console.log("	channel  : " + message.channel);
	console.log("        date     : " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() );
	*/
}

// login to Discord with your app's token
discordClient.login(config.token);

