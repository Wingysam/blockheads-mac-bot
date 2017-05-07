/*jshint
esversion: 6
*/
var BlockBot = require(__dirname + '/blockbot');
var bot = new BlockBot();

function log(message, header='log') {
  console.log('[' + header + '] ' + message);
}

bot.on("message", message => {
    log(message.author + ': ' + message.content, message.server);
});

bot.on('join', join => {
  log(join.player.name + ' joined. (' + join.player.ip + ')', join.server);
  bot.send(join.server, 'Hello, ' + join.player.name + '!');
});

bot.on('leave', leave => {
  log(leave.player.name + ' left.', leave.server);
});

bot.start();
