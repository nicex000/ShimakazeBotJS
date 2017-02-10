'use strict'
var v = require('../internal/voice.js')
var Permissions = require('../databases/controllers/permissions.js')
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
  aliases: ['lv'],
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
  level: 3,
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
        Permissions.checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
          if(level>1)
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

    Permissions.checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
      var u = require('url').parse(suffix)
      if (u.host === null) {
        v.request(msg, 'ytsearch:' + suffix, bot, level, 0)
      } else {
        v.request(msg, suffix, bot, level, 0)
      }
    })
  }
}

Commands.requestat = {
  name: 'requestat',
  help: 'Add a song in a specific index of the list',
  aliases: ['ra', 'spierdalaj'],
  noDM: true,
  usage: 'index link',
  timeout: 0,
  level: 2,
  fn: function (msg, suffix, bot)
  {
    if (isNaN(suffix[0])) {
      msg.reply('Your first parameter is not a number!')
    }
    else
    {
      var x = suffix.indexOf(" ");
      var i = suffix.substring(0, x);
      if(!isNaN(i))
      {
        var str = suffix.substring(x+1);

        Permissions.checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
          var u = require('url').parse(str)
          if (u.host === null) {
            v.request(msg, 'ytsearch:' + str, bot, level, i)
          } else {
            v.request(msg, str, bot, level, i)
          }
        })

      }
      else
      {
        msg.reply('Your first parameter is not a number!')
      }
    }
  }
}

Commands.removeat = {
  name: 'removeat',
  help: 'Remove a song from a specific index of the list',
  aliases: ['rem'],
  noDM: true,
  usage: 'index',
  timeout: 0,
  level: 2,
  fn: function (msg, suffix, bot)
  {
    if(isNaN(suffix))
    {
      msg.reply('The index is not a number!')
    }
    else
    {
      v.removeAt(msg, suffix, bot)
    }
  }

}

exports.Commands = Commands
