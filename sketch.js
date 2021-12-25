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
const BUBBLE_REPEL_CONSTANT = .1;
const EDGE_REPEL_CONSTANT = 1;
const MAX_SPEED = 1;
const SPEED_DECAY = 0.9;
const IDEAL_TEXT_SIZE = 18;
const TEXT_FONT = 'Helvetica';
const TEXT_FILL = 255;
const TEXT_ALPHA = 0.7;
const PHRASE_MARGIN = 90;

var swarmS = [];
var swarmM = [];
var swarmL = [];
var phrases = [];
var bubbleScaler;
var textScaler;
var isSmartDevice;

function setup() {

  colorMode(HSB);

  phrases[0] = new Phrase("Thank You");
  phrases[1] = new Phrase("I'm Sorry");
  phrases[2] = new Phrase("Please Forgive Me");
  phrases[3] = new Phrase("I Love You");

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

function draw() {

  // Set background color
  background(BG_COLOR);
  
  // Update Positions
  for (let bubble of swarmS) {
    bubble.addForces(swarmS);
    bubble.addForces(swarmM);
    bubble.update();
  }
  for (let bubble of swarmM) {
    bubble.addForces(swarmM);
    bubble.addForces(swarmS);
    bubble.update();
  }
  
  // Draw everything to canvas
  drawSwarm(swarmL);
  drawSwarm(swarmM);
  drawSwarm(swarmS);
  drawPhrases(phrases);
}

function init() {

  bubbleScaler = (width + height) / (IDEAL_CANVAS_WIDTH + IDEAL_CANVAS_HEIGHT);
  textScaler = height / IDEAL_CANVAS_HEIGHT;
  swarmS = initSwarm(NUM_S, bubbleScaler * SIZE_S, ALPHA_S);
  swarmM = initSwarm(NUM_M, bubbleScaler * SIZE_M, ALPHA_M);
  swarmL = initSwarm(NUM_L, bubbleScaler * SIZE_L, ALPHA_L);

  for (let i=0; i<phrases.length; i++) {
    phrases[i].location.x = random(textScaler * PHRASE_MARGIN, width - textScaler * PHRASE_MARGIN);
    phrases[i].location.y = (1 + i) * height / (phrases.length + 1);
  }
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

function drawPhrases(phrases) {
  fill(TEXT_FILL, TEXT_ALPHA);
  textSize(textScaler * IDEAL_TEXT_SIZE);
  textStyle(BOLD);
  textFont(TEXT_FONT);
  textAlign(CENTER, CENTER);
  for (let phrase of phrases) {
    text(phrase.phrase, phrase.location.x, phrase.location.y);
  }
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
    let forceMag = BUBBLE_REPEL_CONSTANT * this.w * bubble.w / pow(distance, 2.5);
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

class Phrase {
  constructor(phrase) {
    this.phrase = phrase;
    this.location = createVector(0, 0)
  }

  setX(x) {
    this.location.x = x;
  }

  setY(y) {
    this.location.y = y;
  }
}

function touchStarted() {
  init();
}

function deviceTurned() {
  resize();
}

function windowResized() {
  resize();
}

function resize() {
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