// The SlackCommand Class parses and organizes arguments passed in from the command line
class SlackCommand {
	#sendModeStrings;
	#presenceStrings;
	#dndStrings;
	#otherModeStrings;

	constructor( input ) {
		this.#sendModeStrings = [ 'send', 'message', 'm' ];
		this.#presenceStrings = [ 'away', 'active', 'auto' ];
		this.#dndStrings = [ 'dnd', 'snooze' ];
		this.#otherModeStrings = [ 'status', 'title' ];
		this.args = input;
		this.mode = this.#parseMode( this.args.shift() );
		switch ( this.mode ) {
			case 'status':
				this.clearStatus = this.#clearStatus();
				if ( ! this.clearStatus ) {
					this.emoji = this.#parseEmoji( this.args[ 0 ] );
					this.text = this.#parseText( this.args[ 1 ] );
					this.expiration = this.args.hasOwnProperty( 2 )
						? this.args[ 2 ]
						: 0;
				}
				break;
			case 'send':
				this.recipient = this.#parseRecipient( this.args[ 0 ] );
				this.text = this.#parseText( this.args[ 1 ] );
				break;
			case 'presence':
				this.presence = this.#parsePresence( this.args[ 0 ] );
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
		this.#parseOptions( input );
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

	#parsePresence( presence ) {
		if ( presence === 'away' ) {
			return 'away';
		} else if ( presence === 'active' || presence === 'auto' ) {
			return 'auto';
		} else {
			return null;
		}
	}

	#parseMode( mode ) {
		if ( this.#sendModeStrings.includes( mode ) ) {
			return 'send';
		} else if ( this.#presenceStrings.includes( mode ) ) {
			// For presence, we push the provided value back to the args array for parsing
			this.args.push( mode );
			return 'presence';
		} else if ( this.#dndStrings.includes( mode ) ) {
			return 'dnd';
		} else if ( this.#otherModeStrings.includes( mode ) ) {
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

		// strip the hyphens
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
			if ( this.#presenceStrings.includes( option ) ) {
				this.presence = this.#parsePresence( option );
			}
			if ( this.#dndStrings.includes( option ) ) {
				this.toggleDND = true;
			}
		}
	}
}

module.exports = { SlackCommand };
