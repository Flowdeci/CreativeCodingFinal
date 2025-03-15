let canvasContainer;
let centerHorz, centerVert;

let earthHeight=1000;
let earthWidth=1000;

let cities = [];
let citiesSize = 10;
let minimumDistance = 200;

let selectedCity = null;

let isFlashing = false;  // Flag to track flashing
let flashTime = 0;  // Timer to control how long the flash lasts

let clouds = [];

function resizeScreen() {
  // Update the center of the canvas
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;

  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());

  // Set the new Earth dimensions
  //earthWidth = canvasContainer.width() * 0.8;
  //earthHeight = canvasContainer.height() * 0.8;
  

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
  //earthWidth = canvasContainer.width() * 0.8;
  //earthHeight = canvasContainer.height() * 0.8;

  // Generate Initial Cities
  for (let i = 0; i < citiesSize; i++) {
    let relativeX, relativeY, x, y;
    let validPosition = false;

    // Retry until a valid position is found
    while (!validPosition) {
      relativeX = random(0.2, 0.8); // 10% to 90% of Earth width
      relativeY = random(0.2, 0.8); // 10% to 90% of Earth height

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

  setupClouds();
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
  //Background
  background("black");


  // Enable orbiting with the mouse.
  orbitControl();

  drawSun();

  drawClouds();

  drawGround();


  //Draw all the cities
  for (let i = 0; i < cities.length; i++) {
    push();
    cities[i].update();
    cities[i].render();

    pop();
  }

  if (activeMeteorStrike) {
    //console.log(activeMeteorStrike);
    activeMeteorStrike.update(cities);
    activeMeteorStrike.render();
    if (activeMeteorStrike.isComplete()) {
      activeMeteorStrike = null;
    }
  }

  updateCityStatsMenu()
  //processEvents();
}


function drawGround() {
  let gridSize = 20; // Size of each grid square

  for (let x = -earthWidth / 2; x < earthWidth / 2; x += gridSize) {
    for (let y = -earthHeight / 2; y < earthHeight / 2; y += gridSize) {
      // Generate a color based on Perlin noise
      let noiseValue = noise(x * 0.01, y * 0.01); // Adjust scale for variation
      let groundColor = lerpColor(
        color(60, 180, 75), // Grass green
        color(40, 120, 50), // Darker green
        noiseValue
      );

      push();
      noStroke();
      fill(groundColor);
      translate(x + gridSize / 2, y + gridSize / 2, 0); // Center each grid square
      plane(gridSize, gridSize); // Draw a flat plane for each grid square
      pop();
    }
  }
}

function drawSun() {
  push();
  noStroke();
  fill(255, 223, 0);
  translate(300, -200, 700);
  sphere(70);
  pop();
}

function drawClouds() {
  for (let cloud of clouds) {
    push();
    noStroke();
    fill(255, 255, 255, 200);
    translate(cloud.x, cloud.y, cloud.z);

    //Draw all the elisposdes for the clouds
    for (let ellipsoidData of cloud.ellipsoids) {
      push();
      translate(ellipsoidData.offsetX, ellipsoidData.offsetY, ellipsoidData.offsetZ);
      ellipsoid(ellipsoidData.sizeX, ellipsoidData.sizeY, ellipsoidData.sizeZ);
      pop();
    }

    pop();

    // drift the cloud 
    cloud.x += cloud.speed;
    if (cloud.x > width / 2) {
      cloud.x = -width / 2;
    }
  }
}

function setupClouds() {
  clouds = [];
  for (let i = 0; i < 10; i++) {
    let ellipsoids = [];
    let cloudSize = random(40, 80);

    // create multiple elispposdes to form a layered cloud
    for (let j = 0; j < random(2, 7); j++) {
      ellipsoids.push({
        offsetX: random(-cloudSize * 0.5, cloudSize * 0.5),
        offsetY: random(-cloudSize * 0.3, cloudSize * 0.3),
        offsetZ: random(-cloudSize * 0.2, cloudSize * 0.2),
        sizeX: cloudSize,
        sizeY: cloudSize * 0.6,
        sizeZ: cloudSize * 0.4
      });
    }

    clouds.push({
      x: random(-width / 2, width / 2),
      y: random(-height / 2, height / 2),
      z: random(400, 500),
      speed: random(0.1, 0.3),
      ellipsoids
    });
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
  }
  else if (key === 'Y' || key === 'y') {
    console.log('lowering military strength')
    targetCity.militaryStrength += 30;

  }
  else if (key === 'Q' || key === 'q') {
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


