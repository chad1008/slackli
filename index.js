#!/usr/bin/env node
const { SlackCommand } = require( './command' );
const { setStatus, setPresence, clearStatus } = require( './status' );
const { setTitle } = require( './title' );
const { findConversation, sendMessage } = require( './conversation' );
const { setDND } = require( './dnd.js' );

const command = new SlackCommand( process.argv.slice( 2 ) );
command.init( () => {
	// Process any commands that may be accessed by a flag/option
	if ( command.hasOwnProperty( 'presence' ) && command.mode !== 'presence' ) {
		setPresence( command.presence );
	}

	if ( command.toggleDND === true ) {
		setDND( command.expiration );
	}

	// Process commands that require an explicit mode to be set
	switch ( command.mode ) {
		case 'status':
			if ( command.clearStatus ) {
				clearStatus();
			} else {
				setStatus( command.emoji, command.text, command.expiration );
			}
			break;
		case 'send':
			sendMessage( command.recipient, command.text );
			break;
		case 'title':
			setTitle( command.title );
			break;
		case 'dnd':
			command.hasOwnProperty( 'expiration' )
				? setDND( command.expiration )
				: setDND();
			break;
		case 'presence':
			setPresence( command.presence );
			break;

		default:
			console.log( "Sorry, I don't understand that request.".red );
			break;
	}
} );
