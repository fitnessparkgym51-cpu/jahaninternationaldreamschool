/**
 * Sanity CLI configuration.
 * https://www.sanity.io/docs/cli
 */
import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    // Glob of files that may contain `defineQuery()` calls.
    path: './src/**/*.{ts,tsx,js,jsx}',
    // Regenerate with: npx sanity schema extract --path ./schema.json
    schema: './schema.json',
    generates: './src/sanity/types/sanity.types.ts',
    overloadClientMethods: true,
  },
})
