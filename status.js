const { App } = require( '@slack/bolt' );
const chrono = require( 'chrono-node' );
// const { parseDate } = require( 'chrono-node/dist/locales/en' );
const colors = require( 'colors' );
const { getUserConfig } = require( './manageConfig' );

async function getDefaultActionTime() {
	const userConfig = await getUserConfig();
	return {
		hour: userConfig.defaultActionTime.hour,
		minute: userConfig.defaultActionTime.minute,
	};
}

const app = new App( {
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
} );

async function setRefiners() {
	const userConfig = await getUserConfig();
	// Retrieve the current day of the week
	const currentDOW = new Date().getDay();
	// Customize chrono refiner to adjust results to our needs
	const custom = chrono.casual.clone();
	custom.refiners.push( {
		refine: ( context, results ) => {
			results.forEach( ( result ) => {
				// If there's no explicitly stated time (by checking for an hour) and the day of the week matches today,
				// Assume the user wants next week, and not later today
				if (
					! result.start.isCertain( 'hour' ) &&
					result.start.date().getDay() === currentDOW
				) {
					result.start.assign( 'day', result.start.get( 'day' ) + 7 );
				}
				// If no explicit time was stated, default to 9AM (this aligns with Slack's existing defaults)
				if ( ! result.start.isCertain( 'hour' ) ) {
					result.start.assign(
						'hour',
						userConfig.defaultActionTime.hour
					);
					result.start.assign(
						'minute',
						userConfig.defaultActionTime.minute
					);
				}
			} );
			return results;
		},
	} );
	return custom;
}

async function parseExpiration( expiration ) {
	const custom = await setRefiners();
	// Get current timestamp for reference
	const now = Date.now();

	// Parse input date/time
	const parseDate = new Date(
		custom.parseDate( expiration, now, { forwardDate: true } )
	);
	// Convert parsed date/time to a timestamp
	let expireTimestamp = Math.floor( parseDate.getTime() / 1000 );
	// Confirm timestamp returned isn't in the past. If it is, add 24 hours
	// This is needed because of how chronos ignores the reference date when parsing an explicit time
	if ( expireTimestamp < now / 1000 ) {
		expireTimestamp += 60 * 60 * 24;
	}

	return expireTimestamp;
}

// Update user status using emoji and status text
async function setStatus( emoji, text, expiration = null ) {
	// If expiration is null, and text parses as a date string,
	// use 'text' as the expiration and pass an empty 'text' string instead.
	if (
		expiration === null &&
		chrono.parseDate( text, Date.now(), { forwardDate: true } ) !== null
	) {
		expiration = text;
		text = '';
	}
	// Replace an empty expiration strin with null
	expiration = expiration === '' ? null : expiration;

	try {
		const response = await app.client.users.profile.set( {
			token: process.env.SLACK_USER_TOKEN,
			profile: {
				status_text: text,
				status_emoji: emoji,
				status_expiration:
					expiration === null
						? 0
						: await parseExpiration( expiration ),
			},
		} );
	} catch ( error ) {
		console.error(
			'😢 Slack status was not able to be updated:'.red,
			`"${ error.data.error }"\n`.grey
		);
	}
}

async function clearStatus() {
	await app.client.users.profile.set( {
		token: process.env.SLACK_USER_TOKEN,
		profile: {
			status_text: '',
			status_emoji: '',
			status_expiration: '',
		},
	} );
}

async function setPresence( presence ) {
	try {
		const response = await app.client.users.setPresence( {
			token: process.env.SLACK_USER_TOKEN,
			presence: presence,
		} );
	} catch ( error ) {
		console.error(
			'😢 Slack presence was not able to be updated:'.red,
			`"${ error.data.error }"\n`.grey
		);
	}
}

module.exports = { setStatus, setPresence, parseExpiration, clearStatus };
