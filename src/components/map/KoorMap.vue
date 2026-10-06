<template>
  <div
    id="map"
    ref="map"
    tabindex="1"
    class="olmap"
  />
  <div
    v-show="pinPointer"
    id="placed-pin"
  >
    <svg class="LocationIcon"><use href="../../assets/icons/icons.svg#pointer-position" /></svg>
  </div>
</template>

<script setup>
//ol basics

import 'ol/ol.css'
import OlMap from 'ol/Map'
import OlView from 'ol/View'

//wmts + wmt setup
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import {Tile as TileLayer} from 'ol/layer'
import TileWMS from 'ol/source/TileWMS.js'

//overlays
import Overlay from 'ol/Overlay'
import {
  defaults as defaultControls,
  ScaleLine,
} from 'ol/control'

import { epsg25832proj, epsg32624proj, epsg3184proj, mapCoorToList } from '../../helperfunctions.js'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

//vue
import { onMounted, ref, computed, watch} from 'vue'
import { useKtStore } from '../../store/store.js'
import { config } from '../../runtimeConfig.js'
import { authFetch } from '../../auth.js'


const KtStore = useKtStore()

//setting up projections for Skærmkortet / Åbent Land Grønland

epsg25832proj(proj4)
epsg32624proj(proj4)
epsg3184proj(proj4)
register(proj4)



const olMap = ref({})
const overlay = ref({})
const pinPointer = ref(false)
const mapData = ref({
  'GL' : {
    title: 'Åbent Land',
    attributionText: 'Klimadatastyrelsen',
    attributionLink: 'https://www.klimadatastyrelsen.dk/',
    mapURL:`https://api.dataforsyningen.dk/wms/gl_aabent_land?token=${config.dataforsyningToken}&service=WMS&request=GetCapabilities`,
    source: null,
    center:   [-116987.80903933897, 7178544.1041003745],
    extent:  [-420000, 6.45e+06, 1.21e+06, 16.0382, 9.5e+06],
    projection: 'EPSG:3184',
    zoom: 12,
    minZoom: 4,
    maxZoom: 200,
  },
  'DK' : {
    title: 'Skærmkortet',
    attributionText: 'Klimadatastyrelsen',
    attributionLink: 'https://www.klimadatastyrelsen.dk/',
    mapURL: `https://wmts.datafordeler.dk/DKskaermkort/topo_skaermkort_daempet/1.0.0/WMTS?apikey=${config.datafordelerToken}&service=WMTS&request=GetCapabilities`,
    source: null,
    view: null,
    center: [587135, 6140617 + 80000],
    extent: [120000, 5900000, 1000000, 6500000],
    projection: 'EPSG:25832',
    zoom: 8.6,
    minZoom: 8.5,
    maxZoom: 20,
  },
})

const coverArea = computed(() => KtStore.getCoverArea)
const coorFrom = computed(() => KtStore.getCoordinatesFrom)

const fetchDKMap = async () => {
  const skaermkort = await fetch(mapData.value.DK.mapURL)
  const mapText = await skaermkort.text()
  const capabilities = new WMTSCapabilities().read(mapText)

  return new WMTS(optionsFromCapabilities(capabilities, {
    layer: 'topo_skaermkort_daempet',
    matrixSet: 'View1',
  }))
}
const fetchGLMap = async () => {
  const groenlandTopoSource = await new TileWMS({
    attributions: '',
    url: mapData.value.GL.mapURL,
    params: {
      layers: 'gl_aabent_land',
      transparent: 'FALSE',
      tiled: true,
    },
    tileLoadFunction: (imageTile, src) => {
      const urlToPatch = new URL(src)

      let newUrl = `${urlToPatch.protocol}//${urlToPatch.hostname}${urlToPatch.pathname}?`
      const queryParams = []
      let found = false
      for (const [key, value] of urlToPatch.searchParams.entries()) {
        if(key.toLowerCase() === 'service'){
          if(found) {
            continue
          }
          found = true
        }
        queryParams.push(`${key}=${value}`)
      }
      newUrl += queryParams.join('&')

      
      imageTile.getImage().src = newUrl
    }
  })

  return groenlandTopoSource
}
const createView = async() => {
  return new OlView({
    center: mapData.value[coverArea.value].center,
    zoom: mapData.value[coverArea.value].zoom + Math.log2(1.2),
    minZoom: mapData.value[coverArea.value].minZoom,
    maxZoom: mapData.value[coverArea.value].maxZoom,
    showFullExtent: false,
    projection: mapData.value[coverArea.value].projection,
  })
}

const createMap = async() => {

  var mapSource
  var mapView
  var mapTitle

  if(coverArea.value === 'DK') {
    mapSource = await fetchDKMap()
    mapView = await createView()
    mapTitle = mapData.value.DK.title

    mapData.value.DK.source = mapSource
    mapData.value.DK.view = mapView
  }
  else {
    mapSource = await fetchGLMap()
    mapView = await createView()
    mapTitle = mapData.value.GL.title

    mapData.value.GL.source = mapSource
    mapData.value.GL.view = mapView
  }

  

  return new OlMap({
    target: 'map',
    controls: defaultControls({
      zoom: false,
      attribution: false,
      rotate: false,
    }),
    view: mapView,
    layers:
            [
              new TileLayer({
                opacity: 1,
                title: mapTitle,
                type: 'base',
                visible: true,
                source: mapSource,
              }),
            ],
  })
}

onMounted(async() => {
  //map cannot set values in store before crs has been set elsewhere !
  //the function yields for 70 milliseconds to allow continuation of other threads before checking again
  const waitForCRS = async() => {
    while(KtStore.CRSFrom === ''){
      await new Promise(resolve => setTimeout(resolve, 70))
    }
  }
  olMap.value = await createMap()

  olMap.value.addControl(new ScaleLine())
    
  const placedPin = document.getElementById('placed-pin')
  overlay.value = new Overlay({
    element: placedPin,
    positioning: 'center-center',
    projection: mapData.value[coverArea.value].projection,
  })

  olMap.value.on('click', (event) => {
    pinPointer.value = true
    const coordinate = event.coordinate
    overlay.value.setPosition(coordinate) 
    KtStore.setCoordinatesFrom_v3({
      crs: mapData.value[coverArea.value].projection,
      coordinates: {v1: event.coordinate[0], v2: event.coordinate[1], v3: null, v4: null},
    })
  })
  await waitForCRS()
  const startCoor = coverArea.value === 'DK' ? [723910.4400, 6179652.8900] : mapData.value.GL.center
  olMap.value.addOverlay(overlay.value) 
  overlay.value.setPosition(startCoor)
  pinPointer.value = true
  KtStore.setCoordinatesFrom_v3({
    crs: mapData.value[coverArea.value].projection,
    coordinates: {v1: startCoor[0], v2: startCoor[1], v3: null, v4: null},
  })
  document.querySelector('#map').focus()
})

//make call to api and set map marker where new coordinate is
watch(coorFrom, async (to, from) => {
  //case that it is same epsg
  const crsFrom = KtStore.CRSFrom
  if(crsFrom === mapData.value[coverArea.value].projection) {
    overlay.value.setPosition(mapCoorToList(to))
  }

  else{
    try {
      const response = await authFetch(`${KtStore.webproj}${KtStore.CRSFrom}/${mapData.value[coverArea.value].projection}/${mapCoorToList(to)}`)
      if(!response.ok){
        throw new Error(`Error fetching coordinates for map: ${response.statusText}`)
      }
      const data = await response.json()
      overlay.value.setPosition(mapCoorToList(data))

    } catch (error) {
      console.error('[KoorMap] State Error: failed to fetch and update coordinates:', error)
    }
  }
})
</script>

<style>
</style>