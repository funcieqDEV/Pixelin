
window.floodFill = (pixels, startIndex, targetColor, newColor, width, height) => {
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
};
