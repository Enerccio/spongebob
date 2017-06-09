'use strict';

var gd = require("node-gd");

var conf = require("./conf");

var fontPath = conf.data.font_path;
var src = gd.createFromJpeg(conf.data.img_path);

function sizeReq(str, src, color) {
    var data = src.stringFTBBox(color, fontPath, 18, 0, 0, 0, str);
    return {
      w: data[2],
      h: data[1]-data[7]
    };
}

function createImage(text, outputfile, cb) {
  var tlines = text.split("\n");
  var w = src.width;
  var h = src.height;
  var lines = [];

  for (var i=0; i<tlines.length; i++) {
      var l = tlines[i];

      while (l != null) {
          var tl = l;
          if (l.length > 50) {
            tl = l.substring(0, 50);
            l = l.replace(tl, "");
            if (l.length == 0) {
              l = null;
            }
          } else {
            l = null;
          }

          var dimensions = sizeReq(tl, src, 0x000000);
          lines.push({line: tl, dim: dimensions});
          w = Math.max(dimensions.w, w);
          h += dimensions.h + 3;
      }
  }

  gd.createTrueColor(w, h, function(err, img) {
    if (err) {
      console.log(err);
      return;
    }

    img.filledRectangle(0, 0, img.width, img.height, 0xffffff);
    var offs = 0;

    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      offs += line.dim.h;
      img.stringFT(0x000000, fontPath, 18, 0, 0, offs, line.line, false);
      offs += 3;
    }

    src.copyResized(img, 0, offs, 0, 0, img.width, src.height, src.width, src.height);

    img.savePng(outputfile, function(err) {
      img.destroy();
      if (err) {
        console.log(err);
      } else {
          cb();
      }
    });
  });
}

//createImage("Hello, world", "/tmp/aaa.png", function() { console.log("ok"); })
//createImage("Longer, text! AAA BBB CCC DDD EEE FFF\nGGGGGGGGGGGGGGGGGGGGGGGSDASDASDASDASDASDASDASDASDASGGGGGGGGGGGERGGGGOOOO", "/tmp/aab.png", function() { console.log("ok"); })

module.exports = {
  createImage : createImage
};
