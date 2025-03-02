let canvasContainer;
let centerHorz, centerVert;

let earthHeight;
let earthWidth;

let cities = [];
let citiesSize = 5;
let minimumDistance = 150; 

function resizeScreen() {
  // Update the center of the canvas
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;

  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());

  // Set the new Earth dimensions
  earthWidth = canvasContainer.width() * 0.8;
  earthHeight = canvasContainer.height() * 0.8;

  if (cities.length === 0) {
    return;
  }

  // Recalculate absolute positions of cities based on their relative position
  for (let city of cities) {
    city.x = centerHorz - earthWidth / 2 + city.relativeX * earthWidth;
    city.y = centerVert - earthHeight / 2 + city.relativeY * earthHeight;
  }
}

function setup() {
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();

  // Set the initial size of the Earth
  earthWidth = canvasContainer.width() * 0.8;
  earthHeight = canvasContainer.height() * 0.8;

  // Generate Initial Cities
  for (let i = 0; i < citiesSize; i++) {
    let relativeX, relativeY, x, y;
    let validPosition = false;

    // Retry until a valid position is found
    while (!validPosition) {
      relativeX = random(0.1, 0.9); // 10% to 90% of Earth width
      relativeY = random(0.1, 0.9); // 10% to 90% of Earth height

      // Calculate absolute positions based on relative positions
      x = centerHorz - earthWidth / 2 + relativeX * earthWidth;
      y = centerVert - earthHeight / 2 + relativeY * earthHeight;

      // Check if the position is far enough from existing cities
      if (isFarEnough(x, y)) {
        validPosition = true;
      }
    }

    // Create city with relative positions
    let population = random(100, 1000);
    let newCity = new City(x, y, population);
    newCity.relativeX = relativeX;
    newCity.relativeY = relativeY;

    cities.push(newCity);
  }
}

function isFarEnough(newX, newY) {
  for (let city of cities) {
    let distBetween = dist(newX, newY, city.x, city.y);
    if (distBetween < minimumDistance) {
      return false;// Not far enough
    }
  }
  return true; // Far enough
}

function draw() {
  background(30);

  // Draw the Earth
  fill(50, 150, 250);
  noStroke();
  rectMode(CENTER);
  rect(centerHorz, centerVert, earthWidth, earthHeight);

  for (let city of cities) {
    city.update();
    city.render();
  }
}