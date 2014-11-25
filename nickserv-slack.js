

// Create the configuration

var channel, _bot,

    userConfig  = require( './nickserv-slack.config.js' ),
    http        = require( 'http' ),
    https       = require( 'https' ),
    irc         = require( 'irc' ),
    fs          = require( 'fs' ),
    active      = {},
    moonRegex   = /(?:m([o]+)n)/,
    logMasterList = {};



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
        // debug       : true
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
    var textSplit = text.split( ' ' );

    var command = textSplit[ 0 ],
        pass    = textSplit[ 1 ],
        botText = '';

    if ( text === 'die' && userConfig.admins.indexOf( from ) !== -1 )
    {
        _bot.disconnect( 'Fine...  I was on my way out anyways.', function()
        {
            console.log( from + ' killed me' );
        });
    }
    else if ( command === 'identify' )
    {
        if ( ! logMasterList[ from ] )
        {
            botText = 'please register first';
        }
        else if ( ! pass )
        {
            botText = 'you must supply a password';
        }
        else if ( logMasterList[ from ].on === true )
        {
            botText = 'you are already identified';
        }
        else if ( logMasterList[ from ].p === pass )
        {
            console.log( from + ' is now identified' );
            logMasterList[ from ].on = true;
            botText = 'you are now identified as ' + from;
            writeMasterList();
        }
        else
        {
            botText = 'wrong password';
        }

        _bot.say( from, botText );
    }
    else if ( command === 'register' )
    {
         if ( logMasterList[ from ] )
        {
            botText = 'you are already registered';
        }
        else if ( ! pass )
        {
            botText = 'you must supply a password';
        }
        else
        {
            logMasterList[ from ]       = {};
            logMasterList[ from ].on    = true;
            logMasterList[ from ].p     = pass;
            botText = 'you are now registered and identified as ' + from;
            writeMasterList();
        }

        _bot.say( from, botText );
    }
    else if ( command === 'help' )
    {
        botText = userConfig.helpText;
        _bot.say( from, botText );
    }
    else if ( command === userConfig.api )
    {
        var user = textSplit[ 2 ];

        if ( ! logMasterList[ user ] )
        {
            _bot.say( from, userConfig.api + ' notRegistered ' + user );
        }
        else if ( pass === 'identified' )
        {
            _bot.say( from, userConfig.api + ' identified ' + user + ' ' + logMasterList[ user ].on );
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
    var url = '/nickserv/logMasterList-slack.json';

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
    });
}


function writeMasterList()
{
    var jsonMasterList = JSON.stringify( logMasterList );

    fs.writeFile( './logMasterList-slack.json', jsonMasterList, function ( err )
    {
        return console.log( err );
    });
}


init();
