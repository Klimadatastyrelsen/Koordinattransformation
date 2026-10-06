<template>
  <!--
    Note: inputmode="numeric"-attribute on input-fields is required for correct formating of numbers 
    (with dot as seperator instead of)

    Each input field has a dynamically selected format with a specified amount of decimals it should have,
    which is selected from the formats-ref.
  -->
  <div
    v-if="isMeter"
    class="KT-input-meter"
  >
    <span 
      class="KT-input-row"
    >
      <svg class="KT-idc">
        <use :href="c1.dirIcon" />
      </svg>
      <input 
        id="c1"
        v-model="c1.cMeter"
        class="KT-input"
        :class="c1MeterValid ? '' : 'KT-input-invalid'"
        type="text"
        title=""
        inputmode="numeric"
        aria-label="Input Coordinate One"
        @input="debounceUpdate"
      >
      <p
        id="c1Indicator"
        class="KT-idc"
      > {{ c1.dirIndicator }} </p>

      <p 
        :class="c1MeterValid ? '' : 'KT-tooltip-visible'"
        class="KT-tooltip-dir"
      >
        {{ c1.dirText }}: {{ formatTexts.meterformat }}
      </p>
    </span>
    <span 
      class="KT-input-row"
    >
      <svg class="KT-idc">
        <use :href="c2.dirIcon" />
      </svg>
      <input 
        id="c2"
        v-model="c2.cMeter"
        class="KT-input"
        :class="c2MeterValid ? '' : 'KT-input-invalid'"
        type="text"
        title=""
        inputmode="numeric"
        aria-label="Input Coordinate Two"
        @input="debounceUpdate"
      >
      <p
        id="c2Indicator"
        class="KT-idc"
      > {{ c2.dirIndicator }} </p>
      <p 
        :class="c2MeterValid ? '' : 'KT-tooltip-visible'"
        class="KT-tooltip-dir"
      >
        {{ c2.dirText }} : {{ formatTexts.meterformat }}
      </p>
    </span>
    <span 
      v-if="c3.isHeight"
      class="KT-input-row"
    >
      <svg class="KT-idc">
        <use :href="c3.upIcon" />
      </svg>
      <input 
        id="c3"
        v-model="c3.cMeter"
        class="KT-input"
        :class="c3MeterValid ? '' : 'KT-input-invalid'"
        type="text"
        title=""
        inputmode="numeric"
        aria-label="Input Coordinate Three"
        @input="debounceUpdate"
      >
      <p
        id="c3Indicator"
        class="KT-idc"
      > m </p>
      <p 
        :class="c3MeterValid ? '' : 'KT-tooltip-visible'"
        class="KT-tooltip-dir"
      >
        {{ c3.dirText }} : {{ formatTexts.meterformat }}
      </p>
    </span>
  </div>

  <div
    v-else
    class="KT-input-column"
  >
    <span 
      class="KT-input-row"
    >
      <div
        class="KT-degree-input-field"
      >
        <svg class="KT-idc">
          <use :href="c1.dirIcon" />
        </svg>
        <input 
          id="c1D"
          v-model="c1.cDegree"
          :class="c1DegreeValid ? '' : 'KT-input-invalid'"
          type="text"
          title=""
          inputmode="numeric"
          aria-label="Input Coordinate One D.D° or D°"
          @input="debounceUpdate"
        >

        <p
          id="c1degreeIdc"
          class="KT-p KT-push-right"
        >°</p>
        <p 
          :class="c1DegreeValid ? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c1.dirText }} : {{ degreeFormat === 'D' ? formatTexts.degreeformat : formatTexts.noDecimal }}
        </p>
      </div>
      <div
        v-if="degreeFormat==='DM' || degreeFormat === 'DMS'"
        class="KT-degree-input-field"
      >
        <input 
          
          id="c1Dm"
          v-model="c1.cMinute"
          :class="c1MinuteValid ? '' : 'KT-input-invalid'"        
          type="text"
          title=""
          inputmode="numeric"
          aria-label="Input Coordinate Two M' or M.M'"
          @input="debounceUpdate"
        >
        <p
          id="c1minuteIdc"
          class="KT-p KT-push-right"
        >'</p>
        <p 
          :class="c1MinuteValid ? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c1.dirText }} : {{ degreeFormat === 'DM' ? formatTexts.minutesformat : formatTexts.pNoDecimal }}
        </p>
      </div>
      <div
        v-if="degreeFormat === 'DMS'"
        class="KT-degree-input-field"
      >
        <input 
          id="c1Dms"
          v-model="c1.cSecond"
          :class="c1SecondValid ? '' : 'KT-input-invalid'"     
          type="text"
          title=""
          inputmode="numeric"
          aria-label="Input Coordinate Two S.S&quot;"
          @input="debounceUpdate"
        >
        <p
          id="c1secondIdc"
          class="KT-p"
        >"</p>
        <p 
          :class="c1SecondValid? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c1.dirText }} : {{ formatTexts.secondsformat }}
        </p>  
      </div>
      <p
        id="c1Indicator"
        class="KT-idc"
      > {{ c1.dirIndicator }} </p>
    </span>
    <span 
      class="KT-input-row"
    >
      <div
        class="KT-degree-input-field"
      >
        <svg class="KT-idc">
          <use :href="c2.dirIcon" />
        </svg>
        <input 
          id="c2D"
          v-model="c2.cDegree"
          :class="c2DegreeValid ? '' : 'KT-input-invalid'"       
          type="text"
          title=""
          inputmode="numeric"
          @input="debounceUpdate"
        >
        <p
          id="c2degreeIdc"
          class="KT-p KT-push-right"
        >°</p>
        <p 
          :class="c2DegreeValid ? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c2.dirText }} : {{ degreeFormat === 'D' ? formatTexts.degreeformat : formatTexts.noDecimal }}
        </p>
      </div>
      <div
        v-if="degreeFormat==='DM' || degreeFormat === 'DMS'"
        class="KT-degree-input-field"
      >
        <input 
          id="c2Dm"
          v-model="c2.cMinute"
          :class="c2MinuteValid ? '' : 'KT-input-invalid'"             
          type="text"
          title=""
          inputmode="numeric"
          @input="debounceUpdate"
        >
        <p
          id="c2minuteIdc"
          class="KT-p KT-push-right"
        >'</p>
        <p 
          :class="c2MinuteValid ? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c2.dirText }} : {{ degreeFormat === 'DM' ? formatTexts.minutesformat : formatTexts.pNoDecimal }}
        </p>
      </div>
      <div
        v-if="degreeFormat === 'DMS'"
        class="KT-degree-input-field"
      >
        <input 
          id="c2Dms"
          v-model="c2.cSecond"
          :class="c2SecondValid ? '' : 'KT-input-invalid'"      
          type="text"
          title=""
          inputmode="numeric"
          @input="debounceUpdate"
        >
        <p
          v-if="degreeFormat==='DMS'"
          id="c2secondIdc"
          class="KT-p"
        >"</p>
        <p 
          :class="c2SecondValid ? '' : 'KT-tooltip-visible'"
          class="KT-tooltip-dir"
        >
          {{ c2.dirText }} : {{ formatTexts.secondsformat }}
        </p>
      </div>
      <p
        id="c2Indicator"
        class="KT-idc"
      > {{ c2.dirIndicator }} </p>
    </span>
    <span 
      v-if="c3.isHeight"
      class="KT-input-row"
    >
      <svg class="KT-idc">
        <use :href="c3.upIcon" />
      </svg>
      <input 
        id="c3"
        v-model="c3.cMeter"
        :class="c3MeterValid ? '' : 'KT-input-invalid'"
        type="text"
        title=""
        inputmode="numeric"
        @input="debounceUpdate"
      >
      <p
        id="c3Indicator"
        class="KT-p"
      > m </p>
      <p 
        :class="c3MeterValid ? '' : 'KT-tooltip-visible'"
        class="KT-tooltip-dir"
      >
        {{ c3.dirText }} : {{ formatTexts.meterformat }}
      </p>
    </span>
  </div>
  <span
    v-if="!isMeter"
    class="KT-radio-row"
  >
    <input
      id="D"
      v-model="degreeFormat"
      type="radio"
      name="format"
      value="D"
      checked="checked"
    >
    <label for="D">DD.DD°</label><br>
    <input
      id="DM"
      v-model="degreeFormat"
      type="radio"
      name="format"
      value="DM"
    >
    <label for="DM">DD° MM.MM'</label><br>
    <input
      id="DMS"
      v-model="degreeFormat"
      type="radio"
      name="format"
      value="DMS"
    >
    <label for="DMS">DD° MM' SS.SS"</label>
    <span
      class="KT-tooltip-icon bg-secondary border-soft"
      :class="{'KT-tooltip-visible' : isVisible}"
      @click="isVisible = !isVisible"
    >
      <svg style="height:0.9rem;"><use href="../../../assets/icons/icons.svg#info" /></svg>
      <p class="KT-tooltip">
        Repræsentationsformat for geografiske koordinater. Vælg mellem decimalgrader (DD.DD°), grader og minutter (DD° MM.MM') eller grader, minutter og sekunder (DD° MM' SS.SS").
      </p>
    </span>
  </span>
  <AddressSearch
    v-if="route.fullPath==='/Denmark' || route.fullPath==='/'"
    @select="(coordinates) => KtStore.setCoordinatesFrom({ crs: 'EPSG:25832', coordinates })"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKtStore } from '../../../store/store.js'
import AddressSearch from './AddressSearch.vue'

const KtStore = useKtStore()
const route = useRoute()

// PROD is any build, !PROD is the vite dev server
const svgPath = import.meta.env.PROD ? KtStore.getURL + '/icons.svg#' : '/src/assets/icons/icons.svg#'
const debounceTimeout = ref(null)


const coorFrom = computed(() => KtStore.getCoordinatesFrom)
const CRSInfo = computed(() => KtStore.getCRSFromDisplayInfo)


const isUserInput = ref(false)

const baseCoords  = ref({
  v1: 0.0,
  v2: 0.0,
  v3: 0.0,
  v4: 0.0,
})

const c1 = ref({
  cMeter: '0.0',
  cDegree: '0.0',
  cMinute: '0.0',
  cSecond: '0.0',
  dirIcon: '',
  dirIndicator: '',
  dirText: ''
})
const c2 = ref({
  cMeter: '0.0',
  cDegree: '0.0',
  cMinute: '0.0',
  cSecond: '0.0',
  dirIcon: '',
  dirIndicator: '',
  dirText: ''
})
const c3 = ref({
  cMeter: '0.0',
  isHeight: false,
  upIcon: svgPath + 'arrow-up',
  dirText: ''
})

const isVisible = ref(false)
const isMeter = ref(true)
const degreeFormat = ref('D')

const formats = {
  meterformat:/^-?\d+(\.\d{1,4})?$/,
  degreeformat: /^-?\d+(\.\d{1,9})?$/,
  minutesformat:/^\d+(\.\d{1,6})?$/,
  secondsformat: /^\d+(\.\d{1,4})?$/,
  pNoDecimal: /^\d+$/,
  noDecimal: /^-?\d+$/
}

const formatTexts = {
  meterformat:'tal med 0-4 decimaler',
  degreeformat: 'tal med 0-9 decimaler',
  minutesformat:'positivt tal med 0-6 decimaler',
  secondsformat: 'positivt tal med 0-4 decimaler',
  pNoDecimal: 'positivt tal uden decimaler',
  noDecimal: 'tal uden decimaler'
}

const validateCoordinate = (pattern = '', coordinate) => {
  let result
  switch(pattern) {
  case 'meterformat' :
    result = formats.meterformat.test(coordinate)
    break
  case 'degreeformat': 
    result = formats.degreeformat.test(coordinate)
    break
  case 'minutesformat':
    result = formats.minutesformat.test(coordinate)
    break
  case 'secondsformat' :
    result = formats.secondsformat.test(coordinate)
    break
  case 'pNoDecimal' :
    result = formats.pNoDecimal.test(coordinate)
    break
  case 'noDecimal' :
    result = formats.noDecimal.test(coordinate)
    break
  default :
    result = false
    break
  }
  
  return result
}
const isMeterValidHelper = (coord) => {
  if (!isMeter.value) return true
  switch (coord) {
  case 'c1': return validateCoordinate('meterformat', c1.value.cMeter)
  case 'c2': return validateCoordinate('meterformat', c2.value.cMeter)
  case 'c3': return c3.value.isHeight ? validateCoordinate('meterformat', c3.value.cMeter) : true
  default: return false
  }
}

const isDegreeValidHelper = (coord) => {
  if (isMeter.value) return true
  switch (coord) {
  case 'c1':
    return degreeFormat.value === 'D'
      ? validateCoordinate('degreeformat', c1.value.cDegree)
      : validateCoordinate('noDecimal', c1.value.cDegree)
  case 'c2':
    return degreeFormat.value === 'D'
      ? validateCoordinate('degreeformat', c2.value.cDegree)
      : validateCoordinate('noDecimal', c2.value.cDegree)
  default: return false
  }
}

const isMinuteValidHelper = (coord) => {
  if (isMeter.value || degreeFormat.value === 'D') return true
  switch (coord) {
  case 'c1':
    return degreeFormat.value === 'DM'
      ? validateCoordinate('minutesformat', c1.value.cMinute)
      : validateCoordinate('pNoDecimal', c1.value.cMinute)
  case 'c2':
    return degreeFormat.value === 'DM'
      ? validateCoordinate('minutesformat', c2.value.cMinute)
      : validateCoordinate('pNoDecimal', c2.value.cMinute)
  default: return false
  }
}

const isSecondValidHelper = (coord) => {
  if (isMeter.value || degreeFormat.value === 'D' || degreeFormat.value === 'DM') return true
  switch (coord) {
  case 'c1': return validateCoordinate('secondsformat', c1.value.cSecond)
  case 'c2': return validateCoordinate('secondsformat', c2.value.cSecond)
  default: return false
  }
}

// computed properties (delegate to helpers)
const c1MeterValid = computed(() => isMeterValidHelper('c1'))
const c1DegreeValid = computed(() => isDegreeValidHelper('c1'))
const c1MinuteValid = computed(() => isMinuteValidHelper('c1'))
const c1SecondValid = computed(() => isSecondValidHelper('c1'))

const c2MeterValid = computed(() => isMeterValidHelper('c2'))
const c2DegreeValid = computed(() => isDegreeValidHelper('c2'))
const c2MinuteValid = computed(() => isMinuteValidHelper('c2'))
const c2SecondValid = computed(() => isSecondValidHelper('c2'))

const c3MeterValid = computed(() => isMeterValidHelper('c3'))


const areAllCoordinatesValid = () => {
  return (
    isMeterValidHelper('c1') && isDegreeValidHelper('c1') && isMinuteValidHelper('c1') && isSecondValidHelper('c1')
    && isMeterValidHelper('c2') && isDegreeValidHelper('c2') && isMinuteValidHelper('c2') && isSecondValidHelper('c2')
    && isMeterValidHelper('c3')
  )
}


const toFixedCoordinateFormat = (value, limit) => {
  const valueString = String(value)
  const [first, second] = valueString.split('.')
  if(!second) {
    return first
  }
  return `${first}.${second.slice(0, Math.min(limit, second.length))}`
}

const toRepresentation = () => {
  c3.value.cMeter = toFixedCoordinateFormat(baseCoords.value.v3, 4)

  let d1, d2, m1, m2, s1, s2

  if (isMeter.value) {
    c1.value.cMeter = toFixedCoordinateFormat(baseCoords.value.v1, 4)
    c2.value.cMeter = toFixedCoordinateFormat(baseCoords.value.v2, 4)
  } else {
    switch (degreeFormat.value) {
    case 'D': 
      c1.value.cDegree = toFixedCoordinateFormat(baseCoords.value.v1, 8)
      c2.value.cDegree = toFixedCoordinateFormat(baseCoords.value.v2, 8)
      break
    case 'DM':
      d1 = Math.floor(baseCoords.value.v1)
      d2 = Math.floor(baseCoords.value.v2)

      m1 = toFixedCoordinateFormat(((baseCoords.value.v1 - d1) * 60), 6)
      m2 = toFixedCoordinateFormat(((baseCoords.value.v2 - d2) * 60), 6)

      c1.value.cDegree = d1
      c1.value.cMinute = m1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      break
    case 'DMS':
      d1 = Math.floor(baseCoords.value.v1)
      d2 = Math.floor(baseCoords.value.v2)

      m1 = Math.floor((baseCoords.value.v1 - d1) * 60)
      m2 = Math.floor((baseCoords.value.v2 - d2) * 60)

      s1 = toFixedCoordinateFormat(((baseCoords.value.v1 - d1 - m1 / 60) * 3600), 4)
      s2 = toFixedCoordinateFormat(((baseCoords.value.v2 - d2 - m2 / 60) * 3600), 4)

      c1.value.cDegree = d1
      c1.value.cMinute = m1
      c1.value.cSecond = s1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      c2.value.cSecond = s2
      break
    }
  }
}
//should not modify any of the input (if)
const fromRepresentation = () => {
  
  if (isMeter.value) {
    baseCoords.value.v1 = parseFloat(c1.value.cMeter)
    baseCoords.value.v2 = parseFloat(c2.value.cMeter)
    baseCoords.value.v3 = parseFloat(c3.value.cMeter)
  } else {
    switch (degreeFormat.value) {
    case 'D': 
      baseCoords.value.v1 = parseFloat(c1.value.cDegree)
      baseCoords.value.v2 = parseFloat(c2.value.cDegree)
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    case 'DM':
      
      baseCoords.value.v1 = parseFloat(c1.value.cDegree) + parseFloat(c1.value.cMinute) / 60
      baseCoords.value.v2 = parseFloat(c2.value.cDegree) + parseFloat(c2.value.cMinute) / 60
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    case 'DMS':
      baseCoords.value.v1 = parseFloat(c1.value.cDegree) + parseFloat(c1.value.cMinute) / 60 + parseFloat(c1.value.cSecond) / 3600
      baseCoords.value.v2 = parseFloat(c2.value.cDegree) + parseFloat(c2.value.cMinute) / 60 + parseFloat(c2.value.cSecond) / 3600
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    }
  }
}


const formatInputCoor = () => {
  isMeter.value = (CRSInfo.value?.v1_unit ?? '') === 'metre' && (CRSInfo.value?.v2_unit ?? '') === 'metre'
  //if m is missing, something is wrong
  if(isMeter.value){
    c1.value.dirIndicator = 'm'
    c2.value.dirIndicator = 'm'
  }

  switch(CRSInfo.value.v1){
  case 'Easting':
    c1.value.dirIcon = svgPath + 'direction-east'
    break
  case 'Westing':
    c1.value.dirIcon = svgPath + 'direction-west'
    break
  case 'Breddegrad':
    c1.value.dirIcon= svgPath + 'direction-north'
    c1.value.dirIndicator = 'N'
  }

  switch(CRSInfo.value.v2){
  case 'Northing':
    c2.value.dirIcon = svgPath + 'direction-north'
    break
  case 'Længdegrad':
    c2.value.dirIcon = svgPath + 'direction-east'
    c2.value.dirIndicator = 'E'
  }
  switch(CRSInfo.value.v3){
  case 'Kote' : 
    c3.value.isHeight = true
    break
  case 'Ellipsoidehøjde' :
    c3.value.isHeight = true
    break
  default:
    c3.value.isHeight = false
  }

  c1.value.dirText = CRSInfo.value.v1
  c2.value.dirText = CRSInfo.value.v2
  c3.value.dirText = CRSInfo.value.v3
}


const debounceUpdate = () => {

  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  const valid = areAllCoordinatesValid()
  if(valid) {
    isUserInput.value = true
    debounceTimeout.value = setTimeout(() => {
      fromRepresentation()
      KtStore.setCoordinatesFrom({
        crs: KtStore.CRSFrom,
        coordinates: baseCoords.value,
      })

    }, 700)
  }

}

watch(CRSInfo, () => {
  formatInputCoor()
})

watch(coorFrom, (to) => {
  baseCoords.value = {
    v1: coorFrom.value.v1 || 0.0,
    v2: coorFrom.value.v2 || 0.0,
    v3: coorFrom.value.v3 || 0.0,
    v4: coorFrom.value.v4 || 0.0,
  }
  if(!isUserInput.value) {
    toRepresentation()
  }
  isUserInput.value = false
})

watch(degreeFormat, () => {
  toRepresentation()
})

onMounted(async() => {
  await CRSInfo.value
  baseCoords.value = {
    v1: coorFrom.value.v1 || 0.0,
    v2: coorFrom.value.v2 || 0.0,
    v3: coorFrom.value.v3 || 0.0,
    v4: coorFrom.value.v4 || 0.0,
  }
  formatInputCoor()
  toRepresentation()
})

</script>

<style>

</style>