export const epsg25832proj = (proj4object) => {
  proj4object.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
  return proj4object
}
export const epsg32624proj = (proj4object) => {
  proj4object.defs('EPSG:32624', '+proj=utm +zone=24 +datum=WGS84 +units=m +no_defs')
  return proj4object
}

export const epsg3184proj = (proj4object) => {
  proj4object.defs('EPSG:3184','+proj=utm +zone=24 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs')
  return proj4object
}


export const mapCoorToList = (coorObject) => {
  const res = ['v1', 'v2', 'v3', 'v4']
    .map(key => coorObject[key])
    .filter(value => value !== null && value !== undefined)
  return res
}

export const mapListToCoor = (listObject) => {
  const keys = ['v1', 'v2', 'v3', 'v4']
  const res = keys.map((key, index) => ({
    [key]: listObject[index] || null,
  }))
  return res

}
export const extractEPSGCode = (crsString) => {
  return crsString.split(' ').at(-1).slice(1, -1)
}
