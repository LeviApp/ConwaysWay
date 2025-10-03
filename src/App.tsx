import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Light from "./components/Light.tsx"
import {Cell} from "./classes/Cell.tsx";

import "react";

declare module 'react' {
  interface CSSProperties {
    '--num-columns'?: number;
  }
}


function App() {
  const [grid, setGrid] = useState<Cell[]>([])
  const [gridSize, setGridSize] = useState(48)
  const [generation, setGeneration] = useState(0)
  const [reset, setReset] = useState(false)


  const gridSizeUpdate = (event: any) => {
    setGridSize(Number(event.target.value));
  };

  const createGrid = (gridSize: number) => {
    const calculatedGrid: Cell[] = [];
    const randomIds = [];

    for (let i = 0; i <= Math.ceil((gridSize*gridSize)/3); i++) {
      const randomNum = Math.floor(Math.random() * (gridSize*gridSize));
        randomIds.push(randomNum);
    }

    for (let i = 0; i < gridSize*gridSize; i++) {
      let currentCell;
      if (randomIds.includes(i)) {
        currentCell = new Cell(i, 1, [], null);
      }
      else {
        currentCell = new Cell(i, 0, [], null);
      }
      currentCell.createNeighbors(gridSize)
      calculatedGrid.push(currentCell)
    }

    setGrid(calculatedGrid)
    setGeneration(1)
    setReset(false)
  }

  // 🛠️ NEW: This function calculates the next state based on the previous state.
const calculateNextGrid = (currentGrid: Cell[], gridSize: number): Cell[] => {
  const calculatedGrid = [];
  let currentCell;

  for (let i = 0; i < gridSize * gridSize; i++) {
      // Crucially, it uses the 'currentGrid' passed to it.
      const nextState = currentGrid[i].findNextGenerationState(currentGrid);
      // Assuming Cell constructor is (id, status, neighbors, element)
      currentCell = new Cell(i, nextState, [], null);
      currentCell.createNeighbors(gridSize)

      calculatedGrid.push(currentCell); 
  }
  return calculatedGrid;
};

// 🛠️ NEW: The function that runs the logic and updates the state.
const runUpdate = (reset: boolean) => {
  if (reset) {
    createGrid(gridSize)
  }
  // Functional update for grid: Guarantees access to the latest 'grid' state (prevGrid).
  setGrid(prevGrid => {
      if (prevGrid.length === 0) return prevGrid; // Safety check
      return calculateNextGrid(prevGrid, gridSize);
  });

  // Functional update for generation: Guarantees access to the latest 'generation' state (prevGen).
  setGeneration(prevGen => prevGen + 1);
};

  useEffect(() => {
    createGrid(gridSize)
  }, [gridSize])

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null; // Declare for cleanup

    // ⚠️ Safety: Only start the game loop after the initial grid has been created 
    // and is no longer an empty array (and assuming 'reset' is false, if you use it).
    if (grid.length > 0) { 

      // 1. Set up a single timer for the next game step.
      timerId = setTimeout(() => {
        // 2. Call the update function. Since runUpdate modifies 'generation',
        //    the effect will re-run automatically to schedule the NEXT step.
        //    (Assuming runUpdate no longer requires gridSize as an argument)
        runUpdate(reset); 
      }, 100); // Using 100ms as per your original interval

    }

    // 🧹 Cleanup: This is CRITICAL. It clears the timer if the component unmounts 
    // or if the dependencies change, preventing duplicate timers or leaks.
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
    
    // Dependencies: 
    // 'generation' is the state modified by runUpdate, which triggers the next loop iteration.
    // 'grid' is necessary for the initial length check.
    // 'runUpdate' is necessary because you call it inside the effect.
  }, [generation, grid, runUpdate]); 



  return (
    <>
      <div className="appWindow">
      <section className="slider">
        <h4>{gridSize}</h4>
        <input type="range" min="4" max="100" onChange={gridSizeUpdate} />
      </section>
      <button onClick={() => setReset(true)}>Reset</button>
      <h4>Generation: {generation}</h4>
      <section className="canvas" style={{ '--num-columns': gridSize }}>
        {grid.map((val) => {
          return <Light key={val.id} status={val.status} />;
        })}
      </section>
      </div>
    </>
  )
}

export default App
