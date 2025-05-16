
function App() {
  const [color, setColor] = React.useState("#000000");
  const [gridSize, setGridSize] = React.useState({ x: 32, y: 32 });
  const [tempGridSize, setTempGridSize] = React.useState({ x: 32, y: 32 });
  const [pixels, setPixels] = React.useState([]);
  const [currentTool, setCurrentTool] = React.useState('pen');
  const [scale, setScale] = React.useState(1);
  const [currentTheme, setCurrentTheme] = React.useState('light');
  const [showGrid, setShowGrid] = React.useState(true);
  
  const themes = {
    light: {
      bg: '#f0f0f0',
      text: '#333',
      grid: '#ccc',
      toolbar: '#333',
      toolbarActive: '#666',
      button: '#fff'
    },
    dark: {
      bg: '#1a1a1a',
      text: '#fff',
      grid: '#333',
      toolbar: '#2d2d2d',
      toolbarActive: '#4d4d4d',
      button: '#2d2d2d'
    },
    blue: {
      bg: '#1a1a2e',
      text: '#e3e3e3',
      grid: '#16213e',
      toolbar: '#0f3460',
      toolbarActive: '#533483',
      button: '#16213e'
    }
  };
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const gridRef = React.useRef(null);

  const tools = {
    pen: { name: 'Pen', icon: '🖊️' },
    eraser: { name: 'Eraser', icon: '🧹' },
    bucket: { name: 'Fill Bucket', icon: '🪣' },
    zoom: { name: 'Zoom', icon: '🔍' }
  };

  React.useEffect(() => {
    createGrid(gridSize.x, gridSize.y);
    const theme = themes[currentTheme];
    document.documentElement.style.setProperty('--bg-color', theme.bg);
    document.documentElement.style.setProperty('--text-color', theme.text);
    document.documentElement.style.setProperty('--grid-color', theme.grid);
    document.documentElement.style.setProperty('--toolbar-bg', theme.toolbar);
    document.documentElement.style.setProperty('--toolbar-active', theme.toolbarActive);
    document.documentElement.style.setProperty('--button-bg', theme.button);
  }, [currentTheme]);

  const createGrid = (width, height) => {
    setPixels(Array(width * height).fill('white'));
  };

  const handlePixelClick = (index) => {
    if (currentTool === 'bucket') {
      const newPixels = window.floodFill(pixels, index, pixels[index], currentTool === 'eraser' ? 'white' : color, gridSize.x, gridSize.y);
      setPixels(newPixels);
    } else if (currentTool === 'zoom') {
      setScale(prev => prev + 0.5);
    } else {
      const newPixels = [...pixels];
      newPixels[index] = currentTool === 'eraser' ? 'white' : color;
      setPixels(newPixels);
    }
  };

  const handleMouseDown = (e, index) => {
    setIsDrawing(true);
    handlePixelClick(index);
  };

  const [viewPosition, setViewPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (isDrawing && currentTool !== 'zoom') {
      const rect = gridRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (20 * scale));
      const y = Math.floor((e.clientY - rect.top) / (20 * scale));
      const index = y * gridSize.x + x;
      if (index >= 0 && index < pixels.length) {
        handlePixelClick(index);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (currentTool === 'zoom') {
      e.preventDefault();
      const rect = gridRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(10, scale + delta));
      
      const dx = mouseX - (mouseX * newScale / scale);
      const dy = mouseY - (mouseY * newScale / scale);
      
      setScale(newScale);
      setViewPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  };

  const exportToPng = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = gridSize.x * 20;
    canvas.height = gridSize.y * 20;
    
    pixels.forEach((color, i) => {
      const x = (i % gridSize.x) * 20;
      const y = Math.floor(i / gridSize.x) * 20;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 20, 20);
    });

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="container">
      <h1>Pixelin</h1>
      <div className="controls">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="number" value={tempGridSize.x} onChange={(e) => setTempGridSize({...tempGridSize, x: parseInt(e.target.value)})} min="1" max="64" />
        <input type="number" value={tempGridSize.y} onChange={(e) => setTempGridSize({...tempGridSize, y: parseInt(e.target.value)})} min="1" max="64" />
        <button onClick={() => {
          setGridSize(tempGridSize);
          createGrid(tempGridSize.x, tempGridSize.y);
        }}>Create</button>
        <select 
          value={currentTheme} 
          onChange={(e) => setCurrentTheme(e.target.value)}
          style={{padding: '8px 15px', borderRadius: '6px'}}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="blue">🌊 Blue</option>
        </select>
        <button onClick={exportToPng}>Export PNG</button>
        <button onClick={() => setShowGrid(!showGrid)}>
          {showGrid ? '🔲 Hide Grid' : '⬜ Show Grid'}
        </button>
      </div>
      <div className="toolbar">
        {Object.entries(tools).map(([id, tool]) => (
          <button
            key={id}
            className={`tool-button ${currentTool === id ? 'active' : ''}`}
            onClick={() => setCurrentTool(id)}
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <div 
        className="zoom-container"
        ref={gridRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className={`pixel-grid ${!showGrid ? 'no-grid' : ''}`}
          style={{
            display: 'grid',
            transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${scale})`,
            gridTemplateColumns: `repeat(${gridSize.x}, 20px)`
          }}
        >
          {pixels.map((color, i) => (
            <div
              key={i}
              className="pixel"
              style={{ backgroundColor: color }}
              onMouseDown={(e) => handleMouseDown(e, i)}
              onMouseEnter={() => isDrawing && handlePixelClick(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
