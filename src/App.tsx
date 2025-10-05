import { useState, useEffect, useRef } from 'react'
import './App.css'
import Light from "./components/Light.tsx"
import {Cell} from "./classes/Cell.tsx";
import { createGridStructure, calculateNextGridStatus } from "./functions/CreateNeighbors.tsx";
import logo from "./assets/ConwaysWayLogo.png"

declare module 'react' {
  interface CSSProperties {
    '--num-columns'?: number;
  }
}

type CellStructure = {
  neighbors: number[];
};


function App() {
  const [gridSize, setGridSize] = useState(48)
  const [generation, setGeneration] = useState(0)
  const [reset, setReset] = useState(false)
  const [pause, setPause] = useState(false)

  const gridStructureRef = useRef<Record<number, CellStructure>>({}); 
  const [gridStatus, setGridStatus] = useState<number[]>([]); 

  const gridSizeUpdate = (event: any) => {
    setPause(false)
    setGridSize(Number(event.target.value));
  };

  const createGrid = (gridSize: number) => {

    // 1. Create and store the FIXED grid structure (neighbors map)
    //    This is the heavy calculation that now only runs once when size changes.
    gridStructureRef.current = createGridStructure(gridSize);
        
    // 2. Initialize the dynamic grid STATUS array (an array of 0s and 1s)
    const totalCells = gridSize * gridSize;
    const initialStatus = new Array(totalCells).fill(0); // Start all dead

    // 3. Re-implement your randomization logic to modify the STATUS array
    //    We no longer need the randomIds array, we can set the status directly.
    
    // Calculate how many cells to randomly set to "alive" (status 1)
    const aliveCount = Math.ceil(totalCells / 3); 
    
    // Create a temporary array of IDs and shuffle them for randomization
    const cellIds = Array.from({ length: totalCells }, (_, i) => i);
    
    // Simple shuffle (Fisher-Yates) for better randomness
    for (let i = totalCells - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cellIds[i], cellIds[j]] = [cellIds[j], cellIds[i]];
    }

    // Set the first 'aliveCount' cells to 1 (alive) in the initialStatus array
    for (let i = 0; i < aliveCount; i++) {
        const randomId = cellIds[i];
        initialStatus[randomId] = 1; // 1 means alive, 0 means dead
    }


    // 4. Update state with the new, random status array
    setGridStatus(initialStatus); // Use the new state setter
    
    // 5. Reset loop controls
    setGeneration(1);
    setReset(false); 
  }

// 🛠️ NEW: The function that runs the logic and updates the state.
const runUpdate = () => {
  // ...
  setGridStatus(prevStatus => {
      if (prevStatus.length === 0) return prevStatus; 
      
      // ✅ FIX 2: Pass ONLY the required data (the structure object)
      return calculateNextGridStatus(gridStructureRef.current, prevStatus); 
  });

  // Functional update for generation: Guarantees access to the latest 'generation' state.
  setGeneration(prevGen => prevGen + 1);
};

  useEffect(() => {
    createGrid(gridSize)
  }, [gridSize])

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null; // Declare for cleanup

    // ⚠️ Safety: Only start the game loop after the initial grid has been created 
    // and is no longer an empty array.
    // ✅ Change 1: Check the length of the new state variable, gridStatus.
    if (gridStatus.length > 0) { 

      // 1. Set up a single timer for the next game step.
      timerId = setTimeout(() => {
        // 2. Call the update function. 
        // ✅ Change 3: Remove the 'reset' argument from runUpdate, 
        //    as that logic is best handled outside the game loop.
        if (reset) {
          setPause(false)
          createGrid(gridSize)
        }
        else if (!pause) {
          console.log("RUNNING PAUSE!")
          runUpdate(); 
        }
      }, 100); 

    }

    // 🧹 Cleanup: Clear the timer when the component unmounts or dependencies change.
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
    
    // Dependencies: 
    // 'generation' triggers the next loop iteration after runUpdate.
    // 'runUpdate' is necessary because you call it inside the effect.
    // ✅ Change 2: Replace 'grid' dependency with the new 'gridStatus' dependency.
  }, [generation, gridStatus, runUpdate, pause, reset]); 



  return (
    <>
      <div className="appWindow">
        <img className="logo" src={logo} alt="" />
      <section className="slider">
        <h4>Grid Size</h4>
        <h4>{gridSize}</h4>
        <input type="range" min="4" max="100" onChange={gridSizeUpdate} />
      </section>
      <button onClick={() => setReset(true)}>Reset</button>
      <button onClick={() => setPause(!pause)}>Pause</button>

      <h4>Generation: {generation}</h4>
      <section className="canvas" style={{ '--num-columns': gridSize }}>
        {gridStatus.map((val, i) => {
          return <Light key={i} status={val} />;
        })}
      </section>
      </div>
    </>
  )
}

export default App
