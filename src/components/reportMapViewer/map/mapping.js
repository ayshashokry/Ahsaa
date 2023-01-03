import { get } from 'lodash'
export function mapStateToProps ({mapViewer ,auth:{user} }) {
  return {
    mainMapData: mapViewer,
    layers: get(mapViewer, 'info.info.mapInfo.layers', []),
    user
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setMap(map) {
      dispatch({
        type: 'setMap',
      map})
    },
    setMapInfo(data) {
      dispatch({
        type: 'setMapInfo',
      data})
    },
     addTableSetting(fields) {
            dispatch({
                type: 'addTableFields',
                ...fields
            })
        },
        addTableResultSetting(fields) {
            dispatch({
                type: 'addResultTableFields',
                ...fields
            })
        },
  }
}
