// Create the configuration

var helpText = function()
{
    return 'usage: /msg ' + ( userConfig.botName ) + ' register <password>\n/msg ' +
         ( userConfig.botName ) + ' identify <password>\n you must identify each time after connecting';
};

var userConfig = {
    bots                : [ 'dante', 'zach', 'Guillotine', 'hugo' ],
    admins              : [ 'mousemke' ],
    channels            : [ '#soc-bots' ],
    server              : 'irc-address or ip',
    botName             : 'nickserv',
    apiCode             : 'an-api-code',
    helpText            : helpText
};

module.exports = userConfig;