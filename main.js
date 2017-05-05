/*jshint
esversion: 6
*/
const Tail = require('tail').Tail;
const fs = require('fs');
const spawn = require('child_process').spawn;

var tail = new Tail('/private/var/log/system.log');

fs.writeFile('log', '', function (err) {});
var logger = {
  log: function (message, header='log') {
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
  if (message.content.toLowerCase() === 'test') {
    send(message.server, 'It works!');
  }
  else if (message.content.startsWith('eval') && message.author === 'WINGYSAM') {
    send(message.server, eval(message.content.substr(5)));
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
