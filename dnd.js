const { App } = require( '@slack/bolt' );
const parseExpiration = require( './status' ).parseExpiration;

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

async function setDND( expiration = '' ) {
	const now = Math.floor( new Date().getTime() / 1000 );
	const currentStatus = await app.client.dnd.info();
	snoozeStatus = currentStatus.snooze_enabled;

	// If snooze is currenly inactive and no expiration has been set, use a default expiration. Otherwise, use the provided value.
	if ( snoozeStatus === false ) {
		expiration = expiration === '' ? '30 min' : expiration; //TODO: make this default configurable
	}

	// Calculate the duration in minutes from the current time
	const duration = Math.floor( ( parseExpiration( expiration ) - now ) / 60 );

	// Set or disable snooze
	if ( snoozeStatus === false ) {
		await app.client.dnd.setSnooze( {
			token: process.env.SLACK_USER_TOKEN,
			num_minutes: duration,
		} );
	} else {
		// If snooze is currently active and an expiration was provided, apply that expiration. Otherwise, disable snooze.
		if ( expiration !== '' ) {
			await app.client.dnd.setSnooze( {
				token: process.env.SLACK_USER_TOKEN,
				num_minutes: duration,
			} );
		} else {
			await app.client.dnd.endSnooze();
		}
	}
}

module.exports = { setDND };

// if snooze is true
// 		dnd with no expiration should toggle off
//		dnd with expiration should just update the duration
// if snooze is false
//		dnd with no expiration should default to 30 minutes (eventually make that configuratble)
//		dnd with expiration should activate for the defined duration
