var Trac = require('../lib/linking/trac');

var trac = new Trac();

module.exports = function (skill, info, bot, message) {
    var beesLink = 'https://studentrobotics.org/trac/ticket/591';
    var bees = ['```',
        '                                  ...vvvv)))))).'        ,        '       /~~\\               ,,,c(((((((((((((((((/'             ,
        '      /~~c \\.         .vv)))))))))))))))))))\\\`\`'     ,
        '          G_G__   ,,(((KKKK//////////////\''             ,
        '        ,Z~__ \'@,gW@@AKXX~MW,gmmmz==m_.'                ,
        '       iP,dW@!,A@@@@@@@@@@@@@@@A\` ,W@@A\c'              ,
        '       ]b_.__zf !P~@@@@@*P~b.~+=m@@@*~ g@Ws.'            ,
        '          ~\`    ,2W2m. \'\\[ [\'~~c\'M7 _gW@@A\`\'s'    ,
        '            v=XX)====Y-  [ [    \\c/*@@@*~ g@@i'         ,
        '           /v~           !.!.     \'\\c7+sg@@@@@s.'      ,
        '          //              \'c\'c       \'\\c7*X7~~~~'    ,
        '         ]/                 ~=Xm_       \'~=(Gm_.'       ,
        '```'].join('\n');
    bot.reply(bees);    
    trac.getMessage(beesLink, function (err, res) {
        if (err) throw err;
        try {
            bot.reply(res);
        } catch (err) {
            console.error(err);
        } //TODO: find out why removing this breaks things.
    });
};
