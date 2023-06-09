/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

module.exports = {
  publicRuntimeConfig: {
    conductor: {
      keyId: process.env.KEY,
      keySecret: process.env.SECRET,
      serverUrl: process.env.SERVER_URL,
    },
    workflows: {
      requestForLoan: `${process.env.WF_NAME || "loan-origination-flow-test"}`,
      correlationId: "aCorrelationId",
    },
  },
  reactStrictMode: false,
  output: "standalone",
};
