import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import Light from "./components/Light.tsx"
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
  const [edit, setEdit] = useState(false)
  const [speed, setSpeed] = useState(510)
  const [colors, setColors] = useState({ backgroundColor: "black", lightColor: "#FFD700"})
  const [densityPercent, setDensityPercent] = useState(50); 
  const [loop, setLoop] = useState(false); 
  const [reverse, setReverse] = useState(false); 
  const [generationHistory, setGenerationHistory] = useState<any[]>([]); 
  const [generationHistoryKey, setGenerationHistoryKey] = useState<Record<string, boolean>>({});



  const gridStructureRef = useRef<Record<number, CellStructure>>({});
  const [gridStatus, setGridStatus] = useState<number[]>([]);

  const gridSizeUpdate = (event: any) => {
    setPause(false);
    setLoop(false);
    setReverse(false)
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
    const aliveCount = Math.ceil(totalCells * (densityPercent / 100)); 

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
    setGenerationHistory([initialStatus])
    setGenerationHistoryKey({[JSON.stringify(initialStatus)]: true})
    // 5. Reset loop controls
    setGeneration(1);
    setReset(false);
  }

  const setEditVal = () => {
    setEdit(prevEdit => {
      if (!prevEdit) { // Check the value *before* the update (will be true)
        const finalGridCopy = new Array(gridStatus.length).fill(0);
        setGridStatus(finalGridCopy);
        setLoop(false) // You correctly added this
      }
      return !prevEdit; // Return the toggled value
    });
  }

  const editGridStatus = (index: number, status: number) => {
    const finalGridCopy = [...gridStatus];
    let finalState;
    if (status) {
      finalState = 0;
    }
    else {
      finalState = 1;
    }
    finalGridCopy[index] = finalState;
    setGridStatus(finalGridCopy)
  }

  const runUpdate = useCallback(() => {
    // -----------------------------------------------------------
    // 1. TIMELINE MOVEMENT (Loop or Reverse is active)
    // -----------------------------------------------------------
    if (loop || reverse) {
        let nextGenerationIndex;

        if (reverse) {
            // --- Moving Backwards (Decrementing) ---
            if (generation === 0) {
                if (loop) {
                    // Reverse Loop ON: Wrap to the end
                    nextGenerationIndex = generationHistory.length - 1;
                } else {
                    // Reverse Loop OFF: Stop and pause at the beginning (index 0)
                    setPause(true); 
                    return; // Stop the update entirely for this tick
                }
            } else {
                // Decrement normally
                nextGenerationIndex = generation - 1;
            }
        } else {
            // --- Moving Forwards (Loop is ON, Reverse is OFF) ---
            // This is the standard forward looping logic
            if (generation === generationHistory.length - 1) {
                nextGenerationIndex = 0;
            } else {
                nextGenerationIndex = generation + 1;
            }
        }
        
        // Apply the calculated index for both loop and reverse
        setGeneration(nextGenerationIndex);
        setGridStatus(generationHistory[nextGenerationIndex]);
        return; 
    } 

    // -----------------------------------------------------------
    // 2. FORWARD RUN (Loop and Reverse are OFF) - Playback or Record
    // -----------------------------------------------------------
    
    // --- A. PLAYBACK MODE ---
    if (generation < generationHistory.length - 1) {
        console.log({generation})
        const nextGenerationIndex = generation + 1;
        setGeneration(nextGenerationIndex);
        setGridStatus(generationHistory[nextGenerationIndex]);
        return; 
    }

    // --- B. RECORD MODE ---
    
    // Step 1: Calculate the next state based on the CURRENT gridStatus
    const nextGrid = calculateNextGridStatus(gridStructureRef.current, gridStatus);
    const nextKey = JSON.stringify(nextGrid);
    
    // Step 2: Cycle Detection
    if (generationHistoryKey[nextKey]) {
        setPause(true);
        return; 
    }
    
    // Step 3: Record and Advance
    setGenerationHistory(prevHistory => [...prevHistory, nextGrid]);
    setGenerationHistoryKey(prevKey => ({
        ...prevKey, 
        [nextKey]: true
    }));

    setGridStatus(nextGrid);
    setGeneration(prevGen => prevGen + 1);
    
}, [gridStructureRef, loop, reverse, generationHistory, generation, generationHistoryKey, gridStatus, setLoop, setReverse, setGeneration, setPause, setGenerationHistory, setGenerationHistoryKey, setGridStatus]);

useEffect(() => {
  createGrid(gridSize)
}, [gridSize, densityPercent])

useEffect(() => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  if (gridStatus.length > 0) {
    timerId = setTimeout(() => {
      if (reset || (!edit && gridStatus.every((status) => status === 0))) {
        setEdit(false)
        setPause(false)
        setLoop(false)
        setReverse(false)
        createGrid(gridSize)
      }
      else if (edit) {
        setGeneration(0)
      }
      else if (!pause) {
        runUpdate();
      }
    }, speed);
  }

  return () => {
    if (timerId) {
      clearTimeout(timerId);
    }
  };

}, [generation, gridStatus, pause, reset, edit, speed, loop, reverse, gridSize, densityPercent, createGrid, runUpdate]); // Added loop, reverse, gridSize, densityPercent, createGrid, runUpdate to dependencies for correctness



return (
  <>
    <div className="appWindow">
      <img className="logo" src={logo} alt="" />
      <section className="slider">
        <h4>Grid Size</h4>
        <h4>{gridSize}</h4>
        <input type="range" min="4" max="100" onChange={gridSizeUpdate} />
      </section>
      <section className="slider">
        <h4>Density</h4>
        <h4>{densityPercent}%</h4>
        <input type="range" min="0" max="100" onChange={(event) => setDensityPercent(Number(event.target.value))} />
      </section>
      <section className="slider">
        <h4>Speed</h4>
        <h4>{(510 - speed) / 10}</h4>
        <input type="range" min="-50" max="50" step="1" onChange={(event) => {
        // 1. Get the slider's value (-50 to 50) as a number
        const sliderValue = Number(event.target.value);

        // 2. Apply the formula: Speed_ms = 510 - (10 * Slider Value)
        const newSpeed = 510 - (10 * sliderValue);

        // 3. Update the 'speed' state
        setSpeed(newSpeed);
      }} />        
      </section>
      <section className="colors">
        <h4>Background Color</h4>
        <input onChange={(event) => setColors({...colors, backgroundColor: event.target.value})} type="color" />
        <h4>Light Color</h4>
        <input onChange={(event) => setColors({...colors, lightColor: event.target.value})} type="color" value={colors.lightColor} />
      </section>
      <button onClick={() => setReset(true)}>Reset</button>
      <button onClick={() => {
        setLoop(prevLoop => {
          if (!prevLoop) {
            if (!pause) {
              setGeneration(0);
            }
            return true;
          }
          else {
            return false;
          }
        })
        
        }} className={loop ? "on" : ""}>Loop</button>
      <button onClick={() => setReverse((prevReverse) => {
        if (!prevReverse && !pause && generation !== 0) {
          // When turning reverse ON: Jump to the latest frame and pause for user control
          setGeneration(generationHistory.length - 1);
          // DO NOT change loop state here; let the user control loop separately.
        }
        return !prevReverse
        })} className={reverse ? "on" : ""}>Reverse</button>

      <button onClick={() => setPause((prevPause) => {
        if (prevPause && !reverse && (generation === generationHistory.length || generation === generationHistory.length - 1)) {
          setGeneration(0); 
        }
        else if (prevPause && reverse && !loop && generation === 0) {
          setGeneration(generationHistory.length - 1); 
        }
        return !pause
        })} className={pause ? "on" : ""}>Pause</button>
      <button onClick={() => {setEditVal()}} className={edit ? "on" : ""}>Edit</button>
      <h4>Generation: {generation}</h4>
      <section className="canvas" style={{ '--num-columns': gridSize }}>
        {gridStatus.map((val, i) => {
          return <Light key={i} status={val} edit={edit} editGridStatus={editGridStatus} index={i} colors={colors} />;
        })}
      </section>
    </div>
  </>
)
}

export default App