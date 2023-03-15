#!/usr/bin/env node
const { SlackCommand } = require( './command' );
const {
	setStatus,
	setPresence,
	clearStatus,
	getStatus,
} = require( './status' );
const { setTitle } = require( './title' );
const { findConversation, sendMessage } = require( './conversation' );
const { setDND } = require( './dnd.js' );

const command = new SlackCommand( process.argv.slice( 2 ) );
command.init( () => {
	// Process any commands that may be accessed by a flag/option
	if ( command.hasOwnProperty( 'presence' ) && command.mode !== 'presence' ) {
		setPresence( command.workspace, command.presence );
	}

	if ( command.toggleDND === true ) {
		setDND( command.workspace, command.expiration );
	}

	// Process commands that require an explicit mode to be set
	switch ( command.mode ) {
		case 'status':
			args = {
				workspace: command.workspace,
				emoji: command.emoji,
				text: command.text,
				expiration: command.expiration,
			};
			command.clearStatus
				? clearStatus( command.workspace )
				: setStatus( args );
			break;
		case 'getStatus':
			getStatus( command.workspace, command.username );
			break;
		case 'send':
			sendMessage( command.workspace, command.recipient, command.text );
			break;
		case 'title':
			setTitle( command.workspace, command.title );
			break;
		case 'dnd':
			command.hasOwnProperty( 'expiration' )
				? setDND( command.workspace, command.expiration )
				: setDND( command.workspace );
			break;
		case 'presence':
			setPresence( command.workspace, command.presence );
			break;

		default:
			console.log( "Sorry, I don't understand that request.".red );
			break;
	}
} );
