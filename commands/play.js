const channelConnection = require("./join.js");
const fs = require('fs');

async function execute(message, connection, dispatcher, args) {
	if (!connection) {
		connection = await channelConnection.execute(message);
	}
	console.log(args);
	/*
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
						return connection.play(ytdl(args[1], { filter: 'audioonly' }));
					} catch (error) {
						message.reply("une erreur est survenue");
					}
				} else {
					message.reply("vous avez besoin de préciser une URL");
				}
			} else if (isNumber(parseInt(args[0]))) {
				let files = fs.readdirSync("./musics/");
				return connection.play(("./musics/" + files[parseInt(args[0])]))
			} else {
				message.reply("Bad argument")
			}
		} else {
			message.reply("This command needs an argument")
		}
		*/
}

module.exports = {
	name: 'join',
	description: 'the bot your channel',
	execute
};