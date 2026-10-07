<template>
  <KoorHeader />
  <main>
    <router-view />
  </main>
</template>


<script setup>
import KoorHeader from './components/shared/KoorHeader.vue'
import { useKtStore } from './store/store.js'
import { signedIn } from './auth.js'
import { onMounted, provide, onBeforeUnmount, ref, watch } from 'vue'

const KtStore = useKtStore()

const isMobile = ref(window.innerWidth < 1055)
provide('isMobile', isMobile)

// immediate: the first guard can resolve before the app mounts
watch(signedIn, (value) => {
  if (value) KtStore.fetchCRSOptions()
}, { immediate: true })

onMounted(() => {
  const handleResize = () => {
    isMobile.value = window.innerWidth < 1055
  }
  window.addEventListener('resize', handleResize)

})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

</script>
