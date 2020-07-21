// require the discord.js module
const Discord = require('discord.js');
const { prefix, token } = require('./config.json')

// create a new Discord client
const client = new Discord.Client();

// create the void instance
var theVoid;

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
	theVoid = client.channels.resolve('694592050775064749');
});

client.on('guildMemberAdd', member => {
	theVoid.send("Bienvenue dans le grand vide <@" + member.user.id + ">"); // Tag the new user
	theVoid.send("https://tenor.com/view/dishonored-death-of-the-outsider-looking-gaming-video-game-gif-17574995") // A gif of the outsider
});

client.on('message', message => {
	console.log("author : " + message.author);
	console.log("bot : " + message.author.bot);
	console.log("activity : " + message.activity);
	console.log("content : " + message.content); 
});

// login to Discord with your app's token
client.login(token);
