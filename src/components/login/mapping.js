
  
export const mapStateToProps = ({ mapUpdate }) => {
      let {auth} = mapUpdate;
    return {
        isAuth:auth.isAuth
    };
  };
export const mapDispatchToProps = (dispatch)=>{
return {
    makeLogin: user => dispatch({
            type:"LOGIN",
            data:user
        }),
        clearSelectedFeatures: ()=>dispatch({type:"CLEAR_SELECTED"})
}
}