import '../styles/Light.css'

interface MyComponentProps {
    edit: boolean; // Use a specific type
    status: number;
    editGridStatus: any;
    index: number;
    colors: { backgroundColor: string, lightColor: string }
}

function Light({edit, status, editGridStatus, index, colors}: MyComponentProps) {
  const turnLight = () => {
    if (edit) {
      editGridStatus(index, status)
    }
  }
  return (
    <>
        <div className={`${edit ? 'editMode' : ''}`}   style={ status ? { backgroundColor: colors.lightColor } : { backgroundColor: colors.backgroundColor }} onMouseOver={() => turnLight()}   onTouchMove={() => turnLight()}>

        </div>
    </>
  )
}

export default Light
