import '../styles/Light.css'

interface MyComponentProps {
    status: number; // Use a specific type
}

function Light({status}: MyComponentProps) {
  return (
    <>
        <div className={status ? `light` : "dark"}>

        </div>
    </>
  )
}

export default Light
