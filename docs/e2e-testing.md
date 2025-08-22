# E2E Testing

## How to run tests
- Run `npm run dev -- -p 3200` to run the dev server on port 3200, where Cypress will run the tests on
- Use `npx cypress open` to open Cypress client to run specific tests and allow hot-reloads.
- You can also do `npm run build` and then `npm run test:e2e --spec=<your_test_file_path>` to run tests in the specific file


## Common problems
### Accessibility.cy.ts
- If there is an accessibility violation error (expected 0, got 1), look for the following:
  - an element does not have inner text that is visible to screen readers
  - an aria-label attribute does not exist or is empty
  - an aria-labeledby does not exist, references elements that do not exist or references elements that are empty
  - an element has no title attribute
  - an element's default semantics were not overridden with role = "none" or role = "presentation"