import nextConfig from "eslint-config-next"

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "public/**", "coverage/**"],
  },
  {
    rules: {
      // This rule (new in eslint-plugin-react-hooks v7) flags every
      // "fetch/read on mount, then setState" effect — the idiomatic pattern
      // used throughout this app (search results, favorites, account
      // dashboard, restoring state from localStorage). None of these are
      // bugs: each sets state from an external system (API, localStorage),
      // exactly what effects are for. Kept as a warning so genuinely
      // avoidable cases still get flagged during review.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]

export default config
