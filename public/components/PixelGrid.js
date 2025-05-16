
const PixelGrid = ({ pixels, gridSize, scale, onPixelClick }) => {
  return (
    <div className="zoom-container">
      <div 
        className="pixel-grid"
        style={{
          transform: `scale(${scale})`,
          gridTemplateColumns: `repeat(${gridSize.x}, 20px)`
        }}
      >
        {pixels.map((color, i) => (
          <div
            key={i}
            className="pixel"
            style={{ backgroundColor: color }}
            onClick={() => onPixelClick(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelGrid;
