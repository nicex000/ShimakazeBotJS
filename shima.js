/* eslint-disable brace-style */
'use strict'
process.title = 'Shimakaze-chan'

var Config

try {
  Config = require('./config.json')
} catch (e) {
  console.log('\nShimakaze-chan encountered an error while trying to load the config file, please resolve this issue and restart Shimakaze-chan\n\n' + e.message)
  process.exit()
}

var argv = require('minimist')(process.argv.slice(2))
var Logger = require('./runtime/internal/logger.js').Logger
var Bezerk = require('./runtime/internal/bezerk.js')

var Discordie = require('discordie')
var Event = Discordie.Events
var bot
var runtime = require('./runtime/runtime.js')
var timeout = runtime.internal.timeouts
var commands = runtime.commandcontrol.Commands
var aliases = runtime.commandcontrol.Aliases
var datacontrol = runtime.datacontrol
var debugChannel
var streamingGuilds = ['345295036809740289', '132637465352732672', '376294828184567810'] //lolis, Firestorm1113, Minh's servers

Logger.info('Initializing...')

if (argv.shardmode && !isNaN(argv.shardid) && !isNaN(argv.shardcount)) {
  Logger.info('Starting in ShardMode, this is shard ' + argv.shardid, {
    shardInfo: [argv.shardcount, argv.shardid]
  })
  bot = new Discordie({
    shardId: argv.shardid,
    shardCount: argv.shardcount
  })
} else {
  bot = new Discordie()
}

start()

var bugsnag = require('bugsnag')
bugsnag.register(Config.api_keys.bugsnag)

bot.Dispatcher.on(Event.GATEWAY_READY, function () {
  bot.Users.fetchMembers()
  runtime.internal.versioncheck.versionCheck(function (err, res) {
    if (err) {
      Logger.error('Version check failed, ' + err)
    } else if (res) {
      Logger.info(`Version check: ${res}`)
    }
  })
  Logger.info('Ready to start!', {
    botID: bot.User.id,
    version: require('./package.json').version
  })
  Logger.info(`Logged in as ${bot.User.username}#${bot.User.discriminator} (ID: ${bot.User.id}) and serving ${bot.Users.length} users in ${bot.Guilds.length} servers.`)
  var gs = bot.Guilds.toArray()
  for (var i = 0; i < gs.length; i++) {
    if (gs[i].name == "lolis") {
      var cs = gs[i].channels
      for (var j = 0; j < cs.length; j++) {
        if (cs[j].isGuildText && cs[j].name == "bot-testing-room") {
          debugChannel = cs[j]
        }
      }
    }
  }
  bot.User.setStatus('online', {
    name: 'with Rensouhou-chan',
    type: 0
  })
  if (argv.shutdownwhenready) {
    console.log('Shimakaze is going to bed')
    process.exit(0)
  }
})

bot.Dispatcher.on(Event.MESSAGE_CREATE, function (c) {
  if (!bot.connected) return
  datacontrol.users.isKnown(c.message.author)
  var prefix
  var loggingGuild = {}
  for (var k in c.message.guild) {
    loggingGuild[k] = c.message.guild[k]
  }
  loggingGuild.roles = []
  loggingGuild.emojis = []
  datacontrol.customize.prefix(c.message).then(function (p) {
    if (!p) {
      prefix = Config.settings.prefix
    } else {
      prefix = p
    }
    if (bot.User.id == 476151220004978689) {
      prefix = prefix + prefix
    }
    var cmd
    var suffix
    var message = c.message.content
    if (c.message.author.id === bot.User.id) {
      return
    }
    if (c.message.author.bot) {
      if (c.message.author.id == 386449093385388053 || c.message.author.id == 422330233035948032 || c.message.author.id == 476151220004978689 || c.message.author.id == 191981451460345856) {
        if (message.indexOf(prefix) === 1 || message.indexOf(bot.User.mention) === 1 || message.indexOf(bot.User.nickMention) === 1) {
          message = message.slice(1)
        }
      } else {
        return
      }
    }
    if (message.indexOf(prefix) === 0) {
      cmd = message.substr(prefix.length).split(' ')[0].toLowerCase()
      suffix = message.substr(prefix.length).split(' ')
      suffix = suffix.slice(1, suffix.length).join(' ')
    } else if (message.indexOf(bot.User.mention) === 0) {
      cmd = message.substr(bot.User.mention.length + 1).split(' ')[0].toLowerCase()
      suffix = message.substr(bot.User.mention.length).split(' ')
      suffix = suffix.slice(2, suffix.length).join(' ')
    } else if (message.indexOf(bot.User.nickMention) === 0) {
      cmd = message.substr(bot.User.nickMention.length + 1).split(' ')[0].toLowerCase()
      suffix = message.substr(bot.User.nickMention.length).split(' ')
      suffix = suffix.slice(2, suffix.length).join(' ')
    }

    if (cmd === 'help') {
      runtime.commandcontrol.helpHandle(c.message, suffix)
    }
    if (aliases[cmd]) {
      cmd = aliases[cmd].name
    }
    if (commands[cmd]) {
      if (typeof commands[cmd] !== 'object') {
        return // ignore JS build-in array functions
      }
      if (c.message.isPrivate) {
        Logger.info(`Executing <${c.message.resolveContent()}> from ${c.message.author.username} -> in DM`)
      } else {
        Logger.info(`Executing <${c.message.resolveContent()}> from ${c.message.author.username} ->in ${c.message.guild.name} #${c.message.channel.name}`)
      }
      if (commands[cmd].level === 'master') {
        if (Config.permissions.master.indexOf(c.message.author.id) > -1) {
          try {
            commands[cmd].fn(c.message, suffix, bot)
          } catch (e) {
            c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
            Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`, {
              // author: c.message.author,
              guild: loggingGuild,
              // botID: bot.User.id,
              // cmd: cmd,
              error: e
            })
          }
        } else {
          c.message.channel.sendMessage('This command is only for the bot owner.')
        }
      } else if (!c.message.isPrivate) {
        datacontrol.permissions.checkLevel(c.message, c.message.author.id, c.message.member.roles).then(r => {
          if (r !== -1) {
            timeout.check(commands[cmd], c.message.guild.id, c.message.author.id).then(t => {
              if (t !== true) {
                datacontrol.customize.reply(c.message, 'timeout').then(x => {
                  if (x === null || x === 'default') {
                    c.message.channel.sendMessage(`Wait ${Math.round(t)} more seconds before using that again.`)
                  } else {
                    c.message.channel.sendMessage(x.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name).replace(/%timeout/, Math.round(t)))
                  }
                })
              } else {
                if (r >= commands[cmd].level) {
                  if (!commands[cmd].hasOwnProperty('nsfw')) {
                    try {
                      commands[cmd].fn(c.message, suffix, bot)
                    } catch (e) {
                      c.message.channel.sendMessage('An error occurred while trying to process this command, you should let the bot author know. \n```' + e + '```')
                      Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`, {
                        // author: c.message.author,
                        guild: loggingGuild,
                        // botID: bot.User.id,
                        // cmd: cmd,
                        error: e
                      })
                    }
                  } else {
                    datacontrol.permissions.checkNSFW(c.message).then(function (q) {
                      if (q) {
                        try {
                          commands[cmd].fn(c.message, suffix, bot)
                        } catch (e) {
                          c.message.channel.sendMessage('An error occurred while trying to process this command, you should let the bot author know. \n```' + e + '```')
                          Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`, {
                            // author: c.message.author,
                            guild: loggingGuild,
                            // botID: bot.User.id,
                            // cmd: cmd,
                            error: e
                          })
                        }
                      } else {
                        datacontrol.customize.reply(c.message, 'nsfw').then((d) => {
                          if (d === null || d === 'default') {
                            c.message.channel.sendMessage('This channel does not allow NSFW commands, enable them first with `setnsfw`')
                          } else {
                            c.message.channel.sendMessage(d.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name))
                          }
                        }).catch((e) => {
                          Logger.error('Reply check error, ' + e, {
                            replyType: 'nsfw',
                            // author: c.message.author,
                            guild: loggingGuild,
                            // botID: bot.User.id,
                            // cmd: cmd,
                            cmd: cmd
                          })
                        })
                      }
                    }).catch(function (e) {
                      Logger.error('Permission error: ' + e, {
                        // author: c.message.author,
                        guild: loggingGuild,
                        // botID: bot.User.id,
                        // cmd: cmd,
                        cmd: cmd
                      })
                    })
                  }
                } else {
                  datacontrol.customize.reply(c.message, 'perms').then((u) => {
                    if (u === null || u === 'default') {
                      if (r > -1 && !commands[cmd].hidden) {
                        var reason = (r > 4) ? '**This is a master user only command**, ask the bot owner to add you as a master user if you really think you should be able to use this command.' : 'Ask the server owner to modify your level with `setlevel`.'
                        c.message.channel.sendMessage('You have no permission to run this command!\nYou need level ' + commands[cmd].level + ', you have level ' + r + '\n' + reason)
                      }
                    } else {
                      c.message.channel.sendMessage(u.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name).replace(/%nlevel/, commands[cmd].level).replace(/%ulevel/, r))
                    }
                  }).catch((e) => {
                    Logger.error('Reply check error, ' + e, {
                      replyType: 'perms',
                      // author: c.message.author,
                      guild: loggingGuild,
                      // botID: bot.User.id,
                      // cmd: cmd,
                      cmd: cmd,
                      error: e
                    })
                  })
                }
              }
            })
          }
        }).catch(function (e) {
          Logger.error('Permission error: ' + e, {
            // author: c.message.author,
            guild: loggingGuild,
            // botID: bot.User.id,
            // cmd: cmd,
            error: e
          })
        })
      } else {
        if (commands[cmd].noDM) {
          c.message.channel.sendMessage('This command cannot be used in DM, invite the bot to a server and try this command again.')
        } else {
          datacontrol.permissions.checkLevel(c.message, c.message.author.id, []).then(function (r) {
            if (r !== -1 && r >= commands[cmd].level) {
              try {
                commands[cmd].fn(c.message, suffix, bot)
              } catch (e) {
                c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
                Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`)
              }
            } else {
              if (r === -1) {
                c.message.channel.sendMessage('You have been blacklisted from using this bot, for more help contact my developers.')
              } else {
                c.message.channel.sendMessage('You have no permission to run this command in DM, you probably tried to use restricted commands that are either for master users only or only for server owners.')
              }
            }
          }).catch(function (e) {
            Logger.error('Permission error: ' + e, {
              // author: c.message.author,
              guild: loggingGuild,
              // botID: bot.User.id,
              // cmd: cmd,
              error: e
            })
          })
        }
      }
    }
  }).catch(function (e) {
    if (e === 'No database') {
      Logger.warn('Database file missing for a server, creating one now...')
    } else {
      Logger.error('Prefix error: ' + e, {
        // author: c.message.author,
        guild: loggingGuild,
        // botID: bot.User.id,
        // cmd: cmd,
        error: e
      })
    }
  })
})

bot.Dispatcher.on(Event.GUILD_MEMBER_ADD, function (s) {
  datacontrol.permissions.isKnown(s.guild)
  datacontrol.customize.isKnown(s.guild)
  datacontrol.customize.check(s.guild).then((r) => {
    if (r === 'on' || r === 'channel') {
      datacontrol.customize.reply(s, 'welcomeMessage').then((x) => {
        if (x === null || x === 'default') {
          if (s.guild.id == 98922706317103104) {
            s.guild.textChannels.forEach(function (ch) {
              if (ch.id == 186873358636285952) {
                var suffix = -1 + ' anti'
                suffix = suffix.split(' ')
                ch.sendMessage(`Welcome ${s.member.username} to the server!`).then((m) => datacontrol.permissions.adjustLevel(m, m.mentions, parseFloat(suffix[0]), m.mention_roles).then(function () {

                }).catch(function (err) {
                  msg.channel.sendMessage('Help! Something went wrong!')
                  Logger.error(err)
                }))
              }
            })
          } else {
            s.guild.generalChannel.sendMessage(`Welcome ${s.member.username} to ${s.guild.name}!`)
          }
        } else {
          s.guild.generalChannel.sendMessage(x.replace(/%user/g, s.member.mention).replace(/%server/g, s.guild.name))
        }
      }).catch((e) => {
        Logger.error(e)
      })
    } else if (r === 'private') {
      datacontrol.customize.reply(s, 'welcomeMessage').then((x) => {
        if (x === null || x === 'default') {
          s.member.openDM().then((g) => g.sendMessage(`Welcome to ${s.guild.name}! Please enjoy your stay!`))
        } else {
          s.member.openDM().then((g) => g.sendMessage(x.replace(/%user/g, s.member.mention).replace(/%server/g, s.guild.name)))
        }
      }).catch((e) => {
        Logger.error(e)
      })
    }
  }).catch((e) => {
    Logger.error(e)
  })
  datacontrol.users.isKnown(s.member)
})

bot.Dispatcher.on(Event.GUILD_CREATE, function (s) {
  if (!bot.connected) return
  if (!s.becameAvailable) {
    datacontrol.permissions.isKnown(s.guild)
    datacontrol.customize.isKnown(s.guild)
  }
})

bot.Dispatcher.on(Event.GUILD_UPDATE, g => {
  if (!bot.connected) return
  var guild = g.getChanges()
  if (guild.before.owner_id !== guild.after.owner_id) {
    datacontrol.permissions.updateGuildOwner(g.guild)
  }
})

bot.Dispatcher.on(Event.GATEWAY_RESUMED, function () {
  Logger.info('Connection to the Discord gateway has been resumed.')
})

bot.Dispatcher.on(Event.PRESENCE_MEMBER_INFO_UPDATE, (user) => {
  datacontrol.users.isKnown(user.new).then(() => {
    if (user.old.username !== user.new.username) {
      datacontrol.users.namechange(user.new).catch((e) => {
        Logger.error(e)
      })
    }
  })
})

bot.Dispatcher.on(Event.PRESENCE_UPDATE, (e) => {
  if (e.user.bot) { // ignore bots
    return
  }

  var bIsStreamingGuild = false
  streamingGuilds.forEach(function (guild) { // make it only work on selected servers
    if (e.guild.id === guild) {
      bIsStreamingGuild = true
    }
  })
  if (!bIsStreamingGuild) {
    return
  }

  var user = e.user
  if (user.id === undefined) {
    user = e.member
  }
  var add = false
  var streamingStatusChanged = false
  var guildsSuccess = 0
  var guildsNoMember = 0
  var guildsNoRole = 0
  streamingGuilds.forEach(function (guildID) {
    var guild = bot.Guilds.find((g) => g.id === guildID)
    var role
    var member

    if (user.game !== null && user.game.type === 1) {   // 1 for streaming
      if (e.user.previousGame === null || user.previousGame.type !== 1) {
        streamingStatusChanged = true
        add = true
        var canAssign = true
        member = guild.members.find((m) => m.id === user.id)
        if (member === undefined) {
          guildsNoMember++
          canAssign = false
        }
        role = guild.roles.find(r => r.name === 'Now Streaming')
        if (role === undefined) {
          guildsNoRole++
          canAssign = false
        }
        if (canAssign) {
          guildsSuccess++
          member.assignRole(role).then(() => {
          }).catch((error) => {
            var debugString = 'Error adding role to *' + user.username + '* in **' + guild.name + '**. Error: ' + error
            debugChannel.sendMessage(debugString)
            Logger.warn('Failed to assign streaming role to ' + user.username)
          })
        }
      }
    } else if (user.previousGame !== null && user.previousGame.type === 1) { // 1 for streaming
      if (user.game === null || user.game.type !== 1) {
        streamingStatusChanged = true
        add = false
        var canUnassign = true
        member = guild.members.find((m) => m.id === user.id)
        if (member === undefined) {
          guildsNoMember++
          canUnassign = false
        }
        role = guild.roles.find(r => r.name === 'Now Streaming')
        if (role === undefined) {
          guildsNoRole++
          canUnassign = false
        }
        if (canUnassign) {
          guildsSuccess++
          member.unassignRole(role).then(() => {
          }).catch((error) => {
            var debugString = 'Error removing role from *' + user.username + '* in **' + guild.name + '**. Error: ' + error
            debugChannel.sendMessage(debugString)
            Logger.warn('Failed to unassign streaming role from ' + user.username)
          })
        }
      }
    }
  })
  if (!streamingStatusChanged) {
    return
  }
  var logMessage = user.username + (add ? ' started' : ' stopped') + ` streaming. ${guildsSuccess} guilds updated.` +
    (guildsSuccess < 1 ? ` ${guildsNoMember} guilds didn't have the member.` : '') +
    (guildsNoRole > 0 ? ` ${guildsNoRole} guilds didn't have the role.` : '')
  if (guildsNoRole > 0 || guildsSuccess < 1) {
    Logger.warn(logMessage)
  }
  else {
    Logger.info(logMessage)
  }
})

bot.Dispatcher.on(Event.GATEWAY_HELLO, (gatewayInfo) => {
  Logger.debug(`Gateway trace, ${gatewayInfo.data._trace}`, {
    botID: bot.User.id,
    gatewayTrace: gatewayInfo.data._trace
  })
})

bot.Dispatcher.on(Event.DISCONNECTED, function (e) {
  Logger.error('Disconnected from the Discord gateway: ' + e.error)
  Logger.info('Trying to login again...')
  start()
})

bot.Dispatcher.on(Event.VOICE_CHANNEL_JOIN, function (e) {
  if (bot.User.id === e.user.id) { // ignore self
    return
  }
  var connect = bot.VoiceConnections.find(function (connection) {
    return connection.voiceConnection.channelId === e.channelId
  })
  if (connect && connect.voiceConnection.guildId === '345295036809740289') { // make it only work on lolis server
    try {
      commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 1, bot)
    } catch (c) {
      Logger.info(c)
    }
  }
})

bot.Dispatcher.on(Event.VOICE_CHANNEL_LEAVE, function (e) {
  if (bot.User.id === e.user.id) { // ignore self
    return
  }
  var connect = bot.VoiceConnections.find(function (connection) {
    return connection.voiceConnection.channel.id === e.channelId
  })
  if (connect && connect.voiceConnection.guildId === '345295036809740289') { // make it only work on lolis server
    if (e.newChannelId === '345305120440844289') { // if user has been thrown in the dumpster
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 3, bot)
      } catch (c) {
        Logger.info(c)
      }
    } else {
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 2, bot)
      } catch (c) {
        Logger.info(c)
      }
    }
  }
})

bot.Dispatcher.on(Event.VOICE_USER_SELF_MUTE, function (e) {
  if (bot.User.id === e.user.id) { // ignore self
    return
  }
  var connect = bot.VoiceConnections.find(function (connection) {
    return connection.voiceConnection.channelId === e.channelId
  })
  if (connect && connect.voiceConnection.guildId === '345295036809740289') { // make it only work on lolis server
    if (e.state) {
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 4, bot)
      } catch (c) {
        Logger.info(c)
      }
    } else {
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 5, bot)
      } catch (c) {
        Logger.info(c)
      }
    }
  }
})

bot.Dispatcher.on(Event.VOICE_USER_SELF_DEAF, function (e) {
  if (bot.User.id === e.user.id) { // ignore self
    return
  }
  var connect = bot.VoiceConnections.find(function (connection) {
    return connection.voiceConnection.channelId === e.channelId
  })
  if (connect && connect.voiceConnection.guildId === '345295036809740289') { // make it only work on lolis server
    if (e.state) {
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 6, bot)
      } catch (c) {
        Logger.info(c)
      }
    } else {
      try {
        commands['teamspeaksimulator'].fn(connect.voiceConnection.guildId, 7, bot)
      } catch (c) {
        Logger.info(c)
      }
    }
  }
})

bot.Dispatcher.onAny((type, data) => {
  if (data.type === 'READY' || type === 'VOICE_CHANNEL_JOIN' || type === 'VOICE_CHANNEL_LEAVE' || type.indexOf('VOICE_USER') === 0 || type === 'PRESENCE_UPDATE' || type === 'TYPING_START' || type === 'GATEWAY_DISPATCH') return
  Bezerk.emit(type, data, bot)
})

process.on('unhandledRejection', (reason, p) => {
  if (p !== null && reason !== null) {
    bugsnag.notify(new Error(`Unhandled promise: ${require('util').inspect(p, {depth: 3})}: ${reason}`))
  }
})

function start () {
  try {
    Config = require('./config.json')
  } catch (e) {
    Logger.error('Config error: ' + e)
    process.exit(0)
  }
  if (Config.bot.isbot) {
    bot.connect({
      token: Config.bot.token
    })
  } else {
    bot.connect({
      email: Config.bot.email,
      password: Config.bot.password
    })
  }
}
