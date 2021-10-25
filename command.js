// The Command Class parses and organizes arguments passed in from the command line
class Command {
	constructor( args ) {
		this.data = args;
		this.mode = this.parseMode( this.data[ 0 ] );
	}

	get clearStatus() {
		if ( this.mode === 'status' && this.data[ 1 ] === 'clear' ) {
			return true;
		} else {
			return false;
		}
	}

	get emoji() {
		let emojiString = '';
		if ( this.mode === 'status' && ! this.clearStatus ) {
			emojiString = this.data[ 1 ];
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

	get text() {
		if ( this.mode === 'status' ) {
			return ! this.clearStatus ? this.data[ 2 ] : '';
		}
	}

	get statusExpiration() {
		if ( this.mode === 'status' ) {
			return this.data.hasOwnProperty( 3 ) ? this.data[ 3 ] : 0;
		}
	}

	parseMode( mode ) {
		const modeStrings = [
			'status',
			'send',
			'message',
			'm',
			'away',
			'active',
			'title',
		];
		return modeStrings.includes( mode ) ? mode : undefined;
	}
}

module.exports = { Command };
