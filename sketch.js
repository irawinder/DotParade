const IDEAL_CANVAS_WIDTH = 400;
const IDEAL_CANVAS_HEIGHT = 400;
const NUM_S = 350;
const SIZE_S = 3;
const ALPHA_S = 1;
const NUM_M = 30;
const SIZE_M = 15;
const ALPHA_M = 0.8;
const NUM_L = 2;
const SIZE_L = 150;
const ALPHA_L = 0.5;
const BG_COLOR = '#7563A8';
const SATURATION = 50;
const BRIGHTNESS = 255;
const BUBBLE_REPEL_CONSTANT = .05;
const EDGE_REPEL_CONSTANT = 1;
const MAX_SPEED = 1;
const SPEED_DECAY = 0.9;

var swarmS = [];
var swarmM = [];
var swarmL = [];

var isSmartDevice;

function setup() {

  colorMode(HSB);

  if (displayWidth < displayHeight) {
    isSmartDevice = true;
  } else {
    isSmartDevice = false;
  }

  if (isSmartDevice) {
    if (window.innerWidth / window.innerHeight < 1.0) {
      createCanvas(displayWidth, displayHeight);
    } else {
      createCanvas(displayHeight, displayWidth);
    }
  } else {
    createCanvas(windowWidth, windowHeight);
  }
  init();
}

function deviceTurned() {
  if (isSmartDevice) {
    if (window.innerWidth / window.innerHeight < 1.0) {
      resizeCanvas(displayWidth, displayHeight);
    } else {
      resizeCanvas(displayHeight, displayWidth);
    }
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
  init();
}

 function windowResized() {
  if (isSmartDevice) {
    if (window.innerWidth / window.innerHeight < 1.0) {
      resizeCanvas(displayWidth, displayHeight);
    } else {
      resizeCanvas(displayHeight, displayWidth);
    }
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
  init();
 }

function init() {

  let scaler = (width + height) / (IDEAL_CANVAS_WIDTH + IDEAL_CANVAS_HEIGHT);
  swarmS = initSwarm(NUM_S, scaler * SIZE_S, ALPHA_S);
  swarmM = initSwarm(NUM_M, scaler * SIZE_M, ALPHA_M);
  swarmL = initSwarm(NUM_L, scaler * SIZE_L, ALPHA_L);
}

function initSwarm(numBubbles, size, alpha) {
  let bubbles = [];
  for (let i=0; i<numBubbles; i++) {
    let x = random(width);
    let y = random(height);
    let w = size + random(2*size);
    let h = w + random(-0.5*size, 0.5*size);
    let r = random(2*PI);
    let hue = 255 * random();
    let col = color(hue, SATURATION, BRIGHTNESS, alpha);
    bubbles[i] = new Bubble(x, y, w, h, r, col);
  }
  return bubbles;
}

function draw() {
  background(BG_COLOR);
  
  for (let bubble of swarmS) {
    bubble.addForces(swarmS);
    bubble.addForces(swarmM);
    bubble.update();
  }
  
  for (let bubble of swarmM) {
    bubble.addForces(swarmM);
    bubble.update();
  }
  
  drawSwarm(swarmL);
  drawSwarm(swarmM);
  drawSwarm(swarmS);

  text("HI3", 20, 20);
}

function drawSwarm(swarm) {
  noStroke();
  for (let bubble of swarm) {
    fill(bubble.color);
    applyMatrix();
    translate(bubble.location.x, bubble.location.y);
    rotate(bubble.r);
    ellipse(0, 0, bubble.w, bubble.h);
    resetMatrix();
  }
}

class Bubble {
  constructor(x, y, w, h, r, color) {
    this.location = createVector(x, y);
    this.w = w;
    this.h = h;
    this.r = r
    this.color = color;
    
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
  }  
  
  addForces(swarm) {
    for (let bubble of swarm) {
      if (this == bubble) break;
      this.acceleration.add(this.bubbleForce(bubble));
    }
    this.acceleration.add(this.edgeForce(0, 0, width, height));
  }
  
  bubbleForce(bubble) {
    let d_x = this.location.x - bubble.location.x;
    let d_y = this.location.y - bubble.location.y;
    let displacement = createVector(d_x, d_y);
    let distance = displacement.mag();
    let forceMag = BUBBLE_REPEL_CONSTANT * this.w * bubble.w / sq(distance);
    let force = displacement.setMag(forceMag);
    return force;
  }
  
  edgeForce(xMin, yMin, xMax, yMax) {
    let edgeForce = createVector(0, 0);
    edgeForce.x += this.thresholdForce(this.location.x, xMin);
    edgeForce.x += this.thresholdForce(this.location.x, xMax);
    edgeForce.y += this.thresholdForce(this.location.y, yMin);
    edgeForce.y += this.thresholdForce(this.location.y, yMax);
    return edgeForce;
  }
  
  thresholdForce(position, threshold) {
    let d_t = position - threshold;
    let direction = d_t / abs(d_t);
    return direction * EDGE_REPEL_CONSTANT / sq(d_t);
  }
  
  update() {
    this.velocity.add(this.acceleration);
    
    let speed = min(MAX_SPEED, this.velocity.mag());
    this.velocity.setMag(SPEED_DECAY * speed)
    
    this.location.add(this.velocity);
    this.acceleration = createVector(0, 0);
  }
}

function touchStarted() {
  init();
  //let fs = fullscreen();
  //fullscreen(!fs);
}