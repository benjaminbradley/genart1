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

// this function evolves a numerical value from init_val to final_val via a given percentage change factor
// positive factor will effect accelerating growth, negative factor = decelerating
// minimum per-invocation change of 1 ensures that cur_val will eventually reach final_val, no matter how small the factor
// max value checks ensure that cur_value will never pass final_val
function moveToward(init_val, cur_val, final_val, factor) {
  val_range = Math.abs(final_val - init_val);
  rel_val= Math.abs(cur_val - init_val);
  if(final_val < init_val) factor *= -1;
  rel_newval = Math.ceil(rel_val * factor);
  var orig = cur_val;
  new_val = init_val + rel_newval;
  if(factor > 0 && new_val > final_val) {
    new_val = final_val;
  } else if(factor < 0 && new_val < final_val) {
    new_val = final_val;
  }
  if(orig == new_val && new_val != final_val) {
    new_val += (factor < 0 ? -1 : 1);
  }
  return new_val;
}

function getDelay(default_ms) {
  if(window.location.search.indexOf('debug') >= 0) {
    return 0;
  } else {
    return default_ms;
  }
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
  setTimeout(function(){generate_art(user_seed);}, 200);  // initiate with a slight delay to give mobile devices time to hide the keyboard
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
  var max_stars = 4 * Math.log(10 + Math.abs(input_seed));
  var star_min_height_pct = 0.7;
  var star_appearance_freq_ms = 3000;
  var color_palette_index = input_seed % 10;
  var color_palette_dict = [
    ['#b2b2b2', '#50394c', '#f4e1d2', '#ffef96'],
    ['#80ced6', '#d5f4e6', '#fefbd8', '#618685'],
    ['#034f84', '#92a8d1', '#f7cac9', '#f7786b'],
    ['#4040a1', '#36486b', '#618685', '#fefbd8'],
    ['#6b5b95', '#878f99', '#a2b9bc', '#b2ad7f'],
    ['#622569', '#b8a9c9', '#d6d4e0', '#5b9aa0'],
    ['#c83349', '#e06377', '#eeac99', '#f9d5e5'],
    ['#ff7b25', '#d64161', '#6b5b95', '#feb236'],
    ['#d96459', '#f2ae72', '#588c7e', '#f2e394'],
    ['#b2ad7f', '#878f99', '#a2b9bc', '#6b5b95']
  ];
  var color_palette = color_palette_dict[color_palette_index];
  var bg_color = color_palette[0];
  var secondary_colors = color_palette.slice(1);

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
      setTimeout(makeStar, getDelay(randInt(star_appearance_freq_ms)));
    }
  }
  makeStar();

  // draw some plant stalks
  var max_stalks = Math.ceil(canvas_w / 500 * Math.log(1 + input_seed/100));
  var num_stalks = 0;
  var stalk_y_min = Math.ceil(star_max_y*1.2);
  var stalk_y_max = canvas_h;
  var stalk_height_min = canvas_h*0.1;
  var stalk_height_max = canvas_h*0.3;
  // define Plant class
  function Plant() {
    var self = this;
    // declare and initialize instance attributes
    this.stalk_svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.stalk_x = randInt(canvas_w);
    this.stalk_height_final = randInt(stalk_height_max-stalk_height_min)+stalk_height_min;
    this.stalk_height_init = 10;
    this.stalk_height_cur = this.stalk_height_init;
    var stalk_bez_xrange = this.stalk_height_final;
    this.stalk_bottom_y = randInt(stalk_y_max-stalk_y_min)+stalk_y_min;
    this.stalk_top_y_final = this.stalk_bottom_y-this.stalk_height_final;
    this.stalk_top_y_init = this.stalk_bottom_y-this.stalk_height_cur;
    this.stalk_top_y_cur = this.stalk_top_y_init;
    this.stalk_b1_x_final = this.stalk_x+randInt(stalk_bez_xrange)-Math.floor(stalk_bez_xrange/2);
    this.stalk_b1_x_init = this.stalk_x;
    this.stalk_b1_x_cur = this.stalk_b1_x_init;
    this.stalk_b1_y_final = this.stalk_bottom_y-randInt(this.stalk_height_final);
    this.stalk_b1_y_init = this.stalk_bottom_y;
    this.stalk_b1_y_cur = this.stalk_b1_y_init;
    this.stalk_b2_x_final = this.stalk_x+randInt(stalk_bez_xrange)-Math.floor(stalk_bez_xrange/2);
    this.stalk_b2_x_init = this.stalk_x;
    this.stalk_b2_x_cur = this.stalk_b2_x_init;
    this.stalk_b2_y_final = this.stalk_top_y_final+randInt(this.stalk_height_final)-Math.floor(this.stalk_height_final/2);
    this.stalk_b2_y_init = this.stalk_top_y_cur;
    this.stalk_b2_y_cur = this.stalk_b2_y_init;
    this.updateDef = function() {
      this.stalk_height_cur = moveToward(this.stalk_height_init, this.stalk_height_cur, this.stalk_height_final, 1.1);
      var stalk_bez_xrange = this.stalk_height_cur;
      this.stalk_top_y_cur = this.stalk_bottom_y-this.stalk_height_cur;
      this.stalk_b1_x_cur = moveToward(this.stalk_b1_x_init, this.stalk_b1_x_cur, this.stalk_b1_x_final, 1.01);
      this.stalk_b1_y_cur = moveToward(this.stalk_b1_y_init, this.stalk_b1_y_cur, this.stalk_b1_y_final, 1.05);
      this.stalk_b2_x_cur = moveToward(this.stalk_b2_x_init, this.stalk_b2_x_cur, this.stalk_b2_x_final, 1.01);
      this.stalk_b2_y_cur = this.stalk_top_y_cur;
      var stalk_def =
        'M'+this.stalk_x+','+this.stalk_bottom_y+
        'C'+this.stalk_b1_x_cur+','+this.stalk_b1_y_cur+
        ','+this.stalk_b2_x_cur+','+this.stalk_b2_y_cur+
        ','+this.stalk_x+','+this.stalk_top_y_cur;
      this.stalk_svg.setAttribute("d", stalk_def);
    };
    this.updateDef();
    this.stalk_svg.setAttribute("stroke", secondary_colors[randInt(secondary_colors.length)]);
    this.stalk_svg.setAttribute("fill", 'transparent');
    this.stalk_svg.setAttribute("style", 'stroke-width:3px');
    svg.appendChild(this.stalk_svg);
    // define evolution function
    this.evolve = function() {
      self.updateDef();
      // continue updating if needed
      if(this.stalk_height_cur < this.stalk_height_final) {
        setTimeout(function(){self.evolve();}, 100);
      }
    };
    setTimeout(function(){self.evolve();}, 100);

  }
  function makeStalk() {
    p = new Plant();
    p.plant_id = num_stalks;
    num_stalks++;
    if(num_stalks < max_stalks) {
      setTimeout(makeStalk, getDelay(2500));
    }
  }
  makeStalk();
}