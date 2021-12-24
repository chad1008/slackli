// The SlackCommand Class parses and organizes arguments passed in from the command line
const { getUserConfig } = require( './manageConfig' );

class SlackCommand {
	#modeStrings = {
		send: [ 'send', 'message', 'm' ],
		presence: [ 'away', 'active', 'auto' ],
		dnd: [ 'dnd', 'snooze' ],
		other: [ 'status', 'title' ],
	};

	constructor( input ) {
		this.args = input;
		this.#parseOptions( input );
	}

	// Allow for asynchronous reading of config.json. Workspace is determined first,
	// which includes mutating the args array if needed. Then the rest of the command is parsed.
	async init( callback ) {
		this.mode = this.#parseMode( this.args.shift() );
		this.workspace = await this.#setWorkspace( this.args[ 0 ] );

		switch ( this.mode ) {
			case 'status':
				this.clearStatus = this.#clearStatus();
				if ( ! this.clearStatus ) {
					this.emoji = this.#parseEmoji( this.args[ 0 ] );
					this.text = this.#parseText( this.args[ 1 ] );
					this.expiration = this.args.hasOwnProperty( 2 )
						? this.args[ 2 ]
						: null;
				}
				break;
			case 'send':
				this.recipient = this.#parseRecipient( this.args[ 0 ] );
				this.text = this.#parseText( this.args[ 1 ] );
				break;
			case 'presence':
				this.presence = this.args[ 0 ];
				break;
			case 'title':
				this.title = this.args[ 0 ];
				break;
			case 'dnd':
				if ( this.args.hasOwnProperty( 0 ) ) {
					this.expiration = this.args[ 0 ];
				}
				break;
		}

		callback.bind( this )();
	}

	#clearStatus() {
		return this.args[ 0 ] === 'clear' ? true : false;
	}

	#parseEmoji( emoji ) {
		let emojiString = '';
		if ( ! this.clearStatus ) {
			emojiString = emoji;
			const emojiStringLength = emojiString.length;
			// Validate that the string begins and ends with a : character
			emojiString =
				emojiString.charAt( 0 ) === ':'
					? emojiString
					: ':' + emojiString;
			emojiString =
				emojiString.charAt( emojiStringLength - 1 ) === ':'
					? emojiString
					: emojiString + ':';
		}
		return emojiString;
	}

	#parseText( text ) {
		return ! this.clearStatus ? text : '';
	}

	#parseRecipient( recipient ) {
		return this.mode === 'send' ? recipient : null;
	}

	#parseMode( mode ) {
		if ( this.#modeStrings.send.includes( mode ) ) {
			return 'send';
		} else if ( this.#modeStrings.presence.includes( mode ) ) {
			// For presence, we push the provided value back to the args array for parsing
			this.args.push( mode );
			return 'presence';
		} else if ( this.#modeStrings.dnd.includes( mode ) ) {
			return 'dnd';
		} else if ( this.#modeStrings.other.includes( mode ) ) {
			return mode;
		} else {
			return null;
		}
	}

	#parseOptions( input ) {
		// move all arguments beginning with a double hyphen to a seprate array
		const options = input
			.filter( ( arg ) => arg.startsWith( '--' ) )
			.map( ( arg ) => {
				const option = arg.replace( '--', '' );
				return option;
			} );
		// remove options from the input array
		for ( const arg of input ) {
			if ( arg.startsWith( '--' ) ) {
				input.splice(
					input.findIndex( ( e ) => e === arg ),
					1
				);
			}
		}

		// process each option
		for ( const option of options ) {
			if ( this.#modeStrings.presence.includes( option ) ) {
				this.presence = option;
			}
			if ( this.#modeStrings.dnd.includes( option ) ) {
				this.toggleDND = true;
			}
		}
	}

	async #setWorkspace( arg ) {
		const userConfig = await getUserConfig();
		// If the provided argument matches any of the keys in the the user's saved workspaces,
		// remove the arg and from the array and return it as the selected workspace.
		// Otherwise, use the defined default workspace.
		if ( Object.keys( userConfig.workspaces ).includes( arg ) ) {
			this.args.splice( this.args.indexOf( arg ), 1 );
			return arg;
		} else {
			return userConfig.workspaces.default;
		}
	}
}

module.exports = { SlackCommand };
