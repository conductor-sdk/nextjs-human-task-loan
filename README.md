# Example Loan workflow using human task

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerquisite
1. node >= 18
2. port 3000 open
3. Conductor server

### Setup conductor server (IMPORTANT)
1. To run this app against a server, you need to set the KEY, SECRET and server URL
2. To obtain the KEY and SECRET for the server, visit the applications from the Conductor UI, create a new application and copy the KEY and SECRET.  
4. Export the variables as below
```shell
# set the KEY and SECRET values with the one obtained from the Conductor UI after creating an application
export KEY=
export SECRET=
# replace CONDUCTOR_SERVER with the actual hostname, the URL must end with /api
export SERVER_URL=http://CONDUCTOR_SERVER/api
# Optional checkout workflow name defaults to MyCheckout2
export WF_NAME=loan-origination-flow-test
```

## Running the app

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
