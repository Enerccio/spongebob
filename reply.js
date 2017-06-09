'use strict';

var snoo = require("snoowrap");

var conf = require("./conf");

var reddit = new snoo({
    userAgent: conf.reddit.user_agent,
    clientId: conf.reddit.apikey,
    clientSecret: conf.reddit.apisecret,
    username: conf.reddit.login.username,
    password: conf.reddit.login.password
});

function reply(postId, text) {
  text += "\n^(I am newborn bot and if I fuck up, please be kind 😞.) ^^(Source: https://github.com/Enerccio/spongebob)";
  reddit.getComment(postId).reply(text).catch(function (err) {
            console.log(err);
  });
}

module.exports = { reply : reply };
