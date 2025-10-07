import '../styles/Light.css'

interface MyComponentProps {
    edit: boolean; // Use a specific type
    status: number;
    editGridStatus: any;
    index: number;
}

function Light({edit, status, editGridStatus, index}: MyComponentProps) {
  const turnLight = (event: any) => {
    if (edit) {
      editGridStatus(index, status)
    }
  }
  return (
    <>
        <div className={`${status ? 'light' : 'dark'} ${edit ? 'editMode' : ''}`} onMouseOver={(event) => turnLight(event)}>

        </div>
    </>
  )
}

export default Light
