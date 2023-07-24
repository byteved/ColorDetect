// Global variables
let video, videoCtx, colorCtx;
let selectedColor = { r: 255, g: 0, b: 0 }; // Default color (red)
const matchThreshold = 100; // Adjust this threshold as needed

// Function to initialize the webcam
async function initWebcam() {
  video = document.createElement('video');
  video.width = 400;
  video.height = 400;
  document.getElementById('videoCanvas').appendChild(video);

  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  // Wait for the video to be loaded and ready to play
  video.onloadedmetadata = () => {
    // Start playing the video
    video.play();

    // Set up canvas for displaying the detected color
    const colorCanvas = document.getElementById('colorCanvas');
    colorCtx = colorCanvas.getContext('2d');

    // Set up canvas for drawing the red highlight
    const videoCanvas = document.getElementById('videoCanvas');
    videoCtx = videoCanvas.getContext('2d');

    // Start processing video frames
    processFrames();
  };
}

// Function to draw the red highlight around the detected color
function drawHighlight(x, y) {
  videoCtx.lineWidth = 2;
  videoCtx.strokeStyle = 'red';
  videoCtx.beginPath();
  videoCtx.rect(x - 10, y - 10, 20, 20);
  videoCtx.stroke();
}

// Function to calculate the color difference between two colors
function colorDifference(color1, color2) {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// Function to process video frames and detect the closest color match
function processFrames() {
  // Draw the video frame on the canvas
  videoCtx.drawImage(video, 0, 0, 400, 400);

  // Get the pixel data of the canvas
  const imageData = videoCtx.getImageData(0, 0, 400, 400);
  const data = imageData.data;

  // Variables to store the closest match and its corresponding position
  let minDifference = Infinity;
  let closestMatchX = 0;
  let closestMatchY = 0;

  // Loop through each pixel in the canvas
  for (let y = 0; y < 400; y++) {
    for (let x = 0; x < 400; x++) {
      const index = (y * 400 + x) * 4;
      const r = data[index];   // Red component of the pixel
      const g = data[index + 1]; // Green component of the pixel
      const b = data[index + 2]; // Blue component of the pixel

      // Calculate color difference between the selected color and the detected color
      const difference = colorDifference(selectedColor, { r, g, b });

      // Update the closest match and its corresponding position
      if (difference < minDifference) {
        minDifference = difference;
        closestMatchX = x;
        closestMatchY = y;
      }
    }
  }

  // Check if the closest match is within the threshold for a good match
  if (minDifference <= matchThreshold) {
    // Draw a rectangle of the closest match color on the color canvas
    colorCtx.fillStyle = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
    colorCtx.fillRect(0, 0, 400, 100);

    // Display the color name based on predefined color ranges
    const colorName = getColorName(selectedColor.r, selectedColor.g, selectedColor.b);
    colorCtx.font = '20px Arial';
    colorCtx.fillStyle = 'black';
    colorCtx.fillText(`Selected Color: ${colorName}`, 10, 50);

    // Draw the red highlight around the closest match color
    drawHighlight(closestMatchX, closestMatchY);
  } else {
    // If there is no good match, clear the color canvas and remove the red highlight
    colorCtx.clearRect(0, 0, 400, 100);
  }

  // Continue processing the next frame
  requestAnimationFrame(processFrames);
}

// Function to get the color name based on RGB values
function getColorName(red, green, blue) {
  // ... (same as before)
}

// Event listener for color picker input
document.getElementById('colorPicker').addEventListener('input', (event) => {
  const colorHex = event.target.value;
  const colorRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
  selectedColor = {
    r: parseInt(colorRGB[1], 16),
    g: parseInt(colorRGB[2], 16),
    b: parseInt(colorRGB[3], 16),
  };
});

// Start detection when the button is clicked
document.getElementById('startButton').addEventListener('click', () => {
  initWebcam();
});
