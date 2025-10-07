import '../styles/Light.css'

interface MyComponentProps {
    edit: boolean; // Use a specific type
    status: number;
    editGridStatus: any;
    index: number;
}

function Light({edit, status, editGridStatus, index}: MyComponentProps) {
  const turnLight = () => {
    if (edit) {
      editGridStatus(index, status)
    }
  }
  return (
    <>
        <div className={`${status ? 'light' : 'dark'} ${edit ? 'editMode' : ''}`} onMouseOver={() => turnLight()}>

        </div>
    </>
  )
}

export default Light
