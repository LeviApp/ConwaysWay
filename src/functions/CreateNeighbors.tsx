// 1. DEFINE THE UTILITY TYPE AND FUNCTION OUTSIDE THE COMPONENT
//    This keeps the component cleaner and the function stable.

type CellStructure = {
    neighbors: number[];
  };

type GridStructure = Record<number, CellStructure>;
  
 export const createGridStructure = (gridSize: number): Record<number, CellStructure> => {
      const structure: GridStructure = {};
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

// ✅ FIX 1: Function now expects the structure OBJECT, not the Ref object.
export const calculateNextGridStatus = (gridStructure: GridStructure, currentStatusArray: number[]): number[] => {
    const totalCells = currentStatusArray.length;
    const nextStatusArray = new Array(totalCells); // Pre-allocate array

    for (let i = 0; i < totalCells; i++) {
        // ✅ FIX 1: totalAlive is initialized inside the loop (proper scope)
        let totalAlive = 0; 

        // Use the pre-calculated neighbor IDs
        const neighborIDs = gridStructure[i].neighbors; 
        
        // Count live neighbors efficiently
        for (const neighborId of neighborIDs) {
            // ✅ FIX 2: Only count once by adding the status (1 or 0)
            totalAlive += currentStatusArray[neighborId];
        }

        const currentStatus = currentStatusArray[i];
        let nextStatus = 0; // Default next state is DEAD (0)
        
        // --- Game of Life Rules (The original, working logic pattern) ---
        if (currentStatus === 1) { // Cell is currently ALIVE
            if (totalAlive === 2 || totalAlive === 3) {
                nextStatus = 1; // Survival: stays alive
            }
        }
        else { // Cell is currently DEAD (0)
            if (totalAlive === 3) {
                nextStatus = 1; // Reproduction: becomes alive
            }        
        }
        
        nextStatusArray[i] = nextStatus; // Assign the determined status
    }
    
    return nextStatusArray;
};