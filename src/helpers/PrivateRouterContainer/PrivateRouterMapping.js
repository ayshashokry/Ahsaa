
export const mapStateToProps = (state,props)=>{
    return {
        isAuth: state.mapUpdate.auth.isAuth
    }
} 

export const mapDispatchToProps = (dispatch)=>{
    return {
        // checkAuthintication: () => dispatch({ type: "CHECK_AUTHINTICATION" })
    }
} 

