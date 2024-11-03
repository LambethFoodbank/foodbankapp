Lambeth Foodbank
=================

Lambeth Foodbank provides foodbank services to clients in south London that have been issued with a foodbank voucher
(by front-line professionals like social workers, doctors or police). Since the COVID-19 pandemic, most food parcels
have been delivered to clients.

## Technology stack

* [Supabase](https://supabase.com/docs) for hosting the backend (PostgreSQL database, custom authentication)
* [NextJS](https://nextjs.org/docs) for full-stack application ('App Router')
* [Styled Components](https://styled-components.com/docs) for CSS (CSS-in-JS)
* [Material UI](https://mui.com/material-ui/getting-started/) for component library
* [Cypress](https://docs.cypress.io/guides/overview/why-cypress) for end to end tests
* [Jest](https://jestjs.io/docs/getting-started) for component and unit tests
* [AWS Amplify](https://aws.amazon.com/amplify/) for hosting the frontend website
  * Amplify automatically watches the repo for changes and deploys from specific branches
* [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) for logging errors and warnings
* [Snaplet](https://docs.snaplet.dev/seed/getting-started/overview) for generating deterministic seeded data

## Requirements
- Docker
  - The easiest way to get started is to download [Docker Desktop](https://www.docker.com/products/docker-desktop/).
  - If you are using Windows, you may have to run `net localgroup docker-users <your_softwire_username> /ADD` as an administrator to add yourself to the docker-users group, where `<your_softwire_username>` is your non-admin Softwire username.
  - Whenever running the website locally, Docker must be running (start docker desktop, once it's going you can close the window if you want).

## Development

### First time setup 

* Download .env.local (Local) from Keeper and put in the top-level directory as `.env.local`. Check that this file has NEXT_PUBLIC_SUPABASE_URL set to http://127.0.0.1:54321

* Run `npx snaplet auth setup` to log into Snaplet 

* Use `npm run post_checkout` to install any dependencies.
  * If you get an error similar to 
    > Stopped supabase local development setup.
failed to start docker container: Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:54322 -> 0.0.0.0:0: listen tcp 0.0.0.0:54322: bind: An attempt was made to access a socket in a way forbidden by its access permissions.

    Run the following commands:

    ```
    net stop winnat
    netsh int ipv4 add excludedportrange protocol=tcp startport=554322 numberofports=1
    net start winnat
    ```
    then re-run `npm run post_checkout`

* If you're using WSL, you need to download some dependencies for Cypress:
  ```shell
  sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
  ```

### Running locally
* Run website locally (`npm run dev`) and log in with one of the dev user credentials
  * Note that the login page can be slightly flaky, but if it doesn't immediately error then it should be signed in!
    Pressing any of the navigation bar buttons will not then redirect you to the login page.
  * Dev user credentials:

    | Email                 | Password     | Role      |
    |-----------------------|--------------|-----------|
    | admin@example.com     | admin123     | admin     |
    | volunteer@example.com | volunteer123 | volunteer |
    | manager@example.com   | manager123   | manager   |
    | staff@example.com     | staff123     | staff     |

### Repo structure
* The best place to start is `src/app`, where the website is based! Look at the folder structure for an idea of what the
  website navigation will be.

* (Optional) Install 'axe DevTools' to check that the website is accessible:
  https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd?utm_source=deque.com&utm_medium=referral&utm_campaign=axe_hero

### Helpful commands

* `npm run dev` to launch the website locally
    * This has hot-reloading, so will update every time you save any TypeScript document

* `npm run lint_fix` to get ESLint to try and fix any linting mistakes, and to report anything it cannot fix

* `npm run post_checkout` to ensure the database and packages are up-to-date after switching to a new branch 
  * install new packages
  * reset the database
  * create one test user of each role
  * reseed the data, without regenerating the seed
  
* `npm run build` to make an optimised build - you'll need to do this before running tests.

* `npm run test` to run all tests. This will run Cypress component and integration and Jest component tests.
  * single out test suites with:
    * `npm run test:component` for Jest component (unit) tests
    * `npm run cypress:e2e` for just Cypress end-to-end tests
    * `npm run jest:component` for just Jest component tests
    * `npm run test:coverage` for a full coverage report at the end
  * open the Cypress UI to see individual results with `npm run cypress:open`

* `npx supabase functions serve` to run Supabase functions locally

* `npx supabase migration list` to compare what migrations are applied locally and on remote

* `npx supabase migrations up --include-all --local` to run outstanding migrations locally

* `npm run reset_supabase` to
  * reset the Supabase database based on the migration files and the seed data
  * create one test user of each role
  * upload the congestion charge postcodes to the local Supabase storage

* `npm run db:generate_seed` to generate `supabase/seed.sql` based on `supabase/seed/seed.ts`
  * This does not automatically put the data in the database. You'll need to run `npm run dev:reset_supabase`

* If you set the environment variable `ANALZYE=true` in your shell before building the app, Next will create reports
on the various bundle sizes when it builds and open them in your browser for you
  * Powershell: `$env:ANALYZE='true'`


### Supabase development

To use the Supabase CLI:
* You'll need to have created a personal access token in Supabase and run `supabase login`
* For many supabase features you'll need to have Docker running
* Run the commands as `supabase [...]`

### Database
Database migrations are tracked under /supabase/migrations.

#### Make database changes
You can either
- Access the local Supabase console at http://localhost:54323 to update tables, and use
  ```shell
  npx supabase db diff -f <name_of_migration>
  ```
  to generate a migration sql file (recommended), or
- Create a migration file using
  ```shell
  npx supabase migration new <name_of_migration>
  ```
  and write sql queries yourself (not recommended)

*WARNING*: If you're recreating a view in your migration, make sure you create it `with(security_invoker = true)`, or the view is publicly available.

#### Update the TypeScript database type definition
You can regenerate the types
- from the local database
  ```shell
  npm run generate_types:local
  ```
- from the deployed database (probably won't be used but for reference)
  ```shell
  npm run generate_types:remote -- --project-id <PROJECT_ID>
  ```

#### Create sample data in tables
- Create sample data by updating supabase/seed/seed.ts
- Login to snaplet
  ```shell
  npx snaplet auth setup
  ```
- Follow link and log in using credentials in keeper
- Regenerate assets in sync with your new database 
  ```shell
  npx snaplet generate
  ```
- If error with createSeedClient, close IDE and restart
- Then generate `supabase/seed.sql` from `supabase/seed/seed.ts`
  ```shell
  npm run db:generate_seed
  ```
- Finally put the data into the database
  ```shell
  npm run reset_supabase
  ```

#### Useful links
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Migration commmands](https://supabase.com/docs/reference/cli/supabase-migration)
- [Managing Environments](https://supabase.com/docs/guides/cli/managing-environments)
- [Deploy a migration](https://supabase.com/docs/guides/cli/managing-environments?environment=ci#deploy-a-migration)

## Other docs
- [How We Use Supabase](./docs/how-we-use-supabase.md)
- [Password Reset Flow](./docs/password-reset-flow.md)
- [Invite User Flow](./docs/invite-user-flow.md)
- [Release Instructions](./docs/release.md)
- [Common Problems](./docs/common-problems.md)
- [Design Choices](./docs/design-choices.md)
- [E2E Testing](./docs/e2e-testing.md)
- [Disaster Recovery Plan](./docs/disaster-recovery-plan.md)
- [Logging](./docs/logging.md)
