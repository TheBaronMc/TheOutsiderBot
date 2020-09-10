function logMessage(message) {
	let date = new Date();
	console.log("new message :");
	console.log("	author   : " + message.author);
	console.log("	bot      : " + message.author.bot);
	console.log("	activity : " + message.activity);
	console.log("	content  : " + message.content); 
	console.log("	channel  : " + message.channel);
	console.log("        date     : " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() );
}

module.exports = { logMessage };