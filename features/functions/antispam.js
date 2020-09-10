const { Tedis, TedisPool } = require("tedis");

async function checkSpam(message) {
	if (message.author.bot) { return; }

	var tedis;

	if (tedis == null) {
		try {
			tedis = new Tedis({
				port: 6379,
				host: "127.0.0.1"
			  })
		} catch (error) {
			console.log("Impossible de se connecter à Redis");
			return
		}
	}

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


module.exports = { checkSpam };