let canvasContainer;
let centerHorz, centerVert;

let earthHeight;
let earthWidth;

let cities = [];
let citiesSize = 5;
let minimumDistance = 150;

let selectedCity = null;

let isFlashing = false;  // Flag to track flashing
let flashTime = 0;  // Timer to control how long the flash lasts

let isWebGL = false;

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

    setupUI()

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
      return false; // Not far enough
    }
  }
  return true; // Far enough
}

function draw() {
    if (isFlashing) {
      let elapsedTime = millis() - flashTime;

      // Flash effect: Alternate between black and white
      if (elapsedTime % 500 < 250) {
        background(255);  // Flash to white
      } else {
        background(30);  // Flash to black
      }

      // Stop flashing after 2 seconds
      if (elapsedTime > 2000) {
        isFlashing = false;
      }
    } else {
      background(30);  // Regular background
    }

    // Draw the Earth
    fill(50, 150, 250);
    noStroke();
    rectMode(CENTER);
    rect(centerHorz, centerVert, earthWidth, earthHeight);

    // Process scheduled events
    processEvents();

    // Draw connections between cities
    drawConnections();

    for (let city of cities) {
      city.update(cities);
      city.render();

      textSize(20);
      text(city.id, city.x, city.y - city.citySize / 2 - 10);

      // Display tooltips if mouse is within city
      if (dist(mouseX, mouseY, city.x, city.y) < city.citySize / 2) {
        fill(255);
        textSize(14);
        textAlign(CENTER);
        noStroke();
        // Display city stats in the tooltip
        text(
          `ID: ${city.id}\nPop: ${floor(city.population)}\nStability: ${floor(city.stability * 100)}%\n` +
          `Tech: ${floor(city.technology)}\nAgg: ${floor(city.aggression)}\n` +
          `Def: ${floor(city.defense)}\nMil: ${floor(city.militaryStrength)}\nDip: ${floor(city.diplomacy)}`,
          city.x,
          city.y - city.citySize / 2 - 10
        );
      }
    }
  

}

function mousePressed() {
  for (let city of cities) {
    if (dist(mouseX, mouseY, city.x, city.y) < city.citySize / 2) {
      selectedCity = city;
      document.getElementById("selected-city").textContent = `City ${city.id}`;
      console.log(`Selected city: ${city.id}`);
      console.log(`City Population: ${city.population}`);
      break;
    } else {
      selectedCity = null;
      document.getElementById("selected-city").textContent = `None`;
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
          stroke(0, 0, 255);
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
          stroke(255, 0, 0); // Red for hostiles
          strokeWeight(2);
          line(city.x, city.y, hostile.x, hostile.y);
        } else {
          console.warn("Invalid ally found in:", city);
        }
      }
    }
  }
}

function keyPressed() {
  let targetCity = selectedCity || cities[floor(random(cities.length))];
  if (key === 'N' || key === 'n') {
    console.log(`Nuking: ${targetCity.id}`);
    nukeCity(targetCity);
    isFlashing = true;
    flashTime = millis();
  } else if (key === 'T' || key === `t`) {
    console.log(`Techbosing: ${targetCity.id}`);
    techBoost(targetCity);
  } else if (key === 'P' || key === 'p') {
    console.log(`Triggering plague for: ${targetCity.id}`);
    plague(targetCity);
  } else if (key === 'M' || key === 'm') {
    console.log(`Mettttooooorrrrr STRIKKKE`);
    meteorStrike(cities);
  }
}
