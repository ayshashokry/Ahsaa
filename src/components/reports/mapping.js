export const mapStateToProps = ({ mapUpdate }) => {
    let {auth} = mapUpdate;
  return {
      isAuth:auth.isAuth
  };
};
export const mapDispatchToProps = (dispatch) => {
    return {
      checkAuthintication: () => dispatch({ type: "CHECK_AUTHINTICATION" }),
    };
  };