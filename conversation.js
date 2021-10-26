// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require( '@slack/bolt' );

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

// Retrieve the unique ID of the requested contersation
async function findConversation( conversationName ) {
	let conversationId = null;
	// Look for a user with name requested
	try {
		const userList = await app.client.users.list( {
			token: process.env.SLACK_USER_TOKEN,
		} );
		for ( const user of userList.members ) {
			if ( user.name === conversationName ) {
				conversationId = user.id;

				return conversationId;
			}
		}
	} catch ( error ) {
		console.error( error );
	}
	// Since we haven't returned a user, look for a matching channel
	try {
		const channelList = await app.client.conversations.list( {
			token: process.env.SLACK_USER_TOKEN,
		} );
		for ( const channel of channelList.channels ) {
			if ( channel.name === conversationName ) {
				conversationId = channel.id;

				return conversationId;
			}
		}
	} catch ( error ) {
		console.error( error );
	}
	// If conversationID is still null, output an error
	if ( conversationId === null ) {
		console.log(
			`Sorry, I can't find a user or channel named ${ conversationName }`
				.red
		);
	}
}

// Post a message to a channel your app is in using ID and message text
async function sendMessage( command ) {
	const conversationId = await findConversation( command.recipient );
	try {
		await app.client.chat.postMessage( {
			token: process.env.SLACK_USER_TOKEN,
			channel: conversationId,
			text: command.text,
		} );
	} catch ( error ) {
		console.error( 'ERROR: ', error.data.error );
	}
}

module.exports = { findConversation, sendMessage };
