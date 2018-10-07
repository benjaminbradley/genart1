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
window.onload = function() {
  init_inputs();
  $('#doit').click(function() {
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
  });
}

function generate_art(input_seed) {
  // GLOBAL CONSTANTS
  //TODO
  var max_stars = 100;  //TODO: base on input_seed

  // show input seed in title
  var init_title = $(document).attr("title");
  $(document).attr("title", init_title + ' | SEED: '+input_seed);

  // create svg
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var canvas_w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var canvas_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
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
  stop2.setAttribute("stop-color","blue");
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
  var num_stars = 0;
  function makeStar() {
    var star = document.createElementNS("http://www.w3.org/2000/svg", "text");
    star.textContent = ".";
    star.setAttribute("x", Math.floor(canvas_w*rand.nextFloat()));
    star.setAttribute("y", Math.floor(canvas_h/2*rand.nextFloat()));
    star.setAttribute("fill", 'white');
    svg.appendChild(star);
    num_stars++;
    if(num_stars < max_stars) {
      setTimeout(makeStar, 3000*rand.nextFloat());
    }
  }
  makeStar();
}