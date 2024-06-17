// require https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js
/* exported preload setup draw */
const options = {
  method: 'GET',
  headers: {
    // 'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': 'acb67667d6msh2487a39292a375bp1ee17ajsne899f2bd0cab',
    'X-RapidAPI-Host': 'garden-api.p.rapidapi.com',
  },
};

const options2 = {
	method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'acb67667d6msh2487a39292a375bp1ee17ajsne899f2bd0cab',
    'X-RapidAPI-Host': 'open-weather13.p.rapidapi.com'
}
};

let testImage;
let flowerImages = [];
let imagePaths = [];
// let a = 0;
let iterations = 0;
let flowers = []; // Array to store flower instances
let b = 0;
let c = 2;
let wind = 1;
let humidity = 10;
let colorPicker;
var add = document.getElementById('add');
let seasonText = document.getElementById('text')
let one = document.getElementById('one');
let two = document.getElementById('two');
let three = document.getElementById('three');
flowerImages = [];
let selectedFlowerNames = [];

async function preload() {
  testImage = loadImage('logo.png');
  
  const [apiData, weatherData] = await Promise.all([fetchData(), fetchWeatherData()]);
  
  console.log(apiData);
  console.log(weatherData);
  
  loadImagesBasedOnSeason(apiData, weatherData);
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

async function fetchWeatherData() {
  const url = 'https://open-weather13.p.rapidapi.com/city/paris/EN';
  try {
    const response = await fetch(url, options2);
    const result = await response.text();
    return JSON.parse(result);
  } catch (error) {
    console.error(error);
    return {};
  }
}



function loadImagesBasedOnSeason(apiData, weatherData) {

  humidity = weatherData.main.humidity; // Update global humidity variable
  wind = weatherData.wind.speed; // Update global wind variable
  console.log(`humidity: ${humidity}, wind: ${wind}`);

  c = humidity/45;

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
  seasonText.textContent = `${capitalizeFirstLetter(season)} Edition`;

  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const seasonFlowers = apiData.filter(
    (flower) => flower.bloomingTimes && flower.bloomingTimes.toLowerCase().includes(season)
  );

  if (seasonFlowers.length === 0) {
    console.error("No flowers found in API data.");
    return;
  }

  for (let i = 0; i < 3; i++) {
    let randomIndex;
    let flowerName;
    do {
      randomIndex = Math.floor(Math.random() * seasonFlowers.length);
      flowerName = seasonFlowers[randomIndex].plantName.toLowerCase();;
    } while (selectedFlowerNames.includes(flowerName)); // Keep generating random index until a unique flower name is found

    selectedFlowerNames.push(flowerName); // Add the selected flower name to the list
    const imagePath = `imgs/${season}/${flowerName}.png`;
    imagePaths.push(imagePath);
    const flowerImage = loadImage(imagePath);
    flowerImages.push(flowerImage);
    console.log(flowerName);
    console.log(imagePaths);
  }
  embedImage1();
  embedImage2();
  embedImage3();
  console.log(selectedFlowerNames);
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  testImage.loadPixels();
  frameRate(20);
  colorPicker = select('#color');
}

function embedImage1() {
  let imagesHTML1 = '';
  imagesHTML1 += `<img src="${imagePaths[0]}"/>`;
  one.innerHTML = imagesHTML1;
}
function embedImage2() {
  let imagesHTML2 = '';
  imagesHTML2 += `<img src="${imagePaths[1]}"/>`;
  two.innerHTML = imagesHTML2;
}
function embedImage3() {
  let imagesHTML3 = '';
  imagesHTML3 += `<img src="${imagePaths[2]}"/>`;
  three.innerHTML = imagesHTML3;
}
// add.addEventListener('click', function increaseC(){
//   c += 10;
// });

function draw() {
  let selectedColor = colorPicker.value();
  background(selectedColor);
  let imgX = (width - testImage.width) / 2;
  let imgY = (height - testImage.height) / 2;
  image(testImage, imgX, imgY);

  if (iterations <= humidity * 15) {

    const start = performance.now();

    for (let i = 0; i < c; i++) {
      const x = floor(random(testImage.width));
      const y = floor(random(testImage.height));

      const pixelAlpha = getQuick(testImage, x, y)[3];
      if (random(100) < pixelAlpha) {
        createFlowerInstance(x + imgX, y + imgY);
      }
    }
    const end = performance.now();
    console.log(`took ${floor(end - start)} ms`);

    updateAndDrawFlowers(); // Update and draw flower instances
    iterations++;
    console.log(iterations);
  } else {
    updateAndDrawFlowers(); 
  }
}

// function increaseC(){
//   c += 10;
// }
// function mouseClicked() {
//   increaseC(); // Increase 'c' value when mouse is clicked
// }

function createFlowerInstance(x, y) {
  const minSize = 10; // Minimum size of the flowers
  const maxSize = 50; // Maximum size of the flowers
  const size = random(minSize, maxSize); // Random size within the range
  const randomFlowerImage = random(flowerImages);
  if (randomFlowerImage) {
    flowers.push(new FlowerInstance(x, y-5, size, randomFlowerImage));
  }
}

function updateAndDrawFlowers() {
  for (let i = flowers.length - 1; i >= 0; i--) {
    if (iterations <= humidity * 15) {
    flowers[i].update(); // Update each flower instance
    flowers[i].display();
    } else{
    flowers[i].display(); 
    }
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
    this.velocityX = wind * random(-.01, .01); // Random velocity in X direction
    this.velocityY = wind * random(-.01, .01); // Random velocity in Y direction
    this.rotationAngle = random(-25, 25);
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
