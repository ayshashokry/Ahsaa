export function mapStateToProps({ mapViewer }) {
  return {
    ...mapViewer.tableSetting,
    index: mapViewer.resultIndex,

  }
}
