import baseMap from './basemap'
import zoomGraphicLayer from './zoomgraphiclayer'
import highLightGraphicLayer from './highLight'

export default [
  baseMap,
  zoomGraphicLayer,
  {
    id: 'investGraphicLayer',
    url: '',
    opacity: 1,
    type: 'GraphicsLayer'
  },
  {
    id: 'flushGraphicLayer',
    url: '',
    opacity: 1,
    type: 'GraphicsLayer'
  },
  {
    id: 'ThematicGraphicLayer',
    url: '',
    opacity: 0.8,
    type: 'GraphicsLayer'
  },
  highLightGraphicLayer,
  {
    id: 'adminstrationBordersGraphicLayer',
    url: '',
    opacity: 1,
    type: 'GraphicsLayer'
  },
  

]
