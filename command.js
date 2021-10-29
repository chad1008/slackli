// The SlackCommand Class parses and organizes arguments passed in from the command line
class SlackCommand {
	constructor( input ) {
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
				console.log( 'send mode!' );
				this.recipient = this.#parseRecipient( this.args[ 0 ] );
				this.text = this.#parseText( this.args[ 1 ] );
				break;
		}
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
		const sendModeStrings = [ 'send', 'message', 'm' ];
		const otherModeStrings = [ 'status', 'away', 'active', 'title' ];
		if ( sendModeStrings.includes( mode ) ) {
			return 'send';
		} else if ( otherModeStrings.includes( mode ) ) {
			return mode;
		} else {
			return null;
		}
	}
}

module.exports = { SlackCommand };
