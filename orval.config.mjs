import { defineConfig } from 'orval'

export default defineConfig({
  prescriptions: {
    input: '../../backend/openapi.json',
    output: {
      target: './src/lib/api/generated',
      schemas: './src/lib/api/generated/schemas',
      client: 'react-query',
      httpClient: 'axios',
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
