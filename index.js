// require the discord.js module
const Discord = require('discord.js');
const { Tedis, TedisPool } = require("tedis");
const fs = require('fs')
const config = require('./config.json');
const { isNumber } = require('util');
const ytdl = require('ytdl-core');

const tedis = new Tedis({
	port: 6379,
	host: "127.0.0.1"
  });

const discordClient = new Discord.Client(); // create a new Discord client

var theVoid; // create the void instance
var dispatcher; // the jukebox
var connection;



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

discordClient.on('message', async message => {
	logMessage(message);
	//checkSpam(message);

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
	} else if (command === "kick") {
		    // Assuming we mention someone in the message, this will return the user
			// Read more about mentions over at https://discord.js.org/#/docs/main/master/class/MessageMentions
			const user = message.mentions.users.first();
			// If we have a user mentioned
			if (user) {
			// Now we get the member from the user
			const member = message.guild.member(user);
			// If the member is in the guild
			if (member) {
				/**
				 * Kick the member
				 * Make sure you run this on a member, not a user!
				 * There are big differences between a user and a member
				 */
				member
				.kick('Optional reason that will display in the audit logs')
				.then(() => {
					// We let the message author know we were able to kick the person
					message.reply(`Successfully kicked ${user.tag}`);
				})
				.catch(err => {
					// An error happened
					// This is generally due to the bot not being able to kick the member,
					// either due to missing permissions or role hierarchy
					message.reply('I was unable to kick the member');
					// Log the error
					console.error(err);
				});
			} else {
				// The mentioned user isn't in this guild
				message.reply("That user isn't in this guild!");
			}
			// Otherwise, if no user was mentioned
			} else {
			message.reply("You didn't mention the user to kick!");
			}
	} else if (command === "ban") {
		// Assuming we mention someone in the message, this will return the user
		// Read more about mentions over at https://discord.js.org/#/docs/main/master/class/MessageMentions
		const user = message.mentions.users.first();
		// If we have a user mentioned
		if (user) {
		// Now we get the member from the user
		const member = message.guild.member(user);
		// If the member is in the guild
		if (member) {
			/**
			 * Ban the member
			 * Make sure you run this on a member, not a user!
			 * There are big differences between a user and a member
			 * Read more about what ban options there are over at
			 * https://discord.js.org/#/docs/main/master/class/GuildMember?scrollTo=ban
			 */
			member
			.ban({
				reason: 'They were bad!',
			})
			.then(() => {
				// We let the message author know we were able to ban the person
				message.reply(`Successfully banned ${user.tag}`);
			})
			.catch(err => {
				// An error happened
				// This is generally due to the bot not being able to ban the member,
				// either due to missing permissions or role hierarchy
				message.reply('I was unable to ban the member');
				// Log the error
				console.error(err);
			});
		} else {
			// The mentioned user isn't in this guild
			message.reply("That user isn't in this guild!");
		}
		} else {
		// Otherwise, if no user was mentioned
		message.reply("You didn't mention the user to ban!");
		}
	} else if (command === "join") {
		connection = await joinChannel(message);
	} else if (command === "play") {
		connection = await joinChannel(message);
		if (args[0]) {
			if (args[0] == "list") {
				let files = fs.readdirSync("./musics/");
				let answer = "le grand vide contient : \n"
				for (let i = 0; i < files.length; i++) {
					answer = answer + parseInt(i) + ". " + files[i] + "\n";
				}
				console.log("answer" + answer);
				message.channel.send(answer.slice(0, (answer.length - 1)));
			} else if (args[0] == "stop") {
				dispatcher.destroy();
			} else if (args[0] == "-y") {
				if (args[1]) {
					try {
						dispatcher = connection.play(ytdl(args[1], { filter: 'audioonly' }));
					} catch (error) {
						message.reply("une erreur est survenue");
					}
				} else {
					message.reply("vous avez besoin de préciser une URL");
				}
			} else if (isNumber(parseInt(args[0]))) {
				let files = fs.readdirSync("./musics/");
				dispatcher = connection.play(("./musics/" + files[parseInt(args[0])]))
			} else {
				message.reply("Bad argument")
			}
		} else {
			message.reply("This command needs an argument")
		}
	}
});

async function joinChannel(message) {
	// Only try to join the sender's voice channel if they are in one themselves
	if (message.member.voice.channel) {
		var connection = await message.member.voice.channel.join();
		} else {
		message.reply('You need to join a voice channel first!');
		}
	return connection
}

async function checkSpam(message) {
	if (message.author.bot) { return; }
	console.log("La clef : " + (message.channel + ":" + message.author));
	if ( await tedis.exists( (message.channel + ":" + message.author) )) {
		console.log("La clef existe déjà");
		let value = await tedis.get((message.channel + ":" + message.author));
		if (parseInt(value) == 5 ) {
			console.log("Kick user");
			message.channel.send( "kick de <@" + message.author + ">" )
			message.delete();
			console.log("Incrémentation de la clef");
			await tedis.incr((message.channel + ":" + message.author), parseInt(value) + 1 );
		} else if (parseInt(value) == 4 ) {
			message.delete();
			console.log("Incrémentation de la clef");
			await tedis.incr((message.channel + ":" + message.author), parseInt(value) + 1 );
		} else if (parseInt(value) == 3 ) {
			console.log("Envoie message de spam");
			message.reply("Tu as utilisé tes pouvoirs trop de fois ! Attend un peu ...")
			message.delete();
			console.log("Incrémentation de la clef");
			await tedis.incr((message.channel + ":" + message.author), parseInt(value) + 1 );
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

