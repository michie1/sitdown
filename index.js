var Promise = require('promise');

const config = require('./config.js');
const token = config('token');

var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var rtm = new RtmClient(token);

getUsers = function getUsers () {
  return config('users'); 
}

getUserByName = function getUserByName (name, users) {
  const filteredUsers = users.filter(function (user) {
    return user.name === name;
  });
  if (filteredUsers.length === 1) {
    return filteredUsers[0];
  } else {
    return null;
  }
}



/*
var web = new WebClient(token);
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

sendDM = function sendDM(name, text ) {
  const user = getUserByName(name, getUsers());
  if (user !== null) {
    rtm.sendMessage(text, user.channel);
  }
};


rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});


rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  sendDM('michiel', 'hoi!');
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    console.log('Message:', message);
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
    console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
    console.log('Reaction removed:', reaction);
});

rtm.start();
