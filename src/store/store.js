import { defineStore } from 'pinia'
import { mapCoorToList } from '../helperfunctions'
import { config } from '../runtimeConfig.js'
import { authFetch } from '../auth.js'
/**
 * @module KtStore
 * @description
 * Pinia store for managing coordinate transformation state and API interaction.
 * Wraps the [WEBPROJ API](https://github.com/SDFIdk/WEBPROJ) for coordinate transformations between CRS in a GUI.
 *
 * ## State properties:
 * - `webproj` {string}: Base URL for the WEBPROJ API.
 * - `baseUrl` {string|null}: Base URL for static assets.
 * - `CRSOptions` {Object}: CRS options loaded from API/localStorage.
 * - `CoverArea` {string}: Selected cover area (e.g. 'DK', 'GL').
 * - `CRSFrom` {string}: Selected source CRS.
 * - `CRSTo` {string}: Selected target CRS.
 * - `CoordinatesFrom` {Object}: Input coordinates for transformation ({ v1, v2, v3, v4 }).
 * - `CoordinatesTo` {Object}: Output coordinates after transformation ({ v1, v2, v3, v4 }).
 *
 * ## Usage:
 * Use Pinia via `useKtStore()` to access state, getters, and actions for coordinate transformation.
 *
 * @see https://github.com/SDFIdk/WEBPROJ
 * @function useKtStore
 * @returns {import('pinia').StoreDefinition} Pinia store instance.
 */
export const useKtStore = defineStore('KtStore', {
  /**
   * Pinia store for coordinate transformation.
   * @typedef {Object} KtStoreState
   * @property {string} webproj - Base API URL for WEBPROJ.
   * @property {string|null} baseUrl - Base URL for static assets.
   * @property {Object} CRSOptions - CRS options loaded from API/localStorage.
   * @property {string} CoverArea - Selected cover area (e.g. 'DK', 'GL').
   * @property {string} CRSFrom - Selected source CRS.
   * @property {string} CRSTo - Selected target CRS.
   * @property {Object} CoordinatesFrom - Input coordinates for transformation.
   * @property {Object} CoordinatesTo - Output coordinates after transformation.
   */
  state: () => ({
    webproj: `${config.apiBaseUrl}${config.apiBasePath}`,

    //baseUrl to find statically copied members
    baseUrl: new URL(import.meta.url).origin || null,

    // Coordinate Reference System options, loaded from localStorage or defaulting to an empty object
    CRSOptions: JSON.parse(localStorage.getItem('KoordinatTranformationCRSOptions')) || {},

    CoverArea: '',
    
    // Selected CRS for transformation: From and To
    CRSFrom: '',
    CRSTo: '',
    
    // Coordinates for transformation: Input and Output
    CoordinatesFrom: {'v1': 0, 'v2': 0, 'v3': 0, 'v4': 0}, // Use a consistent structure for coordinate data, e.g., { v1: 0, v2: 0, v3: 0, v4: 0 }
    CoordinatesTo: {'v1': 0, 'v2': 0, 'v3': 0, 'v4': 0},
  }),
  getters: {
    /**
     * Get WebProj URL (either test or production).
     * @param {KtStoreState} state
     * @returns {string}
     */
    getWebProj: (state) => state.webproj,
    /**
     * Get the selected cover area.
     * Returns the selected cover area code.
     * Valid values are 'DK' (Denmark) or 'GL' (Greenland).
     * @param {KtStoreState} state
     * @returns {'DK'|'GL'} The selected cover area.
     */
    getCoverArea: (state) => state.CoverArea,
    /**
     * Get selected CRS, both from and to selection.
     * @param {KtStoreState} state
     * @returns {{CRSFrom: string, CRSTo: string}}
     */
    getCRS: (state) => ({
      CRSFrom: state.CRSFrom,
      CRSTo: state.CRSTo,
    }),
    /**
     * Get selected CRS, only to selection.
     * @param {KtStoreState} state
     * @returns {{CRSFrom: string, CRSTo: string}}
     */
    getCRSTo: (state) => state.CRSTo,
    /**
     * Get selected CRS, only from selection.
     * @param {KtStoreState} state
     * @returns {{CRSFrom: string, CRSTo: string}}
     */  
    getCRSFrom: (state) => state.CRSFrom,
    /**
     * Get the full CRS options object as returned from the WEBPROJ API.
     * The object contains CRS definitions grouped by region: DK (Denmark), GL (Greenland), and Global.
     * Each region is an object mapping SRID strings to CRS metadata objects.
     *
     * @example
     * {
     *   DK: { "EPSG:25832": { ... }, ... },
     *   GL: { "EPSG:3178": { ... }, ... },
     *   Global: { "EPSG:4326": { ... }, ... }
     * }
     *
     * @param {KtStoreState} state
     * @returns {Object} CRS options object with DK, GL, and Global keys.
     */
    getCRSOptions: (state) => state.CRSOptions,
    /**
     * Get an array of display strings for all available Danish and global CRS options.
     * Each string is formatted as "title_short (srid)".
     * Combines all CRS from DK and Global regions.
     *
     * @example
     * [ "ETRS89/UTM32N (EPSG:25832)", "WGS84 (EPSG:4326)", ... ]
     *
     * @param {KtStoreState} state
     * @returns {string[]} Array of CRS display options for Denmark and Global.
     */
    getCRSDisplayOptionsDK: (state) => {
      if (state.CRSOptions) {
        const Options = []
        Object.values(state.CRSOptions.DK || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        Object.values(state.CRSOptions.Global || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        return Options
      }
      return []
    },
    /**
     * Get an array of display strings for all available Greenlandic and global CRS options.
     * Each string is formatted as "title_short (srid)".
     * Combines all CRS from GL and Global regions.
     *
     * @example
     * [ "GR96/UTM18N (EPSG:3178)", "WGS84 (EPSG:4326)", ... ]
     *
     * @param {KtStoreState} state
     * @returns {string[]} Array of CRS display options for Greenland and Global.
     */
    getCRSDisplayOptionsGL: (state) => {
      if (state.CRSOptions) {
        const Options = []
        Object.values(state.CRSOptions.GL || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        Object.values(state.CRSOptions.Global || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        return Options
      }
      return []
    },
    
    getCoordinatesFrom: (state) => state.CoordinatesFrom,
    getCoordinatesTo: (state) => state.CoordinatesTo,
    /**
     * Get the full metadata object for the currently selected source CRS.
     * Looks up the CRS in the selected cover area (e.g. 'DK' or 'GL'), falling back to the Global group if not found.
     *
     * @example
     * {
     *   "srid": "EPSG:25832",
     *   "title": "ETRS89 / UTM Zone 32 Nord",
     *   "title_short": "ETRS89/UTM32N",
     *   "area_of_use": "...",
     *   "bounding_box": [...], //potential future use for validating input before api call is performed
     *   "country": "DK",
     *   "v1": "Easting", //Displayed on matching input field
     *   "v1_short": "x", //Displayed on matching input field
     *   "v1_unit": "metre", //Displayed on matching input field
     *   ...
     * }
     *
     * @param {KtStoreState} state
     * @returns {Object} Metadata object for the selected source CRS, or empty object if not found.
     */
    getCRSFromDisplayInfo: (state) => {
      return state.CRSOptions?.[state.CoverArea]?.[state.CRSFrom]
        ?? state.CRSOptions?.Global?.[state.CRSFrom]
        ?? {}
    },
    /**
     * Get the full metadata object for the currently selected target CRS.
     * Looks up the CRS in the selected cover area (e.g. 'DK' or 'GL'), falling back to the Global group if not found.
     *
     * @example
     * {
     *   "srid": "EPSG:25832",
     *   "title": "ETRS89 / UTM Zone 32 Nord",
     *   "title_short": "ETRS89/UTM32N",
     *   "area_of_use": "...",
     *   "bounding_box": [...], //potential future use for validating input before api call is performed
     *   "country": "DK",
     *   "v1": "Easting", //Displayed on matching output field
     *   "v1_short": "x", //Displayed on matching output field
     *   "v1_unit": "metre", //Displayed on matching output field
     *   ...
     * }
     *
     * @param {KtStoreState} state
     * @returns {Object} Metadata object for the selected source CRS, or empty object if not found.
     */    
    getCRSToDisplayInfo: (state) => {
      return state.CRSOptions?.[state.CoverArea]?.[state.CRSTo]
        ?? state.CRSOptions?.Global?.[state.CRSTo]
        ?? {}
    },
    /**
     * Returns path to assets for fetching 
     * assets or similar from the server to the client
     * @param {KtStoreState} state 
     * @returns { string }
     */
    getURL: (state) => {
      return state.baseUrl
    } 
  },
  actions: {
    /**
     * Set the selected cover area (e.g. 'DK' or 'GL').
     * @warning setting the coverarea to anything else than 'DK' or 'GL' bricks the app 
     * @param {string} area - The cover area code.
     */
    setCoverArea(area) {
      this.CoverArea = area
    },
    /**
     * Fetch CRS options from the WEBPROJ API via a two-step process.
     * First, the '/crs' endpoint is called to get an overview of all projections.
     * Then, metadata for each CRS is either fetched from '/crs/${crsOption}' or loaded from localStorage,
     * if a local cache of the projection exists.
     * Fiunally, localStorage is updated with the full CRS metadata for DK, GL, and Global.
     * @async
     * @returns {Promise<void>}
     */
    async fetchCRSOptions() {
      try {
        const response = await authFetch(`${config.apiBaseUrl}/v1.2/crs/`)
        if (!response.ok) {
          throw new Error(`Error fetching CRS-Options! status: ${response.status}`)
        }
          
        const data = await response.json()
        //first, we preseed the CRSOptions to ensure the ordering
        const updatedCRSOptions = {}

        // Define cover areas
        const coverAreas = ['DK', 'GL', 'Global']
    
        // Iterate over each cover area
        coverAreas.forEach(coverArea => {
          if (data[coverArea]) {
            // Initialize the cover area in updatedCRSOptions
            updatedCRSOptions[coverArea] = {}
    
            // Iterate over each EPSG value in the cover area
            data[coverArea].forEach(epsgValue => {
              // Set the EPSG value as a key with null as its value
              updatedCRSOptions[coverArea][epsgValue] = null
            })
          }
        })

        for (const coverArea of coverAreas) {
          
          const crsOptions = data[coverArea] || []

          const fetchDetailsPromises = crsOptions.map(async (crsOption) => {
            //copy over values if they already exist (important to have optional tags as each could possible have been added)
            if(this.CRSOptions?.[coverArea]?.[crsOption]){
              updatedCRSOptions[coverArea][crsOption] = this.CRSOptions[coverArea][crsOption]
            }
            else {
              try {
                const detailsResponse = await authFetch(`${config.apiBaseUrl}/v1.2/crs/${crsOption}`)
                if (!detailsResponse.ok) {
                  throw new Error(`Error fetching details for ${crsOption}`)
                }
                const crsDetails = await detailsResponse.json()
                updatedCRSOptions[coverArea][crsOption] = crsDetails
              } catch (detailsError) {
                console.error(`[CRSOptions] Fetch Error: failed fetching CRS details for ${crsOption}`, detailsError)
              }
            }
          })
          
          await Promise.all(fetchDetailsPromises)
        }
        
        this.CRSOptions = updatedCRSOptions
        localStorage.setItem('KoordinatTranformationCRSOptions', JSON.stringify(updatedCRSOptions))
      } catch (error) {
        console.error('[CRSOptions] Fetch Error: failed fetching CRS options', error)
      }
    },
    /**
     * Set the selected target CRS.
     * The payload must be a valid SRID from getCRSToDisplayInfo.
     * Updates the store's CRSTo property.
     * @warning The payload must be an element from @getter getCRSToDisplayInfo.
     * @param {string} payload - The SRID of the target CRS.
     */
    setCRSTo(payload) {
      this.CRSTo = payload
    },
    /**
     * Set the selected source CRS.
     * The payload must be a valid SRID from getCRSFromDisplayInfo.
     * Updates the store's CRSFrom property and resets the v3 coordinate if the selected CRS does not support v3.
     * @warning The payload must be an element from @getter getCRSFromDisplayInfo.
     * @param {string} payload - The SRID of the source CRS.
     */  
    setCRSFrom(payload) {
      let v3 = null
      if (Object.keys(this.CRSOptions[this.CoverArea]).includes(payload)) {
        v3 = this.CRSOptions[this.CoverArea][payload].v3
      } else if (Object.keys(this.CRSOptions.Global).includes(payload)) {
        v3 = this.CRSOptions.Global[payload]
      }
      this.CRSFrom = payload
      if(v3 == null){
        this.CoordinatesFrom.v3 = null
      }
    },
    /**
     * Set the input coordinates for transformation.
     * If the provided CRS matches the selected source CRS, sets the coordinates directly.
     * Otherwise, fetches transformed coordinates from the API and updates the store.
     * Throws an error if the source CRS is not set.
     * @async
     * @param {Object} param - Parameters object.
     * @param {string} param.crs - The SRID of the input coordinates' CRS.
     * @param {Object} param.coordinates - The input coordinates object.
     * @returns {Promise<void>}
     */
    async setCoordinatesFrom({ crs, coordinates }) {
      if(this.CRSFrom === '' ){
        console.error('[CoordinatesFrom] Illegal State: CRSFrom is undefined')
      }
      else if(crs === this.CRSFrom) {
        this.CoordinatesFrom = coordinates
      }
      else{
        try {
          const coordinateResponse = await authFetch(
            `${this.webproj}${crs}/${this.CRSFrom}/${mapCoorToList(coordinates)}`,
          )
          if(!coordinateResponse.ok){
            throw new Error(`Error Fetching coordinatesFrom: ${coordinateResponse.statusText}`)
          }
          const coordinatesData = await coordinateResponse.json()
          this.CoordinatesFrom = coordinatesData
        } catch (error) {
          console.error('[CoordinatesFrom] Fetch Error: failed fetching coordinatesfrom, update aborted', error)
        }
      }
    },
    /**
     * Set the input coordinates for transformation, preserving the v3 value.
     * If the provided CRS matches the selected source CRS, sets the coordinates directly and preserves v3.
     * Otherwise, fetches transformed coordinates from the API, sets v3, and updates the store.
     * @important this function preserves v3 coordinates. 
     * This was done to allow workflows where input coordiantes have no v2 coordinate but output should keep its v3 coordinate.
     * Throws an error if the source CRS is not set.
     * @async
     * @param {Object} param - Parameters object.
     * @param {string} param.crs - The SRID of the input coordinates' CRS.
     * @param {Object} param.coordinates - The input coordinates object.
     * @returns {Promise<void>}
     */
    async setCoordinatesFrom_v3({ crs, coordinates }){
      const v3 = this.CoordinatesFrom.v3 || 0
      if(this.CRSFrom === '' ){
        console.error('[CoordinatesFrom] Illegal State: CRSFrom is undefined')
      }
      else if(crs === this.CRSFrom) {
        coordinates.v3 = v3
        this.CoordinatesFrom = coordinates
      }
      else{
        try {
          const coordinateResponse = await authFetch(
            `${this.webproj}${crs}/${this.CRSFrom}/${mapCoorToList(coordinates)}`,
          )
          if(!coordinateResponse.ok){
            throw new Error(`Error Fetching coordinatesFrom: ${coordinateResponse.statusText}`)
          }
          const coordinatesData = await coordinateResponse.json()
          coordinatesData.v3 = v3
          this.CoordinatesFrom = coordinatesData
        } catch (error) {
          console.error('[CoordinatesFrom] Fetch Error: failed fetching coordinatesfrom, update aborted', error)
        }
      }
    },
    /**
     * Set the output coordinates by transforming from source to target CRS.
     * If the source and target CRS are the same, copies the input coordinates.
     * Otherwise, fetches transformed coordinates from the API and updates the store.
     * @async
     * @returns {Promise<void>}
     */   
    async setCoordinatesTo() {
      if(this.CRSFrom === '' ){
        console.error('[CoordinatesTo] Illegal State: CRSFrom is undefined')
      }
      else if(this.CRSFrom === this.CRSTo) {
        this.CoordinatesTo = this.CoordinatesFrom
      }
      else {
        try {
          const coordinateResponse = await authFetch(
            `${this.webproj}${this.CRSFrom}/${this.CRSTo}/${mapCoorToList(this.CoordinatesFrom)}`,
          )
          if(!coordinateResponse.ok){
            throw new Error(`Error Fetching coordinatesTo: ${coordinateResponse.statusText}`)
          }
          const coordinatesData = await coordinateResponse.json()
          this.CoordinatesTo = coordinatesData
        } catch (error) {
          console.error('[CoordinatesTo] Fetch Error: failed fetching coordinatesTo, update aborted', error)
        }
      }
    },
    /**
     * Reset the store state for CRS selections and coordinates.
     * @important Avoid calling this method for any purposes except debugging
     * Clears CRSFrom, CRSTo, CoordinatesFrom, and CoordinatesTo to their initial empty values.
     */
    clearState() {
      this.CRSFrom = ''
      this.CRSTo = ''
      this.CoordinatesFrom = {}
      this.CoordinatesTo = {}
    },
  },
})