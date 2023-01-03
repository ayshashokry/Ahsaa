export default {
    mapUpdate: {
        mapLoaded: false,
        selectedFeatures: [],
        tableSettings: null,
        filteredTableSettingsIDs:{data:[], bool:false},
        selectedFeatureOnSearchTable: null,
        bookmarks: [],
        currentUser:"Guest",        //for test roles in app it is by default guest
        multiSelectActive:{
          isActive:false,
          layerName:""
        },
        singleSelectActive:{
          isActive:false,
          layerName:""
        },
        tempSelectedFeaturesData:[],
        // featuresLoading:false
        auth:{
          isAuth:false,
          user:{},
          admin:null
        },
        dashboardData:null
      },
      feasibilityStudy:{
        suggestionDataToPrint:null,
      },
}