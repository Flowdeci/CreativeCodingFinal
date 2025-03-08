let buildings_list = []
let lap = 1;
let side = 0;
let id = 1;
let block = 0;
let rotateDisplacement;
let pressing = false;
let last_position;
class Building {
  constructor(pos, dims, tiers) {
    this.pos = pos;
    this.tiers = tiers;
    this.current_tier = 0;
    this.target_heights = [];
    this.dimensions = [];
    this.total_height = 0;
    let size_val = 1;
    let floor_height = floor((random() * 50) + 50);
    for(let ctr = 0; ctr < tiers; ctr++) {
      this.dimensions.push(createVector(dims.x * size_val, dims.y * size_val));
      this.target_heights.push(floor_height);
      floor_height = (1 - (random() * (1 / 6) + 1 / 6)) * floor_height;
      size_val = (1 - (random() * (1 / 6) + 1 / 6)) * size_val;
    }
  }
}

function setup() {
  rotateDisplacement = createVector(0, 0);
  last_position = createVector(0, 0);
  createCanvas(400, 400, WEBGL);
  angleMode(DEGREES)
  buildings_list.push(new Building(createVector(0, 0, 0), createVector(20, 20), 3));
}

function sum(array, num_elements) {
  let running_total = 0;
  for(let ctr = 0; ctr < num_elements; ctr++) {
    running_total += array[ctr];
  }
  return running_total;
}
function draw() {
  let temp_rot_x = 0;
  let temp_rot_y = 0;
  if(pressing) {
    temp_rot_x = mouseX - last_position.x;
    temp_rot_y = mouseY - last_position.y;
  }
  background(220);
  fill('lightgray');
  rotateX(45);
  rotateZ((rotateDisplacement.x + temp_rot_x) * -1);
  rotateX((rotateDisplacement.y + temp_rot_y) * -1);

  let drawing = false;
  for(let ctr = 0; ctr < buildings_list.length; ctr++) {
    let building = buildings_list[ctr];
    for(let iter = 0; iter < building.tiers; iter++) {
      push()
      translate(createVector(building.pos.x, building.pos.y, building.dimensions[iter].z / 2 + sum(building.target_heights, iter)));
      if(building.total_height >= sum(building.target_heights, iter) && building.total_height < sum(building.target_heights, iter + 1)) {
        building.dimensions[iter].z++;
        building.total_height++;    
        drawing = true;
      }
      if(building.dimensions[iter].z > 0) {
        box(building.dimensions[iter].x, building.dimensions[iter].y, building.dimensions[iter].z);
      }
      pop()
    }
  }
  if(!drawing) {
    let lap = floor(sqrt(id));
    let east = ((-1) ** lap) * ((id - (lap*(lap+1))) * (floor(2 * sqrt(id)) % 2) - ceil(lap/2));
    let south = ((-1) ** (lap + 1)) * ((id - (lap*(lap+1))) * ((floor(2 * sqrt(id)) + 1) % 2) + ceil(lap/2));
    buildings_list.push(new Building(createVector(25 * east, 25 * south, 0), createVector(20, 20), floor(random() * max((3 * (1 - 0.1 * lap)), 1) + 1)));
    id++;
  }
}

function mousePressed() {
  pressing = true;
  last_position = createVector(mouseX, mouseY);
}

function mouseReleased() {
  pressing = false;
  rotateDisplacement.add(createVector(mouseX - last_position.x, mouseY - last_position.y))
}
