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

    //city.x = (earthWidth / 2 + city.relativeX * (-(earthHeight / 2) - (earthHeight / 2)))
    city.x = map(city.relativeX, 0.1, 0.9, -(earthWidth / 2), earthWidth / 2);
    city.y = map(city.relativeY, 0.1, 0.9, -(earthHeight / 2), earthHeight / 2)
  }
}

function setup() {

  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
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
      x = relativeX * random(-(earthWidth / 2), earthWidth / 2);
      y = relativeY * random(-(earthHeight / 2), earthHeight / 2);

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
  // Enable orbiting with the mouse.
  orbitControl();
  //Background
  background("lightblue");

  //Earth Plane
  noStroke();
  fill("darkgreen");
  plane(earthWidth, earthHeight);

  //Draw all the cities
  for (let i = 0; i < cities.length; i++) {
    push();
    cities[i].update();
    cities[i].render();

    pop();
  }

  updateCityStatsMenu()


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
    console.log(`Tech boosting: ${targetCity.id}`);
    techBoost(targetCity);
  } else if (key === 'P' || key === 'p') {
    console.log(`Triggering plague for: ${targetCity.id}`);
    plague(targetCity);
  } else if (key === 'M' || key === 'm') {
    console.log(`Meteor strike!`);
    meteorStrike(cities);
  } else if (key === 'Q' || key === 'q') {
    // Navigate to previous city
    if (selectedCity == null) {
      selectedCity = cities[cities.length - 1];
    } else if (selectedCity.id > 0) {
      selectedCity = cities[selectedCity.id - 1];
    } else {
      selectedCity = null;
    }
    updateCityStatsMenu();
  } else if (key === 'E' || key === 'e') {
    // Navigate to next city
    if (selectedCity == null) {
      selectedCity = cities[0];
    } else if (selectedCity.id < cities.length - 1) {
      selectedCity = cities[selectedCity.id + 1];
    } else {
      selectedCity = null;
    }
    updateCityStatsMenu();
  }
}

function updateCityStatsMenu() {
  const statsContent = document.getElementById('city-stats-content');
  if (selectedCity) {
    statsContent.innerHTML = `
      <strong>City ID:</strong> ${selectedCity.id}<br>
      <strong>Population:</strong> ${selectedCity.population.toFixed(0)}<br>
      <strong>Technology:</strong> ${selectedCity.technology.toFixed(2)}<br>
      <strong>Aggression:</strong> ${selectedCity.aggression.toFixed(2)}<br>
      <strong>Defense:</strong> ${selectedCity.defense.toFixed(2)}<br>
      <strong>Military Strength:</strong> ${selectedCity.militaryStrength.toFixed(2)}<br>
      <strong>Diplomacy:</strong> ${selectedCity.diplomacy.toFixed(2)}<br>
      <strong>Stability:</strong> ${selectedCity.stability.toFixed(2)}
    `;
  } else {
    statsContent.textContent = 'Select a city to view stats.';
  }
}


