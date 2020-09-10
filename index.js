// require the discord.js module
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const { isNumber } = require('util');
const ytdl = require('ytdl-core');

const discordClient = new Discord.Client(); // create a new Discord client

// features
const log = require('./features/functions/log.js');
const antispam = require('./features/functions/antispam.js');

var theVoid; // create the void instance
var dispatcher; // the jukebox
var connection; // channel connection

discordClient.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	discordClient.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
discordClient.once('ready', () => {
	console.log('Ready!');
	theVoid = discordClient.channels.resolve(config.voidId);
});

if (config.features.messages) {
	discordClient.on('guildMemberAdd', member => {
		theVoid.send("Bienvenue dans le grand vide <@" + member.user.id + ">"); // Tag the new user
		theVoid.send(config.outsider.helloGif) 
	});
	
	discordClient.on('guildMemberRemove', member => {
		theVoid.send("Cours-tu après quelque chose, <@" + member.user.id + "> ? Ou prends-tu la fuite ?"); // Tag the new user
		theVoid.send(config.outsider.goodByeGif)
	});
}

discordClient.on('message', async message => {
	// LOGS
	if (config.features.log) {
		log.logMessage(message);
	}

	// ANTISPAM
	if (config.features.antispam) {
		antispam.checkSpam(message);
	}

	// COMMAND HANDLER
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).trim().split(' ');
	const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    // Get the command
    let command = discordClient.commands.get(cmd);
    // If none is found, try to find it by alias
    if (!command) command = discordClient.commands.get(discordClient.aliases.get(cmd));

	// If a command is finally found, run the command
	if ((["join", "play"].includes(cmd)) & config.features.jukebox) {
		if (cmd == "join") {
			connection = await command.execute(message);
		} else if (cmd == "play") {
			dispatcher = await command.execute(message, connection, dispatcher, args)
		}
	} else if (command) 
		command.execute(discordClient, message, args);
		
/** 
	if (command === "join") {
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
	 */ 
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

// login to Discord with your app's token
discordClient.login(config.token);

