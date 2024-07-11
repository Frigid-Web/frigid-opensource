
import loading from "../../../../assets/loadingIcon.gif"


function ContentLoader({text}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            gap: '5px'
        }}>
            <img style={{marginTop:'-14px'}} className="loading-circle-gif" src={loading} alt="loading" />
            <p style={{fontWeight:600, fontSize:'14px'}}>{text}</p>
        </div>
    );
}

export default ContentLoader;

