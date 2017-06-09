'use strict';

var rs = require("reddit-stream");
var decode = require("unescape");
var textVersion = require("textversionjs");
var strip = require("strip-markdown");
var remark = require("remark");
var processor = remark().use(strip);
var tmp = require("tmp");
var fs = require("fs");

var conf = require("./conf");
var detector = require("./spongebob-detector.js");
var reply = require("./reply.js");
var draw = require("./draw.js");
var imgur = require("./imgur.js");

var auth = {
  "username" : conf.reddit.login.username,
  "password" : conf.reddit.login.password,
  "app" : {
    "id" : conf.reddit.apikey,
    "secret": conf.reddit.apisecret
  }
};

var postsStream = new rs("posts", "all", conf.reddit.user_agent, auth);
var commentStream = new rs("comments", "all", conf.reddit.user_agent, auth);

postsStream.start();
commentStream.start();

postsStream.on("new", function(posts) {
  posts.forEach(function(post) {
    operate(post.data.body_html, post.data);
  })
});
postsStream.on("error", function() {});

commentStream.on("new", function(comments) {
  comments.forEach(function(comment) {
    operate(comment.data.body_html, comment.data);
  })
});
commentStream.on("error", function() {});

function pureText(text, cb) {
  text = decode(textVersion(decode(text)));
  processor.process(text, cb);
}

function operate(body, data) {
  if (body !== undefined) {
    pureText(body, function(err, file) {
      var text = String(file);
      if (detector.isSpongebobText(text) && conf.reddit.username != data.author) {
        console.log("passed: <<<" + text + ">>>");
        tmp.tmpName(function(err, f) {
          draw.createImage(text, f, function() {
            imgur.upload(f, function(link) {
              var msg = "[" + text + "](" + link + ")";
              reply.reply(data.id, msg);
              fs.unlink(f);
            });
          });
        });
      }
    });
  }
}
