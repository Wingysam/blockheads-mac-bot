/*jshint
esversion: 6
*/

const eventEmitter = require("events").EventEmitter;
const spawn = require('child_process').spawn;
const Tail = require('tail').Tail;
const util = require("util");
const fs = require('fs');

//var tail = new Tail('/private/var/log/system.log');
var tail = spawn('tail', ['-n', '0', '-f', '/private/var/log/system.log']);

function Bot() {
    eventEmitter.call(this);
}

util.inherits(Bot, eventEmitter);

Bot.prototype.message = function (msg) {
    this.emit("message", msg);
};

var blockheads = false;
var message = '';

Bot.prototype.start = function() {
  var that = this;
  tail.stdout.on('data', function (data) {
    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8');
    }
    if (data.includes('BlockheadsServer')) {
      if (data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].includes('-')) {
        if (data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].includes(':')) {
          message = {
            content: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].split(/:(.+)/)[1].substr(1),
            author: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].split(/:(.+)/)[0],
            server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
          };
          blockheads = true;
          lines = data.split('\n');
          lines.shift();
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('\t')) {
              message.content += '\n' + lines[i].substr(1);
            }
          }
          if (message.author !== 'Client disconnected') {
            that.emit('message', message);
          } else {
            var leave = {
              player: {
                name: data.split('Player Disconnected ')[1].replace('\n', ''),
              },
              server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
            };
            that.emit('leave', leave);
          }
        } else {
          if (! data.includes('Dis')) {
            var join = {
              player: {
                name: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[0],
                ip: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[1].substr(1)
              },
              server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
            };
            that.emit('join', join);
          }
        }
      }
    }
  });
};
Bot.prototype.send = function(server, message) {
  spawn('osascript', ['-l', 'JavaScript', 'send.scpt', server, message]);
};
Bot.prototype.all = function () {
    return null;
};

module.exports = Bot;
