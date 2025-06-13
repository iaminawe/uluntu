## Environment Configuration

### .env.example

This file serves as a template for the environment variables required by the application. It defines the necessary Supabase configuration, including the URL, anonymous key, storage URL, and the profile images bucket name. Replace the placeholder values with your actual Supabase credentials.

### .env.production

This file defines the environment variables used in the production environment. It contains the actual Supabase URL, anonymous key, storage URL, and the profile images bucket name for the production Supabase instance. These values should be kept secret and securely managed.

## Code Quality and Styling

### eslint.config.js

This file configures ESLint, a JavaScript linter, for the project. It extends the recommended configurations from `@eslint/js` and `typescript-eslint` to enforce code quality and style guidelines. It also configures the `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` plugins for React-specific linting rules. The configuration applies to all `.ts` and `.tsx` files in the project, ensuring consistent code style and helping to prevent errors.

### postcss.config.js

This file configures PostCSS, a tool for transforming CSS, for the project. It specifies the use of Tailwind CSS for styling and Autoprefixer for adding vendor prefixes to CSS rules. This configuration ensures consistent styling across different browsers and devices.