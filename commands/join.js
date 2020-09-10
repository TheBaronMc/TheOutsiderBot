async function execute(message) {
	// Only try to join the sender's voice channel if they are in one themselves
	if (message.member.voice.channel) {
		var connection = await message.member.voice.channel.join();
		} else {
		message.reply('You need to join a voice channel first!');
		}
	return connection
}

module.exports = {
	name: 'join',
	description: 'the bot your channel',
	execute
};