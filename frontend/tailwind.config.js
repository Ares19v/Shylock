/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "surface-container": "#edeeef",
              "primary": "#040b16",
              "tertiary": "#050b14",
              "on-surface-variant": "#45474c",
              "surface-container-high": "#e7e8e9",
              "secondary-container": "#dee0e4",
              "on-background": "#191c1d",
              "on-secondary-container": "#606366",
              "surface": "#f8f9fa",
              "on-tertiary-fixed": "#151c25",
              "surface-container-lowest": "#ffffff",
              "primary-fixed-dim": "#bfc7d7",
              "on-secondary-fixed-variant": "#44474a",
              "surface-dim": "#d9dadb",
              "primary-container": "#1a222e",
              "error-container": "#ffdad6",
              "on-primary": "#ffffff",
              "inverse-primary": "#bfc7d7",
              "inverse-on-surface": "#f0f1f2",
              "secondary": "#5c5f62",
              "outline-variant": "#c5c6cc",
              "on-secondary": "#ffffff",
              "surface-bright": "#f8f9fa",
              "secondary-fixed-dim": "#c4c7ca",
              "on-error-container": "#93000a",
              "on-tertiary-fixed-variant": "#404752",
              "surface-variant": "#e1e3e4",
              "on-tertiary-container": "#828995",
              "surface-container-low": "#f3f4f5",
              "primary-fixed": "#dbe3f3",
              "on-surface": "#191c1d",
              "outline": "#75777c",
              "tertiary-fixed-dim": "#c0c7d3",
              "on-primary-fixed-variant": "#3f4754",
              "error": "#ba1a1a",
              "secondary-fixed": "#e0e2e6",
              "surface-tint": "#575f6d",
              "on-secondary-fixed": "#191c1f",
              "background": "#f8f9fa",
              "tertiary-fixed": "#dce3f0",
              "on-primary-container": "#818998",
              "on-primary-fixed": "#141c28",
              "on-tertiary": "#ffffff",
              "inverse-surface": "#2e3132",
              "tertiary-container": "#1b222b",
              "surface-container-highest": "#e1e3e4",
              "on-error": "#ffffff"
          },
          "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
          },
          "spacing": {
              "section-gap": "120px",
              "margin-page": "64px",
              "component-padding-x": "16px",
              "component-padding-y": "12px",
              "gutter": "24px",
              "unit": "4px"
          },
          "fontFamily": {
              "label-sm": ["Inter"],
              "caption": ["Inter"],
              "h2": ["Inter"],
              "body-lg": ["Inter"],
              "body-md": ["Inter"],
              "h1": ["Inter"],
              "h3": ["Inter"]
          },
          "fontSize": {
              "label-sm": ["14px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
              "caption": ["12px", { "lineHeight": "1.4", "fontWeight": "400" }],
              "h2": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
              "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
              "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
              "h1": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
              "h3": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }]
          }
      }
  },
  plugins: [],
}
