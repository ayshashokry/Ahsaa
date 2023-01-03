import axios from "axios";
import store from "../store"


export const getBookmarksOfAuthUSer = async (token)=>{
    if(token){
    try{
      let res = await axios.get(window.API_URL + `bookmark/getall`,{
        headers:{
          Authorization: `Bearer ${token}`,
        }
      })
      let data = res.data;
      let results = [...data.results];
      let bookmarks = results.map(res=>{
        return {
        name:res.title,
        geoSpatialIDs:res.sites.map(site=>site.site_spatial_id),
        id:res.id
        }
      })
      store.dispatch({type:"SET_BOOKMARKS_AFTER_LOGIN",data:bookmarks})
    }catch(err){
      console.log(err);
    } 
  }
  }


  //related to bookmars
export const saveToLocalStorage = (data) => {
    var bookmarks = localStorage.getItem("bookmarks");
    if (bookmarks) {
      bookmarks = JSON.parse(bookmarks);
      bookmarks.push(data);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } else {
      localStorage.setItem("bookmarks", JSON.stringify([data]));
    }
  };
  //related to bookmars
export const updateLocalStorage = (data) => {
    if (data.length) localStorage.setItem("bookmarks", JSON.stringify(data));
    else localStorage.removeItem("bookmarks");
  };
  