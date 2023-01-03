export function mapStateToProps({ mapViewer }) {
  return {
    mainMapData: mapViewer,
    layers: mapViewer.layers
  };
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setMap(map) {
      dispatch({
        type: "setMap",
        map
      });
    },
    setMapInfo(data) {
      dispatch({
        type: "setMapInfo",
        data
      });
    },
    addTableSetting(fields) {
      dispatch({
        type: "addTableFields",
        ...fields
      });
    },
    setDataDetails(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "details",
        data
      });
    },
    switchTable(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "table",
        data
      });
    },
    setHighlight(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "highlight",
        data
      });
    },
    setGeometry(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "geometry",
        data
      });
    },
    setOneMozydaDetail(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "oneDetail",
        data
      });
    },
    addTableResultSetting(fields) {
      dispatch({
        type: "addResultTableFields",
        ...fields
      });
    },
    setLands(data) {
      dispatch({
        type: "setpassingDataStore",
        path: "lands",
        data
      });
    },
  };
};
