// input prompt-text:
function init_inputs() {
  $('input[type="text"]').click(function() {
    if(typeof $(this).attr('data-prompt') == 'undefined') {
      $(this).attr('data-prompt', $(this).val());
    }
    if($(this).val() == $(this).attr('data-prompt')) {
      $(this).val('');
    }
  });
  $('input[type="text"]').blur(function() {
    if($(this).val() == '') {
      $(this).val($(this).attr('data-prompt'));
    }
  });
}

//ref: https://gist.github.com/blixt/f17b47c62508be59987b
function Random(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) this._seed += 2147483646;
}
Random.prototype.next = function () {
  return this._seed = this._seed * 16807 % 2147483647;
};
Random.prototype.nextFloat = function () {
  return (this.next() - 1) / 2147483646;
};
var rand;
function randInt(max) {
  return Math.floor(max*rand.nextFloat());
}

function doit() {
  // get user input
  var user_seed = $('#seed').val();
  // validate user input
  if(parseInt(user_seed) != user_seed) {
    user_seed = 0;
  } else {
    user_seed = parseInt(user_seed);
  }
  //TODO
  // if it's all good, generate some art!
  rand = new Random(user_seed);
  // hide user input form
  $('#user-input').hide();
  generate_art(user_seed);
}

window.onload = function() {
  init_inputs();
  $('#doit').click(function() {
    doit();
  });
  $('#seed').keypress(function(e) {
    if(e.which == 13) {
      doit();
    }
  });
}

function generate_art(input_seed) {
  // GLOBAL CONSTANTS
  //TODO
  var max_stars = 100;  //TODO: base on input_seed
  var star_min_height_pct = 0.7;
  var star_appearance_freq_ms = 3000;
  var colors = ['gray', 'teal', 'navy', 'blue', '#8000ff', 'purple', 'red', '#ff4000', '#ff8000', 'olive'];
  var bg_color = colors[input_seed % 10];

  // show input seed in title
  var init_title = $(document).attr("title");
  $(document).attr("title", init_title + ' | SEED: '+input_seed);

  // create svg
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var canvas_w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var canvas_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  console.log("Canvas size: "+canvas_w+'x'+canvas_h);
  svg.setAttribute('width', canvas_w);
  svg.setAttribute('height', canvas_h);
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  document.body.appendChild(svg);

  // set up background gradient
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  var bg_grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  bg_grad.setAttribute("id","bg-grad");
  bg_grad.setAttribute("x1","0%");
  bg_grad.setAttribute("y1","0%");
  bg_grad.setAttribute("x2","0%");
  bg_grad.setAttribute("y2","100%");
  var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset","30%");
  stop1.setAttribute("stop-color","black");
  bg_grad.appendChild(stop1);
  var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset","100%");
  stop2.setAttribute("stop-color", bg_color);
  bg_grad.appendChild(stop2);
  defs.appendChild(bg_grad);
  svg.appendChild(defs);

  var bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x","0");
  bg.setAttribute("y","0");
  bg.setAttribute("width","100%");
  bg.setAttribute("height","100%");
  bg.setAttribute("fill","url(#bg-grad)");
  svg.appendChild(bg);


  // draw some stars
  var star_max_y = star_min_height_pct*canvas_h;
  var num_stars = 0;
  function makeStar() {
    var star = document.createElementNS("http://www.w3.org/2000/svg", "text");
    star.textContent = ".";
    var star_y = randInt(star_max_y);
    var star_opacity = (star_max_y-star_y) / star_max_y;
    star.setAttribute("x", randInt(canvas_w));
    star.setAttribute("y", star_y);
    star.setAttribute("opacity", star_opacity);
    star.setAttribute("fill", 'white');
    svg.appendChild(star);
    num_stars++;
    if(num_stars < max_stars) {
      setTimeout(makeStar, randInt(star_appearance_freq_ms));
    }
  }
  makeStar();

  // draw some plant stalks
  var max_stalks = Math.ceil(canvas_w / 100);
  var num_stalks = 0;
  var stalk_y_min = star_max_y*1.2;
  var stalk_y_max = canvas_h;
  var stalk_height_min = canvas_h*0.1;
  var stalk_height_max = canvas_h*0.3;
  function makeStalk() {
    var stalk = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var stalk_x = randInt(canvas_w);
    var stalk_height = randInt(stalk_height_max-stalk_height_min)+stalk_height_min;
    var stalk_bez_xrange = stalk_height;
    var stalk_bottom_y = randInt(stalk_y_max-stalk_y_min)+stalk_y_min;
    var stalk_top_y = stalk_bottom_y-stalk_height;
    var stalk_b1_x = stalk_x+randInt(stalk_bez_xrange)-stalk_bez_xrange/2;
    var stalk_b1_y = stalk_bottom_y-randInt(stalk_height);
    var stalk_b2_x = stalk_x+randInt(stalk_bez_xrange)-stalk_bez_xrange/2;
    var stalk_b2_y = stalk_top_y+randInt(stalk_height)-stalk_height/2;
    var stalk_def = 
      'M'+stalk_x+','+stalk_bottom_y+
      'C'+stalk_b1_x+','+stalk_b1_y+
      ','+stalk_b2_x+','+stalk_b2_y+
      ','+stalk_x+','+stalk_top_y;
    stalk.setAttribute("d", stalk_def);
    stalk.setAttribute("stroke", 'white');
    stalk.setAttribute("fill", 'transparent');
    stalk.setAttribute("style", 'stroke-width:3px');
    svg.appendChild(stalk);
    num_stalks++;
    if(num_stalks < max_stalks) {
      setTimeout(makeStalk, 300);
    }
  }
  makeStalk();
}