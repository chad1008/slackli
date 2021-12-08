const fs = require( 'fs' );
const { type } = require( 'os' );

const configSample = fs.readFileSync( 'config.json.sample' );
const configSampleJSON = JSON.parse( configSample );
const configPath = 'config.json';

function confirmOptionsAvail( config, sample ) {
	// Loop through each element of the sample and add it if it's missing
	for ( element in sample ) {
		if ( ! config.hasOwnProperty( element ) ) {
			config[ element ] = sample[ element ];
		}
		// If we encounter a nested object, loop through each of its elements as well
		if ( typeof sample[ element ] === 'object' ) {
			config[ element ] = confirmOptionsAvail(
				config[ element ],
				sample[ element ]
			);
		}
	}
	return config;
}

function verifyConfig() {
	// Generate a config file if one does not already exist
	fs.writeFile( configPath, configSample, { flag: 'wx' }, ( error ) => {
		if ( error ) {
			// An error code of -17 means the file already exists, and we should confirm all values are present.
			// All other errors should throw.
			if ( error.errno === -17 ) {
				// Confirm that all configSample elements are present, and add any that are missing
				updatedConfig = confirmOptionsAvail(
					JSON.parse( fs.readFileSync( configPath ) ),
					configSampleJSON
				);
				// If any values needed updating, write the new config to the file
				if (
					updatedConfig !==
					JSON.parse( fs.readFileSync( configPath ) )
				) {
					fs.writeFileSync(
						configPath,
						JSON.stringify( updatedConfig, null, 4 ),
						{ flag: 'w' },
						function ( err ) {
							if ( err ) throw err;
						}
					);
				}
			} else {
				throw error;
			}
		}
	} );
}

module.exports = { verifyConfig };
