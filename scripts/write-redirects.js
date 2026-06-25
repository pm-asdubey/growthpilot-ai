// Writes _redirects into dist/ after the Vite build.
// Keeping it out of public/ prevents netlify dev from applying it during development,
// which would intercept Vite's module requests and cause a blank screen.
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const content = `/api/*  /.netlify/functions/:splat  200
/*      /index.html                 200
`

writeFileSync(resolve(process.cwd(), 'dist/_redirects'), content)
console.log('wrote dist/_redirects')
