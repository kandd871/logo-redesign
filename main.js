// require https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js
/* exported preload setup draw */
const options = {
  method: 'GET',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': 'd381b4adc2msh80dd4cb3e5d715fp17cf18jsnf726a513495e',
    'X-RapidAPI-Host': 'garden-api.p.rapidapi.com',
  },
};

let testImage;
let flowerImages = [];
let a = 0;
let iterations = 0;
let flowers = []; // Array to store flower instances
let b = 0;
let c = 2;

async function preload() {
  testImage = loadImage('logo.png');
  const apiData = await fetchData();
  console.log(apiData);
  loadImagesBasedOnSeason(apiData);
}

async function fetchData() {
  const url = 'https://garden-api.p.rapidapi.com/plants';
  try {
    const response = await fetch(url, options);
    const result = await response.text();
    return JSON.parse(result);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function loadImagesBasedOnSeason(apiData) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  let season;

  if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
    season = "winter";
    flowerImages.push(loadImage('imgs/winter/sage.png'));
    flowerImages.push(loadImage('imgs/winter/snow.png'));
    flowerImages.push(loadImage('imgs/winter/lily.png'));
    flowerImages.push(loadImage('imgs/winter/flake.png'));
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    season = "spring";
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    season = "summer";
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    season = "fall";
  }

  console.log(`Season: ${season}`);

  const seasonFlowers = apiData.filter(
    (flower) => flower.bloomingTimes && flower.bloomingTimes.toLowerCase().includes(season)
  );

  if (seasonFlowers.length === 0) {
    console.error("No flowers found in API data.");
    return;
  }

  flowerImages = [];
  let selectedFlowerNames = [];

  for (let i = 0; i < 3; i++) {
    let randomIndex;
    let flowerName;
    do {
      randomIndex = Math.floor(Math.random() * seasonFlowers.length);
      flowerName = seasonFlowers[randomIndex].plantName;
    } while (selectedFlowerNames.includes(flowerName)); // Keep generating random index until a unique flower name is found

    selectedFlowerNames.push(flowerName); // Add the selected flower name to the list
    const imagePath = `imgs/${season}/${flowerName}.png`;
    const flowerImage = loadImage(imagePath);
    flowerImages.push(flowerImage);
    console.log(flowerName);
    console.log(imagePath);
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  testImage.loadPixels();
  frameRate(20);
}

function draw() {
  background(255);
  image(testImage, 0, 0, 1440, 747);
  a++;
  const start = performance.now();

  for (let i = 0; i < c; i++) {
      const x = floor(random(testImage.width));
      const y = floor(random(testImage.height));
  
      const pixelAlpha = getQuick(testImage, x, y)[3];
      if (random(100) < pixelAlpha) {
        createFlowerInstance(x, y);
    }
    
  }
  const end = performance.now();
  console.log(`took ${floor(end - start)} ms`);

  updateAndDrawFlowers(); // Update and draw flower instances

  // iterations++; // Increment the iterations counter
  // if (iterations >= 35) {
  //   noLoop(); // Stop drawing after the maximum number of iterations
  //   return;
  // }
}

function increaseC(){
  c += 20;
}
function mouseClicked() {
  increaseC(); // Increase 'c' value when mouse is clicked
}

function createFlowerInstance(x, y) {
  const minSize = 10; // Minimum size of the flowers
  const maxSize = 50; // Maximum size of the flowers
  const size = random(minSize, maxSize); // Random size within the range
  const randomFlowerImage = random(flowerImages);
  if (randomFlowerImage) {
    flowers.push(new FlowerInstance(x - size / 2, y - size / 2, size, randomFlowerImage));
  }
}

function updateAndDrawFlowers() {
  for (let i = flowers.length - 1; i >= 0; i--) {
    flowers[i].update(); // Update each flower instance
    flowers[i].display(); // Display each flower instance
    // if (flowers[i].finished()) {
    //   flowers.splice(i, 1); // Remove finished flower instances
    // }
  }
}

class FlowerInstance {
  constructor(x, y, size, img) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.img = img;
    this.scale = 0; // Initial scale
    this.growing = true; // Flag to control growth
    this.growthRate = random(.05, .2); // Growth rate
    this.velocityX = random(-.05, .05); // Random velocity in X direction
    this.velocityY = random(-.05, .05); // Random velocity in Y direction
    this.rotationAngle = random(-15, 15);
  }

  update() {
    if (this.growing) {
      this.scale += this.growthRate; // Increase scale
      if (this.scale >= this.size) {
        this.growing = false; // Stop growing when reaching the desired size
      }
    } else {
      // Move the flower a bit even after growing
      this.x += this.velocityX;
      this.y += this.velocityY;
    }
}

display() {
  push(); // Save the current transformation state
  translate(this.x, this.y); // Move origin to the flower's position
  rotate(radians(this.rotationAngle)); // Rotate by the random angle
  image(this.img, -this.scale * 0.25, 0, this.scale, this.scale); // Draw the flower with the current scale
  pop(); // Restore the transformation state
}

  finished() {
    return !this.growing; // Return true if the flower has finished growing
  }
}


function getQuick(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [
    img.pixels[i],
    img.pixels[i + 1],
    img.pixels[i + 2],
    img.pixels[i + 3],
  ];
}
