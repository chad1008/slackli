const { App } = require( '@slack/bolt' );
const parseExpiration = require( './status').parseExpiration;

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

async function setDND( expiration = '30 minutes') {
	const now = Math.floor(new Date().getTime() / 1000);
	const duration = Math.floor((parseExpiration(expiration) - now)/60);

	const response = await app.client.dnd.setSnooze( {
		token: process.env.SLACK_USER_TOKEN,
		num_minutes: duration,
	} );
}

module.exports = { setDND };
