const { getCreds, appSetup } = require( './utils' );
const { getUserConfig } = require( './manageConfig' );

// Retrieve the unique ID of the requested contersation
async function findConversation( workspace, conversationName ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	let conversationId = null;
	const limit = 500;
	const userConfig = await getUserConfig();

	// Look for a channel with the name requested, limited to channels the user is already a member of
	let channelCursor = '';
	do {
		try {
			const channelList = await app.client.users.conversations( {
				token: creds.token,
				types: 'public_channel, private_channel',
				cursor: channelCursor,
				limit: limit,
				exclude_archived: true,
			} );
			for ( const channel of channelList.channels ) {
				if ( channel.name === conversationName ) {
					conversationId = channel.id;
					return conversationId;
				}
			}
			channelCursor =
				channelList.response_metadata.next_cursor !== ''
					? channelList.response_metadata.next_cursor
					: '';
		} catch ( error ) {
			console.error( error );
		}
	} while ( channelCursor !== '' );
	// Since we didn't return a matching channel, search for matching usernames
	let userCursor = '';
	let userBatchCounter = 1;
	do {
		// Initial in-progress message on the fourth batch
		if ( userConfig.findConversationProgress === true ) {
			if ( userBatchCounter === 4 ) {
				console.log(
					`[${
						userBatchCounter / 4
					}] Searching for users named ${ conversationName }. This might take a while on larger teams...`
				);
			}
			// Follow-up in-progress message every fourth batch
			if ( userBatchCounter > 4 && userBatchCounter % 4 === 0 ) {
				console.log(
					`[${
						userBatchCounter / 4
					}] Still looking for ${ conversationName }. There are a lot of users here...`
				);
			}
		}

		try {
			const userList = await app.client.users.list( {
				token: creds.token,
				cursor: userCursor,
				limit: limit,
			} );
			for ( const user of userList.members ) {
				if ( user.name === conversationName ) {
					conversationId = user.id;
					return conversationId;
				}
			}
			userCursor =
				userList.response_metadata.next_cursor !== ''
					? userList.response_metadata.next_cursor
					: '';
			userBatchCounter++;
		} catch ( error ) {
			console.error( error );
		}
	} while ( userCursor !== '' );
	if ( conversationId === null ) {
		// If conversationID is still null, output an error
		console.log(
			`Sorry, I can't find a user or channel named ${ conversationName }`
				.red
		);
	}
}

// Post a message to a channel your app is in using ID and message text
async function sendMessage( workspace, recipient, text ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	const conversationId = await findConversation( workspace, recipient );
	try {
		await app.client.chat.postMessage( {
			token: creds.token,
			channel: conversationId,
			text: text,
		} );
	} catch ( error ) {
		console.error( 'ERROR: ', error.data.error );
	}
}

module.exports = { findConversation, sendMessage };
