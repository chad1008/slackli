const { App } = require( '@slack/bolt' );
const { getUserConfig } = require( './manageConfig' );

async function getCreds( workspace ) {
	const userConfig = await getUserConfig();
	const targetWorkspace = workspace
		? workspace
		: userConfig.workspaces.default;
	return {
		token: userConfig.workspaces[ targetWorkspace ].userToken,
		secret: userConfig.workspaces[ targetWorkspace ].signingSecret,
	};
}

async function appSetup( creds ) {
	return new App( {
		token: creds.token,
		signingSecret: creds.secret,
	} );
}

async function getUserId( workspace, userName ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	let userCursor = '';
	let userBatchCounter = 1;
	const userConfig = await getUserConfig();
	const limit = 500;

	do {
		// Initial in-progress message on the fourth batch
		if ( userConfig.findConversationProgress === true ) {
			if ( userBatchCounter === 4 ) {
				console.log(
					`[${
						userBatchCounter / 4
					}] Searching for users named ${ userName }. This might take a while on larger teams...`
				);
			}
			// Follow-up in-progress message every fourth batch
			if ( userBatchCounter > 4 && userBatchCounter % 4 === 0 ) {
				console.log(
					`[${
						userBatchCounter / 4
					}] Still looking for ${ userName }. There are a lot of users here...`
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
				if ( user.name === userName ) {
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
	// If we haven't yet returned a user ID, return null
	return null;
}

module.exports = { getCreds, appSetup, getUserId };
