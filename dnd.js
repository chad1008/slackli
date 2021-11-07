const { App } = require( '@slack/bolt' );

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

async function setDND( expiration = 30 ) {
	const response = await app.client.dnd.setSnooze( {
		token: process.env.SLACK_USER_TOKEN,
		num_minutes: expiration,
	} );
}

module.exports = { setDND };
