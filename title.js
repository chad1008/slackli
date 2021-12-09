const { App } = require( '@slack/bolt' );
const colors = require( 'colors' );
const fs = require( 'fs' );
const { configPath, verifyConfig } = require( './manageConfig' );

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

// Update user status using emoji and status text
async function setTitle( title ) {
	verifyConfig;
	try {
		const response = await app.client.users.profile.set( {
			token: process.env.SLACK_USER_TOKEN,
			profile: {
				title: title,
			},
		} );
	} catch ( error ) {
		console.error(
			'😢 Slack profile title was not able to be updated:'.red,
			`"${ error.data.error }"\n`.grey
		);
	}
}

module.exports = { setTitle };
