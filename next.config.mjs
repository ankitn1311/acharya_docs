import nextra from 'nextra';

// Set up Nextra with its configuration
const withNextra = nextra({
  // turbopack: {
  //   resolveAlias: {
  //     // Path to your `mdx-components` file with extension
  //     'next-mdx-import-source-file': './src/mdx-components.tsx',
  //   },
  // },
  // ... Add Nextra-specific options here
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here
});
