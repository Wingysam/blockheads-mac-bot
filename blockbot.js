/*jshint
esversion: 6
*/

const eventEmitter = require("events").EventEmitter;
const spawn = require('child_process').spawn;
const Tail = require('tail').Tail;
const util = require("util");
const fs = require('fs');

var tail = new Tail('/private/var/log/system.log');

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
            setTimeout(function() {that.emit('message', message);}, 100);
          }
        } else {
          try {
            var join = {
              player: {
                name: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[0],
                ip: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(17).split(' |')[1].substr(1)
              },
              server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
            };
            setTimeout(function() {that.emit('join', join);}, 100);
          }
          catch (e) {
            var leave = {
              player: {
                name: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split(/- (.+)/)[1].substr(20).split(' |')[0],
              },
              server: data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].substr(0, data.split(/:(.+)/)[1].split(/:(.+)/)[1].split(/:(.+)/)[1].split(/ (.+)/)[1].split('-')[0].length - 1)
            };
            setTimeout(function() {that.emit('leave', leave);}, 100);
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
};
Bot.prototype.send = function(server, message) {
  spawn('osascript', ['-l', 'JavaScript', 'send.scpt', server, message]);
};
Bot.prototype.all = function () {
    return null;
};

module.exports = Bot;
