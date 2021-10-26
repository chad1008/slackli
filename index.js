#!/usr/bin/env node
const { App } = require( '@slack/bolt' );
const { Command } = require( './command' );
const { setStatus, setPresence } = require( './status' );
const { setTitle } = require( './title' );
const { findConversation, sendMessage } = require( './conversation' );

const command = new Command( process.argv.slice( 2 ) );

const userArgs = process.argv.slice( 2 );
const slackliMode = userArgs.shift();

// Check for an --active or --away flag and note its position in the array
if ( userArgs.includes( '--active' ) || userArgs.includes( '--away' ) ) {
	let index = userArgs.findIndex(
		( e ) => e === '--active' || e === '--away'
	);

	// Save desired presence to a variable, then strip it from the array
	const declaredPresence = userArgs[ index ]
		.replace( '--', '' )
		.replace( 'active', 'auto' );

	userArgs.splice( index, 1 );

	// Set the desired status before continuing with the requested action
	setPresence( declaredPresence );
}

switch ( command.mode ) {
	case 'status':
		setStatus( command );
		break;
	case 'send':
		sendMessage( command );
		break;
	case 'away':
		setPresence( 'away' );
		break;
	case 'active':
	case 'auto':
		setPresence( 'auto' );
		break;
	case 'title':
		setTitle( ...userArgs );
		break;
	default:
		break;
}
