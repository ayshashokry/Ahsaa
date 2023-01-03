import {get} from 'lodash'

export function mapStateToProps({mapViewer}) {
    return {
       list : get(mapViewer, 'tableSetting.list', []),
       index: mapViewer.resultIndex
    }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setResult(index) {
            dispatch({type: 'setResultShowIndex', index})
        }
    }
}
