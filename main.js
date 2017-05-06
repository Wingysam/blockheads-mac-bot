/*jshint
esversion: 6
*/
const Tail = require('tail').Tail;
const fs = require('fs');
const spawn = require('child_process').spawn;

var tail = new Tail('/private/var/log/system.log');

var config = require(__dirname + '/config.json');
function writeConfig() {
  fs.writeFile(__dirname = '/config.json', JSON.stringify(config, null, 2), function (err) {
    logger.error(err);
  });
}

var logger = {
  log: function (message, header='log') {
    var textToLog = '[' + header.toUpperCase() + '] ' + message;
    console.log(textToLog);
    fs.appendFile('log', textToLog + '\n', (err) => {});
  },
  error: function (message, header='error') {
    var textToLog = '[' + header.toUpperCase() + '] ' + message;
    console.log(textToLog);
    fs.appendFile('log', textToLog + '\n', (err) => {});
  }
};

var blockheads = false;
var message = '';

tail.on('line', function (data) {
  if (data.includes('BlockheadsServer')) {
    if (data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].includes('-')) {
      if (data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].includes(':')) {
        message = {
          content: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].split(/:(.+)/)[1].substr(1),
          author: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].split(/:(.+)/)[0],
          server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
        };
        blockheads = true;
        if (message.author !== 'Client disconnected') {
          setTimeout(gotMessage, 100);
        }
      } else {
        try {
          join = {
            player: {
              name: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[0],
              ip: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[1].substr(1)
            },
            server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
          };
          setTimeout(playerJoined, 100);
        }
        catch (e) {
          leave = {
            player: {
              name: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(20).split(' |')[0],
            },
            server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
          };
          setTimeout(playerLeft, 100);
        }
      }
    }
  }
  else if (blockheads) {
    if (data.startsWith('\t')) {
      message.content += '\n' + data.split(/\t(.+)/)[1];
    }
    else {
      blockheads = false;
    }
  }
});

function getUsername(message) {
  for (let i = 18; i > 4; i--) {
    let possibleName = message.substring(0, message.lastIndexOf(': ', i));
    if (this.online.includes(possibleName) || possibleName == 'SERVER') {
      return possibleName;
    }
  }
  // Should ideally never happen.
  return message.substring(0, message.lastIndexOf(': ', 18));
}

function gotMessage() {
  logger.log(message.author + ': ' + message.content, message.server);
  if (message.content.toLowerCase() === config.prefix + 'test') {
    send(message.server, 'It works!');
  }
  else if (message.content.startsWith(config.prefix + 'eval') && message.author === 'WINGYSAM') {
    try {
      var result = eval(message.content.substr(config.prefix.length + 5));
      if (! result.startsWith('/')) send(message.server, result);
      else send(message.server, 'That starts with a slash. Refusing to send.');
    } catch (error) {
      send(message.server, error);
    }
  }
}

function playerJoined() {
  logger.log(join.player.name + ' joined. (' + join.player.ip + ')', join.server);
  send(join.server, 'Hello, ' + join.player.name + '!');
}

function playerLeft() {
  logger.log(leave.player.name + ' left.', leave.server);
}

function send(server, message) {
  spawn('osascript', ['-l', 'JavaScript', 'send.scpt', server, message]);
}

logger.log('Started.', 'bot');
