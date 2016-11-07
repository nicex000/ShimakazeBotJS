'use strict'
var v = require('../internal/voice.js')
var Commands = []

Commands.music = {
  name: 'music',
  help: "I'll pause or play the music, just tell me what after the command!",
  aliases: ['pauseplay', 'playpause'],
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.music(msg, suffix, bot)
  }
}

Commands.volume = {
  name: 'volume',
  help: "I'll change my volume!",
  aliases: ['vol'],
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.volume(msg, suffix, bot)
  }
}

Commands.voteskip = {
  name: 'voteskip',
  help: 'Vote to skip the current playing song.',
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.voteSkip(msg, bot)
  }
}

Commands.shuffle = {
  name: 'shuffle',
  help: 'Shuffle the current playlist.',
  noDM: true,
  level: 0,
  fn: function (msg) {
    v.shuffle(msg)
    msg.reply('Playlist shuffled')
  }
}

Commands['leave-voice'] = {
  name: 'leave-voice',
  help: "I'll leave the current voice channel.",
  noDM: true,
  level: 3,
  fn: function (msg, suffix, bot) {
    v.leave(msg, suffix, bot)
  }
}

Commands.lovelive = {
  name: 'lovelive',
  help: "play a love live song from the LL collections. Usage: !lovelive <collection n> <disc n> <song n>",
  aliases: ['ll', 'LL', 'llive', 'raburaibu'],
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.lovelive(msg, suffix, bot)
  }
}

Commands.skip = {
  name: 'skip',
  help: "I'll skip this song if you don't like it.",
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    var Permissions = require('../databases/controllers/permissions.js')
      Permissions.checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
        if(level)
        {
          v.skip(msg, suffix, bot)
          msg.channel.sendMessage('Skipped.').then((m) => {
            setTimeout(() => {
              m.delete().catch((e) => Logger.error(e))
            }, 3000)
          })
        }
        else
        {
          v.selfSkip(msg, suffix, bot)
          msg.channel.sendMessage('Skipped own song.').then((m) => {
            setTimeout(() => {
              m.delete().catch((e) => Logger.error(e))
            }, 3000)
          })
        }
      }).catch((error) => {
        msg.channel.sendMessage('Something went wrong, try again later.')
        Logger.error(error)
    })
  }
}

Commands.playlist = {
  name: 'playlist',
  help: "I'll fetch you the playlist I'm currently playing!",
  aliases: ['list'],
  noDM: true,
  timeout: 10,
  level: 0,
  fn: function (msg) {
    v.fetchList(msg).then((r) => {
      var arr = []
      arr.push('Now playing: **' + r.info[0] + '** \n')
      for (var i = 1; i < r.info.length; i++) {
        arr.push((i + 1) + '. **' + r.info[i] + '** Requested by ' + r.requester[i])
        if (i === 9) {
          arr.push('And about ' + (r.info.length - 10) + ' more songs.')
          break
        }
      }
      msg.channel.sendMessage(arr.join('\n')).then((m) => {
        setTimeout(() => {
          m.delete()
        }, 15000)
      })
    }).catch(() => {
      msg.channel.sendMessage("It appears that there aren't any songs in the current queue.")
    })
  }
}

Commands.voice = {
  name: 'voice',
  help: "I'll join a voice channel!",
  aliases: ['join-voice', 'join'],
  noDM: true,
  timeout: 10,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.join(msg, suffix, bot)
  }
}

Commands.request = {
  name: 'request',
  help: 'Use this to request songs!',
  aliases: ['queue', 'req', 'r'],
  noDM: true,
  usage: 'link',
  timeout: 0,
  level: 0,
  fn: function (msg, suffix, bot) {
    var u = require('url').parse(suffix)
    if (u.host === null) {
      msg.channel.sendMessage("That's not how you do it, you need to enter a link to a file for me to play.")
    } else {
      v.request(msg, suffix, bot)
    }
  }
}

exports.Commands = Commands
