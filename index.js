
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 5000;

app.use(express.static("public"));
app.use(express.json());

const drawingUtils = {
  floodFill: (pixels, startIndex, targetColor, newColor, width, height) => {
    if (targetColor === newColor) return pixels;
    
    const newPixels = [...pixels];
    const queue = [startIndex];

    while (queue.length > 0) {
      const currentIndex = queue.shift();
      if (newPixels[currentIndex] !== targetColor) continue;

      newPixels[currentIndex] = newColor;
      const x = currentIndex % width;
      const y = Math.floor(currentIndex / width);

      if (x > 0) queue.push(currentIndex - 1);
      if (x < width - 1) queue.push(currentIndex + 1);
      if (y > 0) queue.push(currentIndex - width);
      if (y < height - 1) queue.push(currentIndex + width);
    }

    return newPixels;
  }
};

app.post("/api/createGrid", (req, res) => {
  const { width, height } = req.body;
  const pixels = Array(width * height).fill('white');
  res.json(pixels);
});

app.post("/api/updatePixel", (req, res) => {
  const { index, tool, color, pixels, gridSize } = req.body;
  let newPixels = [...pixels];

  if (tool === 'bucket') {
    newPixels = drawingUtils.floodFill(
      pixels,
      index,
      pixels[index],
      color,
      gridSize.x,
      gridSize.y
    );
  } else if (tool === 'pen' || tool === 'eraser') {
    newPixels[index] = color;
  }

  res.json(newPixels);
});

app.post("/save", (req, res) => {
  const { name, pixels } = req.body;
  const savePath = path.join(__dirname, "saves", `${name}.json`);
  fs.writeFileSync(savePath, JSON.stringify(pixels));
  res.json({ success: true });
});

app.get("/saves", (req, res) => {
  const savesDir = path.join(__dirname, "saves");
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir);
  }
  const files = fs.readdirSync(savesDir).filter(f => f.endsWith('.json'));
  res.json(files.map(f => f.replace('.json', '')));
});

app.get("/load/:name", (req, res) => {
  const savePath = path.join(__dirname, "saves", `${req.params.name}.json`);
  const pixels = JSON.parse(fs.readFileSync(savePath));
  res.json(pixels);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
