// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    rules: {
        "prettier/prettier": [
            "error",
            {
                semi: true,
                singleQuote: false,
                printWidth: 120,
                arrowParens: "always",
                endOfLine: "auto",
                tabWidth: 4,
            },
        ],
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
    },
};
