This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



## Contract Integration

To interact with the smart contracts from the frontend, follow these steps:

1. **Setup Environment Variables:**
   - In the `frontend` directory, create a `.env.local` file with the following content:
     ```
     NEXT_PUBLIC_ROOTSTOCK_RPC_URL=your_rpc_url
     NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=your_factory_contract_address
     ```
   - Replace `your_rpc_url` with the Rootstock RPC URL and `your_factory_contract_address` with the deployed factory contract address.

   ```markdown
   - Update your `.env.local` file to include Web3Auth configuration:
     ```
     NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
     ```
   - Replace `your_web3auth_client_id` with your actual Web3Auth Client ID obtained from the Web3Auth dashboard.
   - Ensure the RPC URL is set to the Rootstock Testnet public node.

2. **Update Contract ABI:**
   - Ensure the ABI file `CrowdLeasingFactory.json` is placed in `frontend/abi`. This file is necessary for interacting with the contract using Web3 or Ethers.js.

3. **Developing and Testing:**
   - Start the development server with `npm run dev` or `yarn dev`.
   - The frontend is set up to interact with the smart contracts using the configuration in `frontend/src/contract.js`.

## Integrating Web3Auth with Rootstock

To enable user authentication and connect to the Rootstock network using Web3Auth, follow these steps:

1. **Install Web3Auth and Web3.js:**
   Ensure you have the required packages installed by running:
   ```bash
   npm install @web3auth/modal @web3auth/ethereum-provider web3
2. Configure Web3Auth:

      Refer to the official Web3Auth documentation for Rootstock to set up Web3Auth in your application.
      Make sure to initialize Web3Auth using your clientId from your environment variables and configure it to use the Rootstock Testnet as described in the documentation.

3. Testing the Integration:

Start the development server with npm run dev or yarn dev.
Use the buttons provided in the UI to authenticate via Web3Auth, view account details, get balances, sign messages, and send transactions.
Ensure that all functionalities work correctly on the Rootstock Testnet.

Open frontend/src/page.tsx and set up Web3Auth with the following configuration:
Ensure you initialize Web3Auth using clientId from your environment variables and configure it to use the Rootstock Testnet as follows:


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
