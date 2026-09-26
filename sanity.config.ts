'use client'

/**
 * Sanity Studio configuration.
 *
 * The Studio is mounted by this same Next.js app at `/studio`, and the
 * Presentation Tool loads the site from `/` inside an iframe, so the two share
 * an origin.
 */
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {resolve} from './src/presentation/resolve'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

/**
 * Origin of this app. Used both to load the site in the preview iframe and, via
 * `allowOrigins`, to authorise Comlink messages between the Studio and the
 * preview. Falls back to localhost during `next dev`.
 */
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin)

const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || `${siteOrigin}/studio`

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),

    // The visual editor: the real website in an iframe, with click-to-edit.
    presentationTool({
      resolve,
      previewUrl: {
        initial: siteOrigin,
        previewMode: {
          // Called when the preview opens, to switch this browser session to
          // draft content. The route validates a signed secret first.
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      // Only this origin may exchange messages with the preview.
      allowOrigins: [siteOrigin],
    }),

    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  studioUrl,
})
