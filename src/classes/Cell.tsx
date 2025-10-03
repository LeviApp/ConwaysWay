export class Cell {
    public id: number;
    public status: 0 | 1;
    public neighbors: number[];
    public nextStatus: 0 | 1 | null;

    constructor(id: number, status: 0 | 1, neighbors: number[], nextStatus: 0 | 1 | null) {
      this.id = id;
      this.status = status;
      this.nextStatus = nextStatus;
      this.neighbors = neighbors;
    }

    changeStatus(val: 0 | 1) {
        this.status = val;
    }

    createNeighbors(gridSize: number) {

        const totalNeighbors = [];
        
        if (this.id % gridSize !== gridSize - 1) {
            totalNeighbors.push(this.id+1)
        }
        if (this.id % gridSize !== 0) {
            totalNeighbors.push(this.id-1)
        }
        if (this.id > gridSize - 1) {
            totalNeighbors.push(this.id-gridSize)
        }
        if (this.id < gridSize*gridSize - gridSize) {
            totalNeighbors.push(this.id+gridSize)
        }
        if (this.id % gridSize !== gridSize - 1 && this.id > gridSize-1) {
            totalNeighbors.push(this.id-gridSize+1)
        }
        if (this.id % gridSize !== 0 && this.id > gridSize - 1) {
            totalNeighbors.push(this.id-gridSize-1)
        }
        if (this.id % gridSize !== gridSize - 1 && this.id < gridSize*gridSize - gridSize) {
            totalNeighbors.push(this.id+gridSize+1)
        }
        if (this.id % gridSize !== 0 && this.id < gridSize*gridSize - gridSize) {
            totalNeighbors.push(this.id+gridSize-1)
        }
        this.neighbors = totalNeighbors;

        return this.neighbors;
    }

    findNextGenerationState(grid: Cell[]): 0 | 1 {
        let totalAlive = 0;
    
        // 1. Iterate over the list of *neighbor IDs* associated with the current cell (`this`).
        for (const neighborId of this.neighbors) {
            
            // 2. Find the actual Cell object in the full grid that matches the neighborId.
            //    Using a `find` is much cleaner than a full loop.
            const neighborCell = grid.find(cell => cell.id === neighborId);
    
            // 3. Safety check and status check
            if (neighborCell && neighborCell.status === 1) {
                totalAlive++;
            }
        }
    
        // --- Game of Life Rules (This part seems correct) ---
        // If the current cell is alive (status === 1)
        if (this.status === 1) {
            // Stays alive if it has 2 or 3 living neighbors
            if (totalAlive === 2 || totalAlive === 3) {
                return 1;
            } else {
                // Dies (under-population or over-population)
                return 0;
            }
        }
        // If the current cell is dead (status === 0)
        else {
            // Becomes alive if it has exactly 3 living neighbors (reproduction)
            if (totalAlive === 3) {
                return 1;
            } else {
                // Stays dead
                return 0;
            }        
        }
    }
    
}