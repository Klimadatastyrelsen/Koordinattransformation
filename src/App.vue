<template>
  <KoorHeader :signed-in="signedIn" />
  <main>
    <router-view />
  </main>
</template>


<script setup>
import KoorHeader from './components/shared/KoorHeader.vue'
import { useKtStore } from './store/store.js'
import { useRouter } from 'vue-router'
import { isSignedIn } from './auth.js'
import { onBeforeMount, onMounted, provide, onBeforeUnmount, ref, nextTick } from 'vue'

const KtStore = useKtStore()
const router = useRouter()

const signedIn = ref(false)
const isMobile = ref(window.innerWidth < 1055)
provide('isMobile', isMobile)

onBeforeMount(async () => {
  // after the first navigation, so /callback has stored the session
  await router.isReady()
  signedIn.value = await isSignedIn()
  if (signedIn.value) await KtStore.fetchCRSOptions()
  await nextTick()
})

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
