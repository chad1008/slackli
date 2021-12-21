const { getCreds, appSetup } = require( './utils' );
const colors = require( 'colors' );

// Update user status using emoji and status text
async function setTitle( workspace, title ) {
	const creds = await getCreds( workspace );
	const app = await appSetup( creds );
	try {
		await app.client.users.profile.set( {
			token: creds.token,
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
