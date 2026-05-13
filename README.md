# x402-Gateway: The Economic Substrate for Agentic Commerce

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Protocol: x402](https://img.shields.io/badge/Protocol-x402-00f5d4.svg)](#)
[![Network: Base](https://img.shields.io/badge/Network-Base-blue.svg)](https://base.org)

> "The economy of the future is not human-to-human; it is machine-to-machine. The x402-Gateway is the first bridge." — Tresslers Group Deep Research

## Overview

The `x402-gateway` is a production-grade reference implementation for gating digital intelligence behind autonomous on-chain payments. It utilizes the **HTTP 402 (Payment Required)** status code—originally reserved in 1991 for this exact purpose—to facilitate trustless settlement between AI agents and service providers on the **Base L2** network.

By utilizing **USDC** on Base, this gateway enables sub-cent transaction costs and near-instant finality, making it the ideal economic primitive for the Sovereign AI era.

## Strategic Capabilities

- **On-Chain Verification**: Real-time monitoring of the Base L2 network to verify USDC transfers.
- **Agent-Ready Payloads**: Standardized JSON responses that autonomous agents (Claude, GPT, etc.) can parse and act upon.
- **Framework Agnostic**: Easily integrates into Next.js, Express, or any Node.js-based API environment.
- **Low Entropy**: Zero-overhead verification using `viem`—no heavy dependencies or complex wallet setups required on the server side.

## Installation

```bash
npm install x402-gateway viem
```

## Quick Start (Next.js App Router)

```typescript
import { handleX402 } from 'x402-gateway';

export async function GET(request: Request) {
  const config = {
    masterWallet: '0xYourMasterWalletAddress',
    minimumAmount: '0.50', // 0.50 USDC
    enforce: process.env.NODE_ENV === 'production',
  };

  const { authorized, response } = await handleX402(request, config);

  if (!authorized) {
    return response;
  }

  // Your premium logic here
  return Response.json({ data: "High-fidelity intelligence payload." });
}
```

## Protocol Workflow

1. **Request**: An AI agent requests a resource.
2. **Challenge**: The gateway detects no payment proof and returns `HTTP 402` with instructions.
3. **Settlement**: The agent executes a USDC transfer to the `masterWallet` on Base L2.
4. **Ingestion**: The agent retries the request with the `x-payment-proof` header containing the transaction hash.
5. **Verification**: The gateway verifies the hash on-chain and grants access.

## Rationale: Why x402?

Traditional payment rails (Stripe, PayPal) were built for biological entities. They require browser-based authentication, KYC, and manual oversight. **Agentic Commerce** requires a protocol that is:
- **Programmable**: Native to the code.
- **Asynchronous**: Can be handled by an agent during a reasoning loop.
- **Sovereign**: No middleman between the provider and the consumer.

## Contributing

Tresslers Group welcomes contributions from the Sovereign AI community. Please submit pull requests to the `Tresslers Forge` repository.

---

**Tresslers Group Deep Research Division**
*Driven by Innovation. Defined by Impact. Standardizing the Machine Economy.*
*© 2026 Tresslers Group. Transmission Complete.*
