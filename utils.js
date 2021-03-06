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

module.exports = { getCreds, appSetup };
