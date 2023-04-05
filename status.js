const { getCreds, appSetup, getUserId } = require( './utils' );
const chrono = require( 'chrono-node' );
const colors = require( 'colors' );
const { getUserConfig } = require( './manageConfig' );

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
// @param args Object    workspace     String (optional) default = ''
//						 emoji		   String (optional)
//						 text		   String (optinoal)
//						 expiration	   String (optional) default = null
async function setStatus( args ) {
	let defaults = { workspace: '', expiration: null };
	args = { ...defaults, ...args };
	// Replace an empty expiration string with null
	args.expiration = args.expiration === '' ? null : args.expiration;
	// If expiration is null, and text parses as a date string,
	// use 'text' as the expiration and pass an empty 'text' string instead.
	if (
		args.expiration === null &&
		chrono.parseDate( args.text, Date.now(), { forwardDate: true } ) !==
			null
	) {
		args.expiration = args.text;
		args.text = '';
	}
	// Replace 'never' expiration string with null
	args.expiration = args.expiration === 'never' ? null : args.expiration;

	const creds = await getCreds( args.workspace );
	const app = await appSetup( creds );

	try {
		await app.client.users.profile.set( {
			token: creds.token,
			profile: {
				status_text: args.text,
				status_emoji: args.emoji,
				status_expiration:
					args.expiration === null
						? 0
						: await parseExpiration( args.expiration ),
			},
		} );
	} catch ( error ) {
		console.error(
			'😢 Slack status was not able to be updated:'.red,
			`"${ error.data.error }"\n`.grey
		);
	}
}

async function clearStatus( workspace ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	const userConfig = await getUserConfig();
	// If a default status is set, use it instead of clearing the status
	if ( userConfig.workspaces[ workspace ].defaultStatus ) {
		await setStatus( {
			workspace: workspace,
			text: userConfig.workspaces[ workspace ].defaultStatus.text,
			emoji: userConfig.workspaces[ workspace ].defaultStatus.emoji,
			expiration: 'never',
		} );
	} else {
		await app.client.users.profile.set( {
			token: creds.token,
			profile: {
				status_text: '',
				status_emoji: '',
				status_expiration: '',
			},
		} );
	}
}

async function setPresence( workspace, presence ) {
	if ( arguments.length === 1 ) {
		presence = workspace;
		workspace = '';
	}
	if ( presence === 'active' ) {
		presence = 'auto';
	}
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	try {
		await app.client.users.setPresence( {
			token: creds.token,
			presence: presence,
		} );
	} catch ( error ) {
		console.error(
			'😢 Slack presence was not able to be updated:'.red,
			`"${ error.data.error }"\n`.grey
		);
	}
}

async function getStatus( workspace, userName ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	const result = await app.client.users.profile.get( {
		token: creds.token,
		user: await getUserId( workspace, userName ),
	} );
	const status = {
		emoji: result.profile.status_emoji,
		text: result.profile.status_text,
	};
	console.log( JSON.stringify( status ) );
	return status;
}

module.exports = {
	setStatus,
	setPresence,
	parseExpiration,
	clearStatus,
	getStatus,
};
