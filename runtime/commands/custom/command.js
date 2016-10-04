var Commands = []
var Logger = require('../../internal/logger.js').Logger
var config = require('../../../config.json')

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
  name: 'goodnght',
  help: 'Say GoodNight !',
  level: 0,
  fn: function (msg, suffix, bot) {
    if(msg.author.id == 155038222794227712)
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
    else
    {
      msg.reply('GoodNight /, Sleep tight!')
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
    var VC = msg.member.getVoiceChannel()
    VC.join()
    msg.channel.fetchMessages(1).then((result) => {
      bot.Messages.deleteMessages(result.messages)
    }).catch((error) => {
      Logger.error(error)
    })
  }
}

Commands.parrot = {
  name: 'parrot',
  help: 'remove parrot command message for nightbot',
  aliases:['p'],
  hidden: true,
  level: 0,
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
    else if(msg.author.id == 66792137647206400)
    {
        msg.reply("pls, go ask Billy gachiPls")
    }
    else
    {
      msg.reply("FUCK OFF!")
    }
  }
}


exports.Commands = Commands
