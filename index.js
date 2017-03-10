var Promise = require('promise');
var schedule = require('node-schedule');

const config = require('./config.js');
const token = config('token');

var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var rtm = new RtmClient(token);

const answers = {};

addAnswer = function addAnswer(user, answer) {
  console.log('addAnswer');
  answers[user].push(answer);
  console.log('answers', answers);
}

clearAnswers = function clearAnswers() {
  console.log('clearAnswers');
  config('users').forEach(function (user) {
    answers[user.id] = [];
  });
  console.log('answers', answers);
}

getUsers = function getUsers () {
  return config('users'); 
}

getUserByName = function getUserByName (name, users) {
  console.log('getUserByName');
  const filteredUsers = users.filter(function (user) {
    return user.name === name;
  });
  if (filteredUsers.length === 1) {
    return filteredUsers[0];
  } else {
    return null;
  }
}

getChannelIdByUserId = function getChannelIdByUserId (userId, users) {
  const filteredUsers = users.filter(function (user) {
    return user.id === userId;
  });
  if (filteredUsers.length === 1) {
    return filteredUsers[0].channel;
  } else {
    return null;
  }
}

isBottest = function isBottest (channel) {
  return channel === 'G4G5TRTHP';
}

var web = new WebClient(token);
/*
web.groups.list(function (err, res) {
  console.log(err, res);
});
*/

/*
web.users.list(function (err, res) {
  if (err === undefined && res.ok) {
    console.log(res);
    res.ims.map(function (im) {
      return {
        userChannelId: im.id,
        userId: im.user
      };
    });

  }

});
*/

sendDM = function sendDM(channelId, text ) {
  console.log('sendDM', text);
  rtm.sendMessage(text, channelId);
};

clearAnswers();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});


rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  onConnectionOpened();
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (isBottest(message.channel)) {
    addAnswer(message.user, message.text);
  }
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
    console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
    console.log('Reaction removed:', reaction);
});

rtm.start();

onConnectionOpened = function onConnectionOpened () {
  console.log('onConnectionOpened');
  var j = schedule.scheduleJob('0 * * * * *', function(){
    clearAnswers();
  });

  var k = schedule.scheduleJob('50 * * * * *', function(){
    console.log('Check answers');
    config('users').forEach(function (user) {
      console.log('user', user);
      if (answers[user.id].length === 0) {
        sendDM(getChannelIdByUserId(user.id, getUsers()), 'Please answer.');
      } else {
        sendDM(getChannelIdByUserId(user.id, getUsers()), 'Thanks for answering!');
      }
    });
  });
}
