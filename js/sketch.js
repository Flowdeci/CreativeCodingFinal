let canvasContainer;
let centerHorz, centerVert;

let earthHeight = 1500;
let earthWidth = 1500;

let cities = [];
let citiesSize = 15;
let minimumDistance = 250;

let selectedCity = null;

let isFlashing = false;  // Flag to track flashing
let flashTime = 0;  // Timer to control how long the flash lasts

let clouds = [];

let myFont;

let animations = [];

function preload() {
  myFont = loadFont('assets/fonts/Raleway-Italic-VariableFont_wght.ttf');
}
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

  directionalLight(250, 250, 250, 0, -1, -1); // Soft sunlight
  ambientLight(100); // Ambient glow

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
  background("lightblue");


  // Enable orbiting with the mouse.
  orbitControl();

  drawSun();

  drawClouds();

  drawGround();


  //Draw all the cities
  const citiesCopy = [...cities];
  for (let city of citiesCopy) {
    push();
    if (city) {
      city.render();
      city.update();
    }
    pop();
  }

  if (selectedCity) {
    drawRelationshipLines(selectedCity);
  }

  // Draw animations
  renderAnimations();

  if (activeMeteorStrike) {
    //console.log(activeMeteorStrike);
    activeMeteorStrike.update(cities);
    activeMeteorStrike.render();
    if (activeMeteorStrike.isComplete()) {
      activeMeteorStrike = null;
    }
  }

  updateCityStatsMenu()
  processEvents();
}

function triggerAttackAnimation(attacker, target) {
  animations.push({
    type: "attack",
    start: createVector(attacker.x, attacker.y, attacker.total_height),
    end: createVector(target.x, target.y, target.total_height),
    progress: 0,
    color: color(255, 0, 0),
  });
}

function triggerTradeAnimation(city1, city2) {
  animations.push({
    type: "trade",
    start: createVector(city1.x, city1.y, city1.total_height),
    end: createVector(city2.x, city2.y, city2.total_height),
    progress: 0,
    color: color(0, 255, 0),
  });
}

function renderAnimations() {
  for (let i = animations.length - 1; i >= 0; i--) {
    let animation = animations[i];
    let { start, end, progress, color } = animation;

    // Validate that the start and end points are still valid
    if (!isCityValid(start) || !isCityValid(end)) {
      animations.splice(i, 1); // Remove invalid animation
      continue;
    }

    // Calculate the current position of the animation
    let current = p5.Vector.lerp(start, end, progress);

    // Draw the animation
    push();
    stroke(color);
    strokeWeight(5);
    line(start.x, start.y, start.z, current.x, current.y, current.z); // Line for the animation
    pop();

    // Update progress
    animation.progress += 0.02; // Speed of animation

    // Remove animation if complete
    if (animation.progress >= 1) {
      animations.splice(i, 1);
    }
  }
}

// Helper function to validate if a city is still valid
function isCityValid(position) {
  return cities.some(city => city.x === position.x && city.y === position.y);
}

function spawnNewCity() {
  if (cities.length < citiesSize) {
    let relativeX, relativeY, x, y;
    let validPosition = false;

    while (!validPosition) {
      relativeX = random(0.2, 0.8);
      relativeY = random(0.2, 0.8);

      x = map(relativeX, 0.1, 0.9, -(earthWidth / 2), earthWidth / 2);
      y = map(relativeY, 0.1, 0.9, -(earthHeight / 2), earthHeight / 2);

      if (isFarEnough(x, y)) {
        validPosition = true;
      }
    }

    let population = random(100, 1000);
    const newCity = new City(x, y, population);
    newCity.relativeX = relativeX;
    newCity.relativeY = relativeY;

    cities.push(newCity);
    console.log(`New city spawned with ID ${newCity.id}`);
    queueMessage(`Whos this new guy, City: ${newCity.id}?`);
  }
}

setInterval(spawnNewCity,1000);

function drawGround() {
  let gridSize = 100; // Size of each grid square, have higher for better performance

  for (let x = -earthWidth / 2; x < earthWidth / 2; x += gridSize) {
    for (let y = -earthHeight / 2; y < earthHeight / 2; y += gridSize) {
      let noiseValue = noise(x * 0.01, y * 0.01);
      let groundColor = lerpColor(
        color(60, 180, 75),
        color(40, 120, 50),
        noiseValue
      );

      push();
      noStroke();
      fill(groundColor);
      translate(x + gridSize / 2, y + gridSize / 2, 0);
      plane(gridSize, gridSize);
      pop();
    }
  }
}

function drawSun() {
  push();
  noStroke();
  fill(255, 223, 0);
  translate(300, -200, 1000);
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
  for (let i = 0; i < 25; i++) {
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
      x: random(-earthWidth / 2, earthWidth / 2),
      y: random(-earthHeight / 2, earthHeight / 2),
      z: random(700, 1100),
      speed: random(0.1, 0.3),
      ellipsoids
    });
  }
}

function keyPressed() {
  let currentIndex = cities.indexOf(selectedCity);

  if (key === 'N' || key === 'n') {
    console.log(`Nuking: ${selectedCity?.id}`);
    nukeCity(selectedCity);
    isFlashing = true;
    flashTime = millis();
  } else if (key === 'T' || key === 't') {
    console.log(`Tech boosting: ${selectedCity?.id}`);
    techBoost(selectedCity);
  } else if (key === 'P' || key === 'p') {
    console.log(`Triggering plague for: ${selectedCity?.id}`);
    plague(selectedCity);
  } else if (key === 'M' || key === 'm') {
    console.log(`Meteor strike!`);
    meteorStrike(cities);
  } else if (key === 'Y' || key === 'y') {
    console.log('Increasing military strength');
    selectedCity.militaryStrength += 30;
  }
  // Navigate to the previous city
  else if (key === 'Q' || key === 'q') {

    if (currentIndex === -1) {
      selectedCity = cities[cities.length - 1];
    } else {
      selectedCity = cities[(currentIndex - 1 + cities.length) % cities.length]; // Wrap around
    }
    updateCityStatsMenu();
  } else if (key === 'E' || key === 'e') {
    // Navigate to the next city
    if (currentIndex === -1) {
      selectedCity = cities[0]; // Start at the first city if none selected
    } else {
      selectedCity = cities[(currentIndex + 1) % cities.length]; // Wrap around
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
      <strong>Stability:</strong> ${selectedCity.stability.toFixed(2)}<br>
      
    `;
  } else {
    statsContent.textContent = 'Select a city to view stats.';
  }
}

function drawRelationshipLines(city) {
  push();
  strokeWeight(2);

  // Draw lines to allies
  for (let ally of city.allies) {
    if (!ally.isBeingDestroyed) {
      stroke(0, 0, 255, 150);
      line(city.x, city.y, city.total_height, ally.x, ally.y, ally.total_height);
    }
  }

  // Draw lines to hostiles
  for (let hostile of city.hostiles) {
    if (!hostile.isBeingDestroyed) {
      stroke(255, 0, 0, 150);
      line(city.x, city.y, city.total_height, hostile.x, hostile.y, hostile.total_height);
    }
  }

  pop();
}

setInterval(() => {
  meteorStrike(cities);
}, 25000);

setTimeout(() => {
  randomCity = random(cities);
  plague(randomCity);
},20000);

