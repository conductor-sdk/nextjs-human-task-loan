/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

module.exports = {
  publicRuntimeConfig: {
    conductor: {
      keyId: "be8443ad-1e46-4147-ad81-d9fa432da77d",//process.env.KEY,
      keySecret: "9lip5lhanqAmevU42wocyMjOnO2u2eFscEAYWo0wpsfRzRcg",//process.env.SECRET,
      serverUrl: "https://ui-dev.orkesconductor.io/api"//process.env.SERVER_URL,
    },
    workflows: {
      //requestForLoan: `${process.env.WF_NAME || "loan-origination-flow-test-jim-up"}`,
      requestForLoan: `${process.env.WF_NAME || "super_simple_human_loan"}`,
      correlationId: "loanRequestApp",
    },
  },
  reactStrictMode: false,
  output: "standalone",
};
