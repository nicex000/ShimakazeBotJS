var Commands = []
var Logger = require('../../internal/logger.js').Logger
var config = require('../../../config.json')
var checkLevel = require('../../databases/controllers/permissions.js').checkLevel
var v = require('../../internal/voice.js')
var fButton = 0

Commands.hug = {
  name: 'hug',
  help: "I guess i can give you a friendly hug...",
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    if(msg.author.id == 155038222794227712)
    {
      var msgArray = []
      msgArray.push('*hugs ' + msg.author.mention + ' with lots of love  ♥♥♥*')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
    else
    {
      var msgArray = []
      msgArray.push('*hugs ' + msg.author.mention + ' in a friendly manner*')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
  }
}

Commands.kiss = {
  name: 'kiss',
  help: "I'll kiss my loved one ♥",
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    if(msg.author.id == 155038222794227712)
    {
      var msgArray = []
      msgArray.push('*gives ' + msg.author.mention + ' a lovers kiss ♥♥♥*')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
    else
    {
      msg.reply("I'm not going to kiss you!")
    }

  }
}

Commands.goodnight = {
  name: 'goodnight',
  help: 'Say GoodNight !',
  aliases: ['gn', 'night'],
  level: 0,
  fn: function (msg, suffix, bot) {

    if(suffix.length >1)
    {
      var msgArray = []
      msgArray.push('GoodNight / '+ suffix +' !')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
    else if(msg.author.id == 155038222794227712)
    {
      var msgArray = []
      msgArray.push('GoodNight / everyone! '+ msg.author.username +' and I are going to bed now.')
      msg.channel.sendMessage(msgArray.join('\n'))
      Logger.warn('Disconnected via goodnight message')
      bot.disconnect()
      setTimeout(() => {
          process.exit(0).catch((e) => Logger.error(e))
        }, 3000)
    }
    else if(msg.author.id == 66792137647206400 || msg.author.id == 186873040292806656)
    {
        msg.reply("gachiGASM Billy says GoodNight gachiGASM")
    }
    else
    {
      msg.reply('Sleep already! You\'re so slow! GoodNight /')
    }
  }
}

Commands.goodmorning = {
  name: 'goodmorning',
  help: 'Say GoodMorning !',
  aliases: ['gm', 'morning'],
  level: 0,
  fn: function (msg, suffix, bot) {

    if(suffix.length >1)
    {
      var msgArray = []
      msgArray.push('GoodMorning / '+ suffix +' !')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
    else if(msg.author.id == 155038222794227712)
    {
      var msgArray = []
      msgArray.push('We have finally awoken, that was slow, wasn\'t it?\nGoodMorning / everyone!')
      msg.channel.sendMessage(msgArray.join('\n'))
    }
    else if(msg.author.id == 66792137647206400 || msg.author.id == 186873040292806656)
    {
        msg.reply("gachiGASM Billy says GoodMorning gachiGASM")
    }
    else
    {
      if(Math.random()*2>1)
      {
          msg.reply('You finally woke up? you\'re too slow!\nGoodMorning /')
      }
      else
      {
          msg.reply('GoodMorning /\nWanna race? I won\'t lose!')
      }
    }
  }
}

Commands.sjoin = {
  name: 'sjoin',
  help: 'silent join',
  aliases:['sj', 's'],
  hidden: true,
  level: 0,
  fn: function (msg, suffix, bot){
    checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
      var voiceCheck = bot.VoiceConnections.find((r) => r.voiceConnection.guild.id === msg.guild.id)
      var VC = msg.member.getVoiceChannel()
      if (VC && (!voiceCheck || level >1)) {
        v.unregisterVanity(msg);
        VC.join()
      }
      msg.channel.fetchMessages(1).then((result) => {
        bot.Messages.deleteMessages(result.messages)
      }).catch((error) => {
        Logger.error(error)
      })
    })
  }
}

Commands.parrot = {
  name: 'parrot',
  help: 'remove parrot command message for nightbot',
  aliases:['p'],
  hidden: true,
  level: 1,
  fn: function (msg, suffix, bot){
    msg.channel.fetchMessages(1).then((result) => {
      bot.Messages.deleteMessages(result.messages)
    }).catch((error) => {
      Logger.error(error)
    })
      var msgArray = []
    msgArray.push('!parrot ' + suffix)
    msg.channel.sendMessage(msgArray.join('\n')).then((m) => {
      setTimeout(() => {
        m.delete().catch((e) => Logger.error(e))
      }, 500)})
  }
}

Commands.bj = {
  name: 'bj',
  help: 'pls no',
  hidden: true,
  level: 0,
  fn: function (msg, suffix, bot){
    if(msg.author.id == 155038222794227712)
    {
      if(msg.isPrivate)
      {
        msg.reply("*makes lewd sounds*")
      }
      else
      {
        msg.reply("Not Here!")
      }
    }
    else if(msg.author.id == 66792137647206400 || msg.author.id == 186873040292806656)
    {
        msg.reply("pls, go ask Billy gachiPls")
    }
    else
    {
      msg.reply("FUCK OFF!")
    }
  }
}

Commands.setnick = {
  name: 'setnick',
  help: 'change the nickname on the current server',
  hidden: true,
  level: 5,
  fn: function (msg, suffix, bot){
    var user = bot.User
    var member = msg.guild.members.find((m) => m.id === user.id)
    member.setNickname(suffix)
  }
}
Commands.channelinfo = {
  name: 'channelinfo',
  level: 0,
  fn: function (msg)
  {
    msg.channel.sendMessage(msg.channel.id)
    var user = msg.author
    var guild = msg.guild
    var userPerms = user.permissionsFor(guild)
    var chp = user.permissionsFor(msg.channel)
    msg.channel.sendMessage('server ' + userPerms.Text.MANAGE_MESSAGES)
    msg.channel.sendMessage('channel ' + chp.Text.MANAGE_MESSAGES)
}
}

Commands.autodelete = {
  name: 'autodelete',
  help: 'autodelete your own message after a timeout',
  aliases: ['d'],
  usage: 'timout suffix',
  level: 0,
  fn: function (msg, suffix, bot){
    if(isNaN(suffix[0]))
    {


      msg.channel.fetchMessages(1).then((result) => {
        bot.Messages.deleteMessages(result.messages)
      }).catch((error) => {
        Logger.error(error)
      })

      msg.channel.sendMessage('Your first parameter is not a number!').then((m) => {
          setTimeout(() => {
            m.delete().catch((e) => Logger.error(e))
          }, 2000)
      })
    }
    else
    {
      var x = suffix.indexOf(" ");
      var t = suffix.substring(0, x);
      if(x==0) t = suffix
      if(!isNaN(t))
      {
        msg.channel.fetchMessages(1).then((result) => {
          setTimeout(() => {
              bot.Messages.deleteMessages(result.messages)
          }, t*1000)
        }).catch((error) => {
          Logger.error(error)
        })
      }
      else
      {


        msg.channel.fetchMessages(1).then((result) => {
          bot.Messages.deleteMessages(result.messages)
        }).catch((error) => {
          Logger.error(error)
        })

        msg.channel.sendMessage('Your first parameter is not a number!').then((m) => {
            setTimeout(() => {
              m.delete().catch((e) => Logger.error(e))
            }, 2000)
        })
      }
    }
  }
}

Commands.assignrole = {
  name: 'assignrole',
  help: 'Let me join a role!',
  aliases: ['addrole', 'gibrole'],
  noDM: true,
  usage: 'role name',
  level: 0,
  fn: function (msg, suffix, bot) {
    var guild = msg.guild
    var user = msg.author
    var botuser = bot.User
    var botPerms = botuser.permissionsFor(guild)
    if (!botPerms.General.MANAGE_ROLES) {
      msg.reply("I don't have enough permissions to do this!")
      return
    } else if (suffix.length == 0) {
      msg.channel.sendMessage('Please write the role name (not a mention).')
    } else {
      var member = guild.members.find((m) => m.id === user.id)
      var role = guild.roles.find(r => r.name == suffix)
      if(role !== undefined && member !== undefined) {
        member.assignRole(role).then(() => {
          msg.channel.sendMessage('Successfully added `' + suffix + '` to `' + user.username + '`.')
        }).catch((error) => {
          msg.channel.sendMessage('Failed to add the role `'+ suffix + '` to `' + user.username + '`. The role is too high for me to reach.')
        })
      } else {
        msg.channel.sendMessage('The role `'+ suffix + '` doesn\'t exist.')
      }
    }
  }
}


Commands.unassignrole = {
  name: 'unassignrole',
  help: 'I don\'t want this role anymore, please remove it!',
  noDM: true,
  usage: 'role name',
  aliases: ['removerole', 'takerole'],
  level: 0,
  fn: function (msg, suffix, bot) {
    var guild = msg.guild
    var user = msg.author
    var botuser = bot.User
    var botPerms = botuser.permissionsFor(guild)
    if (!botPerms.General.MANAGE_ROLES) {
      msg.reply("I don't have enough permissions to do this!")
      return
    } else if (suffix.length == 0) {
      msg.channel.sendMessage('Please write the role name (not a mention).')
      return
    } else {

      var member = guild.members.find((m) => m.id === user.id)
      var role = member.roles.find(r => r.name == suffix)
      if(role !== undefined && member !== undefined) {
        member.unassignRole(role).then(() => {
          msg.channel.sendMessage('Successfully removed `' + suffix + '` to `' + user.username + '`.')
        }).catch((error) => {
          msg.channel.sendMessage('Failed to remove the role `'+ suffix + '` to `' + user.username + '`. The role is too high for me to reach.')
        })
      } else {
        msg.channel.sendMessage('The role `'+ suffix + '` doesn\'t exist.')
      }
    }
  }
}

Commands.pressf = {
  name: 'pressf',
  help: "Press F to pay respects",
  aliases: ['f'],
  timeout: 3,
  level: 0,
  fn: function (msg, suffix, bot) {
    fButton++
    var field = [{name: '**' + msg.author.username +  '** has paid their respects.' , value: '```\n' + fButton + ' Today' + '```', inline: true}]
    var embed = {
      color: 0x3498db,
      author: {icon_url: bot.User.avatarURL, name: "\0"},
      fields: field
    }
    msg.channel.sendMessage('', false, embed)
  }
}

Commands.shimasay = {
  name: 'shimasay',
  help: "Talk for me",
  hidden: true,
  level: 5,
  fn: function (msg, suffix, bot) {

    if (suffix.length == 0) {
      msg.channel.sendMessage('Please write the guild channel and text')
      return
    }
    var x = suffix.indexOf(" ");
    if(x<=0) {
      msg.channel.sendMessage("Please **ALSO** write the channel and text")
      return
    }
    var guildname = suffix.substring(0, x);
    var suff2 = suffix.substring(x+1)
    x = suff2.indexOf(" ");
    if(x<=0) {
      msg.channel.sendMessage("Please **ALSO** write the text")
      return
    }
    var channelname = suff2.substring(0, x);
    var text = suff2.substring(x+1)

    var gs = bot.Guilds.toArray()
    for (i = 0; i < gs.length; i++) {
      if(gs[i].name == guildname) {
        var cs = gs[i].channels
        for(j = 0; j< cs.length; j++) {
          if(cs[j].isGuildText && cs[j].name == channelname)
            {
              msg.channel.sendMessage("_" + text + "_ sent to **" + channelname + "** in **" + guildname + "**")
              cs[j].sendMessage(text)
              return
            }
        }
        msg.channel.sendMessage("Channel **" + channelname + "** not found!")
      }
    }
    msg.channel.sendMessage("Guild **" + guildname + "** not found!")
  }
}

exports.Commands = Commands
