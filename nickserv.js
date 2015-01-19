

// Create the configuration

var channel, _bot,

    userConfig  = require( './nickserv.config.js' ),
    http        = require( 'http' ),
    https       = require( 'https' ),
    irc         = require( 'irc' ),
    fs          = require( 'fs' ),
    logMasterList = {};


function identify( sourceUser, command, pass, content )
{
    if ( ! logMasterList[ sourceUser ] )
    {
        botText = 'please register first';
    }
    else if ( ! pass )
    {
        botText = 'you must supply a password';
    }
    else if ( logMasterList[ sourceUser ].on === true )
    {
        botText = 'you are already identified';
    }
    else if ( logMasterList[ sourceUser ].p === content )
    {
        logMasterList[ sourceUser ].on = true;
        botText = 'you are now identified as ' + sourceUser;
        writeMasterList();
    }
    else
    {
        botText = 'wrong password';
    }

    _bot.say( sourceUser, botText );
}


/**
 * init
 *
 * sets listeners and master list up
 *
 * @return {void}
 */
function init()
{
     _bot = new irc.Client( userConfig.server, userConfig.botName, {
        channels    : userConfig.channels,
        password    : userConfig.serverPassword,
        showErrors  : false,
        autoRejoin  : true,
        autoConnect : true
    });

    _bot.addListener( 'error', function( message )
    {
        console.log( 'error: ', message );
    });

    _bot.addListener( 'pm', listenToPm );

    _bot.addListener( 'quit', listenToQuit );

    _bot.addListener( 'kill', listenToQuit );

    loadMasterList();
}


function listenToPm( from, text )
{
    var textSplit   = text.split( ' ' );

    var sourceUser  = from,
        apiCode     = textSplit[ 0 ],
        command     = textSplit[ 1 ],
        content     = textSplit[ 2 ],
        botText     = '';

    if ( text === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        {
            console.log( from + ' killed me' );
        });
    }
    else if ( apiCode === 'identify' )
    {
        identify( sourceUser, apiCode, command, content );
    }
    else if ( apiCode === 'register' )
    {
        register( sourceUser, apiCode, command );
    }
    else if ( apiCode === 'help' )
    {
        _bot.say( from, userConfig.helpText() );
    }
    else if ( apiCode === userConfig.apiCode )
    {
        if ( ! logMasterList[ content ] )
        {
            _bot.say( from, userConfig.apiCode + ' notRegistered ' + content );
        }
        else
        {
            _bot.say( from, userConfig.apiCode + ' identified ' + content + ' ' + logMasterList[ content ].on );
        }
    }
}


function listenToQuit( user )
{
    if ( logMasterList[ user ] )
    {
        console.log( user + ' has left' );
        logMasterList[ user ].on = false;
        writeMasterList();
    }
}


/**
 * Load Master List
 *
 * loads the json for the master bank list
 *
 * @return {void}
 */
function loadMasterList()
{
    var url = '/nickserv/logMasterList.json';

    http.get( url, function( res )
    {
         var body = '', _json = '';

        res.on( 'data', function( chunk )
        {
            body += chunk;
        });

        res.on( 'end', function()
        {
            logMasterList =  JSON.parse( body );
        });

    } ).on( 'error', function( e )
    {
        console.log( 'Got error: ', e );
    } );
}


function register( sourceUser, command, pass )
{
    if ( logMasterList[ sourceUser ] )
    {
        botText = 'you are already registered';
    }
    else if ( ! pass )
    {
        botText = 'you must supply a password';
    }
    else
    {
        logMasterList[ sourceUser ]       = {};
        logMasterList[ sourceUser ].on    = true;
        logMasterList[ sourceUser ].p     = pass;
        botText = 'you are now registered and identified as ' + sourceUser;
        writeMasterList();
    }

    _bot.say( sourceUser, botText );
}


function writeMasterList()
{
    var jsonMasterList = JSON.stringify( logMasterList );

    fs.writeFile( './logMasterList.json', jsonMasterList, function ( err )
    {
        return console.log( err );
    });
}


init();
