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


  if (cities[0] && cities[1]) {
    cities[0].addAlly(cities[1]);
  }
  if (cities[1] && cities[2]) {
    cities[1].addAlly(cities[2]);
  }
  if (cities[2] && cities[3]) {
    cities[2].addHostile(cities[3]);
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

  drawConnections();

  for (let city of cities) {
    city.update();
    city.render();
    if (dist(mouseX, mouseY, city.x, city.y) < city.citySize / 2) {
      fill(255);
      textSize(14);
      textAlign(CENTER);
      text(`Pop: ${floor(city.population)}\nStability: ${floor(city.stability * 100)}%`, city.x, city.y - city.citySize / 2 - 10);
    }
  }

}

function mousePressed() {
  for (let city of cities) {
    if (dist(mouseX, mouseY, city.x, city.y) < city.citySize / 2) {
      console.log(`City Population: ${city.population}`);
    }
  }
}

function drawConnections() {
  for (let i = 0; i < cities.length; i++) {
    let city = cities[i];
    if (city.allies && city.allies.length > 0) {
      for (let j = 0; j < city.allies.length; j++) {
        let ally = city.allies[j];
        if (ally && ally instanceof City) { // Ensure ally is valid
          stroke(0, 0, 255); // Red for allies
          strokeWeight(2);
          line(city.x, city.y, ally.x, ally.y);
        } else {
          console.warn("Invalid ally found in:", city);
        }
      }
    }
    if (city.hostiles && city.hostiles.length > 0) {
      for (let j = 0; j < city.hostiles.length; j++) {
        let hostile = city.hostiles[j];
        if (hostile && hostile instanceof City) { // Ensure ally is valid
          stroke(255, 0, 0); // Red for allies
          strokeWeight(2);
          line(city.x, city.y, hostile.x, hostile.y);
        } else {
          console.warn("Invalid ally found in:", city);
        }
      }
    }
  }
}