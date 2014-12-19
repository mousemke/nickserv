// Create the configuration
var userConfig = {
        bots                : [ 'dante', 'zach', 'Guillotine', 'hugo' ],
        admins              : [ 'mousemke' ],
        // channels            : [ '#soc-bots' ],
        server              : 'irc-address or ip',
        botName             : 'nickserv',
        selfAddress         : 'my-ip!',
        api                 : 'an-api-code',
        helpText            : 'usage:\n/msg NickServ register <password>\n/msg NickServ identify <password>\n you must identify each time after connecting'
    };

module.exports = userConfig;