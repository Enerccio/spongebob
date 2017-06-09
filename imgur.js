'use strict';

var imgur = require("imgur-node-api");

var conf = require("./conf");


imgur.setClientID(conf.imgur.client_id);

function upload(path, cb) {
  imgur.upload(path, function(err, res) {
    if (err) {
      console.log(err);
      return;
    }

    cb(res.data.link);
  })
}

//upload(conf.data.img_path, function(link) { console.log(link);});

module.exports = {
  upload : upload
};
