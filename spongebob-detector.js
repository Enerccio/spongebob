'use strict';

var conf = require("./conf");

var StringSet = require("stringset");

var cache = { c : new StringSet() };

function getUppercase(t) {
  return t.replace(/[^A-Z]/g, "").length;
}

function getLowercase(t) {
  return t.replace(/[^a-z]/g, "").length;
}

function isSpongeWord(word) {
  word = word.replace( /[^a-zA-Z]/g, "");
  if (word.length < 3)
    return false;
  if (word.length > 30)
    return false;
  var subs = word.substring(1, word.length-1);
  var upc = getUppercase(subs);
  var lwc = getLowercase(subs);
  return (upc >= conf.reddit.detector.min_uppercase ||
    (upc >= conf.reddit.detector.min_mixed_uppercase &&
      lwc >= conf.reddit.detector.min_mixed_lowercase)) &&
      !(getUppercase(word) == (getUppercase(word) + getLowercase(word)));
}

function isSpongebobText(text) {
  if (text.includes("http"))
    return false;

  var segments = text.match(/[^-\r\n\t\f/ \(\)\[\]\{\}]+/g);
  if (segments === null || segments === undefined)
    return false;
  var cnt = 0;
  var sponged = 0;
  for (var i=0; i<segments.length; i++) {
    cnt += 1;
    if (isSpongeWord(segments[i])) {
      sponged += 1;
    }
  }
  var test = ((1.0/cnt)*sponged) >= conf.reddit.detector.min_num_words_threshold &&
    cnt >= conf.reddit.detector.min_num_words_count;

  if (test) {
    if (cache.c.size() > 100000) {
      cache.c = new StringSet();
    }

    if (cache.c.has(text)) {
      console.log("duplicate [[" + text + "]]");
      return false;
    }

    cache.c.add(text);
    return true;
  }
  return false;
}

module.exports = {
  isSpongebobText : isSpongebobText
};

//console.log(isSpongebobText(""));
