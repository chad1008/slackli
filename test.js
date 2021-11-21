const chrono = require( 'chrono-node' );
const { parseDate } = require( 'chrono-node/dist/locales/en' );

const string = 'lunch';
console.log( parseDate( string ) );
