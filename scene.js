// input prompt-text:
function init_inputs() {
  // parse query string, if available
  var qd = {};
  if(window.location.search) {
    window.location.search.substr(1).split("&").forEach(function(item) {var s = item.split("="), k = s[0], v = s[1] && decodeURIComponent(s[1]); (qd[k] = qd[k] || []).push(v)})
  }
  // set up event handlers
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
  // check query string for pre-defined seed
  if('seed' in qd) {
    $('#seed').val(qd['seed']);
    doit();
  }
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
  if(cur_val == null) return init_val;
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

function errorMessage(msg) {
  $('#message').html(msg);
}

function doit() {
  // get user input
  var user_seed = $('#seed').val();
  // validate user input
  if(parseInt(user_seed) != user_seed) {
    errorMessage("Input must be a whole number");
    return;
  } else {
    user_seed = parseInt(user_seed);
    if(user_seed < 0) {
      errorMessage("Input number must not be negative");
      return;
    }
  }
  errorMessage(""); // clear error message
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
  var max_stars = 4 * Math.log(10 + Math.abs(input_seed));
  var star_min_height_pct = 0.6;
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
  var secondary_colors = color_palette.slice(1,3);
  var highlight_color = color_palette[3];

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
  var stalk_y_min = Math.ceil(star_max_y*0.9);
  var stalk_y_max = canvas_h;
  var stalk_height_min = Math.floor(canvas_h*0.1);
  var stalk_height_max = Math.ceil(canvas_h*0.4);
  var minimum_stalk_length = 10;

  // define Point class
  function Point(_x, _y) {
    this.x = _x;
    this.y = _y;
  }

  // define Node class
  function Node(_plant, _parent, _child_index) {
    var self = this;
    // declare and initialize instance attributes and methods
    this.plant = _plant;
    this.parent = _parent;
    this.child_index = _child_index;
    this.depth = this.parent.depth + 1;
    this.get_child_base_point = function(_child_index) {
      //TODO(nodes have children): determine child base points based on vertices of the node
      return this.base_point;
    }
    this.get_child_base_dir = function(_child_index) {
      //TODO(nodes have children): set base dir based on vertices of the node, modified by parent's dir
      return 0;
    }
    this.cur_size = function() {
      return this.flower_tri_side;
    }
    this.appendSvgHierarchy = function(svg) {
      svg.appendChild(this.flower_svg);
      //TODO(nodes have children): append child structures foreach(child in this.children) child.appendSvgHierarchy(svg);
    }
    this.insertSvgHierarchy = function(svg, i) {
      // when inserting elements, insert children first
      //TODO(nodes have children): insert child structures foreach(child in this.children) child.insertSvgHierarchy(svg, i);
      svg.insertBefore(this.flower_svg, svg.childNodes[i]);
    }
    this.has_node = function() {
      return true;
    }

    // create child structures
    //TODO(nodes have children)

    // calculate initial dimensions and do initial render
    //TODO(cardinality): adapt flower_style to plant.cardinality
    this.flower_style = 1;
    //TODO(concave/convex): add concave/convex attribute for nodes
    this.flower_svg = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    base_dir = this.parent.get_child_base_dir(this.child_index);
    this.flower_rotation_final = base_dir - 180 + randInt(360);
    this.flower_rotation_init = base_dir;
    this.flower_rotation_cur = this.flower_rotation_init;
    this.flower_svg.setAttribute("style",
      "fill:"+highlight_color+
      ";stroke:"+this.plant.stalk_color+
      ";stroke-width:3px;fill-rule:nonzero;"
    );
    this.flower_svg.setAttribute("data-base-y", this.plant.base_y);

    this.updateDef = function() {
      this.flower_rotation_cur = moveToward(this.flower_rotation_init, this.flower_rotation_cur, this.flower_rotation_final, 1.1);
      if(this.flower_style == 1) { // triangular nodes
        this.base_point = this.parent.get_child_base_point(this.child_index);
        var flower_tri_base_y = this.base_point.y;
        var flower_tri_base_x = this.base_point.x;
        var flower_tri_side = Math.ceil(this.parent.cur_size() / 4);
        var botlt_x = flower_tri_base_x - Math.floor(flower_tri_side/2);
        var botlt_y = flower_tri_base_y;
        var botrt_x = flower_tri_base_x + Math.floor(flower_tri_side/2);
        var botrt_y = flower_tri_base_y;
        var top_x = flower_tri_base_x;
        var top_y = flower_tri_base_y - flower_tri_side;
        var triangle_def = botlt_x+','+botlt_y+' '+botrt_x+','+botrt_y+' '+top_x+','+top_y;
        this.flower_svg.setAttribute("points", triangle_def);
        var rotation_ctr_x = flower_tri_base_x;
        var rotation_ctr_y = flower_tri_base_y;
        this.flower_svg.setAttribute("transform", "rotate("+this.flower_rotation_cur+", "+rotation_ctr_x+", "+rotation_ctr_y+")");
      }
    };
    this.updateDef();
  }

  // define Stalk class
  function Stalk(_plant, _parent, _child_index, _stalk_height) {
    var self = this;
    // declare and initialize instance attributes and methods
    this.plant = _plant;
    this.parent = _parent;
    this.child_index = _child_index;
    this.depth = this.parent.depth + 1;
    this.get_child_base_point = function(_child_index) {
      // all children of the Stalk share the same origin point
      var base_x = this.stalk_x;
      var base_y = this.stalk_top_y_cur;
      return new Point(base_x, base_y);
    }
    this.get_child_base_dir = function(_child_index) {
      return this.parent.get_child_base_dir(0);
    }
    this.cur_size = function() {
      return this.stalk_height_cur;
    }
    this.appendSvgHierarchy = function(svg) {
      // when appending svgs, append self first
      svg.appendChild(this.stalk_svg);
      if(this.child)
        this.child.appendSvgHierarchy(svg);
    }
    this.insertSvgHierarchy = function(svg, i) {
      // when inserting elements, insert children first
      if(this.child)
        this.child.insertSvgHierarchy(svg, i);
      svg.insertBefore(this.stalk_svg, svg.childNodes[i]);
    }
    this.has_node = function() {
      return this.parent.has_node();
    }

    this.stalk_svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.stalk_svg.setAttribute("stroke", this.plant.stalk_color);
    this.stalk_svg.setAttribute("fill", 'transparent');
    this.stalk_svg.setAttribute("style", 'stroke-width:3px');
    this.stalk_height_final = _stalk_height;
    this.stalk_height_init = 10;
    var stalk_bez_xrange = this.stalk_height_final;
    this.stalk_b1_dx = randInt(stalk_bez_xrange)-Math.floor(stalk_bez_xrange/2);
    this.stalk_b2_dx = randInt(stalk_bez_xrange)-Math.floor(stalk_bez_xrange/2);
    this.stalk_b1_x_cur = null;
    this.stalk_b1_y_cur = null;
    this.stalk_b2_x_cur = null;
    this.stalk_b2_y_cur = null;

    // calculate initial dimensions and do initial render
    this.updateDef = function() {
      this.stalk_height_cur = moveToward(this.stalk_height_init, this.stalk_height_cur, this.stalk_height_final, 1.1);

      this.base_point = this.parent.get_child_base_point(this.child_index);
      this.stalk_x = this.base_point.x;
      this.stalk_bottom_y = this.base_point.y;
      this.stalk_top_y_final = this.stalk_bottom_y-this.stalk_height_final;
      this.stalk_top_y_init = this.stalk_bottom_y-this.stalk_height_cur;
      this.stalk_b1_x_final = this.stalk_x+this.stalk_b1_dx;
      this.stalk_b1_x_init = this.stalk_x;
      this.stalk_b1_y_final = this.stalk_bottom_y-randInt(this.stalk_height_final);
      this.stalk_b1_y_init = this.stalk_bottom_y;
      this.stalk_b2_x_final = this.stalk_x+this.stalk_b2_dx;
      this.stalk_b2_x_init = this.stalk_x;
      this.stalk_b2_y_final = this.stalk_top_y_final+randInt(this.stalk_height_final)-Math.floor(this.stalk_height_final/2);
      this.stalk_b2_y_init = this.stalk_top_y_cur;

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
      this.stalk_svg.setAttribute("data-base-y", this.stalk_bottom_y);
      if(this.child)
        this.child.updateDef();
    }
    this.updateDef();

    if(randInt(this.depth) == 0) {
      // create child structures
      var child_type = randInt(2);
      if(child_type == 0) {
        this.child = new Node(self.plant, self, 0);
      } else {
        var child_stalk_height = Math.floor(this.stalk_height_final/3) + randInt(Math.floor(this.stalk_height_final/3));
        this.child = new Stalk(self.plant, self, 0, child_stalk_height);
      }
    } else if(!this.has_node()) {
      // always make sure each plant includes at least one node
      this.child = new Node(self.plant, self, 0);
    }
  }//end of Stalk()

  // define Plant class
  function Plant() {
    var self = this;
    // declare and initialize instance attributes and methods
    this.base_x = randInt(canvas_w);
    base_stalk_height = randInt(stalk_height_max-stalk_height_min)+stalk_height_min;
    this.base_y = stalk_y_min + Math.floor(base_stalk_height * 0.75) + randInt(Math.floor(base_stalk_height / 2));
    this.stalk_color = secondary_colors[randInt(secondary_colors.length)];
    this.depth = 0;
    this.get_child_base_point = function(_child_index) {
      // only one base point for the plant for all children
      return new Point(this.base_x, this.base_y);
    }
    this.get_child_base_dir = function(_child_index) {
      return 0;
    }
    this.cur_size = function() {
      return Math.ceil(this.stalk.cur_size() * 1.5);
    }
    this.updateDef = function() {
      this.stalk.updateDef();
    }
    this.has_node = function() {
      return false;
    }

    // create child structures
    this.stalk = new Stalk(self, self, 0, base_stalk_height);

    // calculate initial dimensions and do initial render
    this.updateDef();
    // insert elements to preserve order of the data-base-y attribute
    var this_base_y = this.stalk.stalk_svg.getAttribute("data-base-y");
    var svgs_inserted = false;
    for(i = 0; i < svg.childNodes.length; i++) {
      var child_base_y = svg.childNodes[i].getAttribute('data-base-y');
      if(child_base_y != null) {
        if(this_base_y < child_base_y) {
          svgs_inserted = true;
          this.stalk.insertSvgHierarchy(svg, i);
          break;
        }
      }
    }
    if(!svgs_inserted) {
      this.stalk.appendSvgHierarchy(svg);
    }
    // define evolution function
    this.evolve = function() {
      self.updateDef();
      // continue updating if needed
      if(this.stalk.stalk_height_cur < this.stalk.stalk_height_final) {
        setTimeout(function(){self.evolve();}, 100);
      }
    };
    setTimeout(function(){self.evolve();}, 100);

  }
  function makePlant() {
    p = new Plant();
    p.plant_id = num_stalks;
    num_stalks++;
    if(num_stalks < max_stalks) {
      setTimeout(makePlant, getDelay(2500));
    }
  }
  makePlant();
}