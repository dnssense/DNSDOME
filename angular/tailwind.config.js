/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './node_modules/roksit-lib/esm2022/**/*.mjs',
        './node_modules/roksit-lib/**/*.{html,ts,scss,sass,css}',
        './src/**/*.{html,ts,scss,sass,css}'
    ],
    plugins: [
        ...require('./node_modules/roksit-lib/assets/tailwind-plugin').plugins
    ]
}

