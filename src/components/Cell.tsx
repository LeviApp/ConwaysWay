import '../styles/Light.css'

interface MyComponentProps {
    edit: boolean; // Use a specific type
    status: number;
    editGridStatus: any;
    index: number;
    colors: { offColor: string, onColor: string }
}

function Cell({edit, status, editGridStatus, index, colors}: MyComponentProps) {
  const turnLight = () => {
    if (edit) {
      editGridStatus(index, status)
    }
  }
  return (
    <>
        <div className={`${edit ? 'editMode' : ''}`}   style={ status ? { backgroundColor: colors.onColor } : { backgroundColor: colors.offColor }} onMouseOver={() => turnLight()}   onTouchMove={() => turnLight()}>

        </div>
    </>
  )
}

export default Cell
