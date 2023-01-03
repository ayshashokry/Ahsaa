import esriLoader from "esri-loader";
const options = {
  url: "https://js.arcgis.com/3.27/",
  dojoConfig : {
    paths: {
    extras:window.__Host+"/ahsaa/extras"
    //react paths
    // extras:window.location.origin+"/ahsaa/extras"
    // extras:process.env.PUBLIC_URL+"/extras"
    // extras:window.location.origin + "/extras"
  } 
}
};

export const LoadModules = (modules) => {
  return esriLoader.loadModules(modules, options);
};
