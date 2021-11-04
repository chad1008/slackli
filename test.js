let input = [ 'send', 'channel-name', '--another', 'test message', '--active' ];

let options = input
	.filter( ( arg ) => arg.startsWith( '--' ) )
	.map( ( arg ) => {
		const option = arg.replace( '--', '' );
		return option;
	} );

for ( const arg of input ) {
	if ( arg.startsWith( '--' ) ) {
		input.splice(
			input.findIndex( ( e ) => e === arg ),
			1
		);
	}
}

console.log( input );
console.log( options );
