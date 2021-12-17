const { getCreds, appSetup } = require( './utils' );
const parseExpiration = require( './status' ).parseExpiration;
const { getUserConfig } = require( './manageConfig' );

async function setDND( expiration = '' ) {
	const creds = await getCreds();
	const app = await appSetup( creds );
	const now = Math.floor( new Date().getTime() / 1000 );
	const currentStatus = await app.client.dnd.info();
	const snoozeStatus = currentStatus.snooze_enabled;
	const userConfig = await getUserConfig();

	// If snooze is currenly inactive and no expiration has been set, use a default expiration. Otherwise, use the provided value.
	if ( snoozeStatus === false ) {
		expiration = expiration === '' ? userConfig.defaultDND : expiration; //TODO: make this default configurable
	}

	// Calculate the duration in minutes from the current time
	const duration = Math.floor(
		( ( await parseExpiration( expiration ) ) - now ) / 60
	);

	// Set or disable snooze
	if ( snoozeStatus === false ) {
		await app.client.dnd.setSnooze( {
			token: creds.token,
			num_minutes: duration,
		} );
	} else {
		// If snooze is currently active and an expiration was provided, apply that expiration. Otherwise, disable snooze.
		if ( expiration !== '' ) {
			await app.client.dnd.setSnooze( {
				token: creds.token,
				num_minutes: duration,
			} );
		} else {
			await app.client.dnd.endSnooze();
		}
	}
}

module.exports = { setDND };
