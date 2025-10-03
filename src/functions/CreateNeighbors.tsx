// 1. DEFINE THE UTILITY TYPE AND FUNCTION OUTSIDE THE COMPONENT
//    This keeps the component cleaner and the function stable.

type CellStructure = {
    neighbors: number[];
  };
  
 export const createGridStructure = (gridSize: number): Record<number, CellStructure> => {
      const structure: Record<number, CellStructure> = {};
      const totalCells = gridSize * gridSize;
    
      for (let id = 0; id < totalCells; id++) {
        const neighbors: number[] = [];
        const row = Math.floor(id / gridSize);
        const col = id % gridSize;
  
        // Logic to find the 8 neighbors with wrap-around/edges
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
  
            const nRow = (row + dr + gridSize) % gridSize;
            const nCol = (col + dc + gridSize) % gridSize;
            const neighborId = nRow * gridSize + nCol;
  
            neighbors.push(neighborId);
          }
        }
        
        structure[id] = { neighbors }; 
      }
      return structure;
  };