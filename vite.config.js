import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// fills ${VITE_*} in index.html from .env.<mode>; production builds keep them for envsubst
function configSubst(env) {
  return {
    name: 'kt-config-subst',
    apply: (_, { mode }) => mode !== 'production',
    transformIndexHtml(html) {
      return html.replace(/\$\{(VITE_[A-Z0-9_]+)\}/g, (_, name) => env[name] ?? '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'BIFROST_'])
  return {
    server: {
      // bifrost does not accept the fake idp's tokens; send an api key instead
      proxy: env.BIFROST_KEY ? {
        '/bifrost': {
          target: env.BIFROST_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bifrost/, ''),
          headers: { Authorization: `Bearer ${env.BIFROST_KEY}` },
        },
      } : undefined,
    },
    resolve: {
      //forces vite to use the full vue bundler even when running in test
      alias: {
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    plugins: [
      configSubst(env),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.includes('ds-')
          }
        }
      }),
      viteStaticCopy({
        targets: [
          {
            src: './src/assets/icons/icons.svg',
            dest: ''
          }
        ]
      })
    ],
  }
})
