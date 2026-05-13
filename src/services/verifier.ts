import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { TRESSLERS_FINGERPRINT } from '../lib/constants';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const LOG_PREFIX = `[${TRESSLERS_FINGERPRINT.matrical_origin}]`;

export interface VerificationResult {
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'INVALID';
  amount?: string;
  sender?: string;
  timestamp?: string;
}

export class x402Verifier {
  private client;

  constructor(rpcUrl?: string) {
    this.client = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });
  }

  /**
   * Verifies a USDC transfer on Base L2.
   * Hardened for Sovereign Execution.
   */
  async verifyTransfer(
    txHash: `0x${string}`,
    expectedRecipient: `0x${string}`,
    minimumAmount: string
  ): Promise<VerificationResult> {
    const start = Date.now();
    console.log(`${LOG_PREFIX} Initiating verification for TX: ${txHash}`);

    try {
      // Add a 10s timeout to on-chain calls
      const receipt = await Promise.race([
        this.client.waitForTransactionReceipt({ hash: txHash }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000))
      ]);

      if (receipt.status !== 'success') {
        console.warn(`${LOG_PREFIX} TX ${txHash} failed on-chain.`);
        return { status: 'FAILED' };
      }

      // Look for USDC Transfer events in the logs
      const logs = receipt.logs.filter(
        (log) => log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()
      );

      for (const log of logs) {
        try {
          const topics = log.topics;
          // ERC-20 Transfer Signature
          if (topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            const from = `0x${topics[1]?.slice(26)}`.toLowerCase();
            const to = `0x${topics[2]?.slice(26)}`.toLowerCase();
            
            const value = BigInt(log.data);
            const amountInDecimal = (Number(value) / 1_000_000).toString();

            if (to === expectedRecipient.toLowerCase() && Number(amountInDecimal) >= Number(minimumAmount)) {
              console.log(`${LOG_PREFIX} SUCCESS: Verified ${amountInDecimal} USDC from ${from}. Latency: ${Date.now() - start}ms`);
              return {
                status: 'SUCCESS',
                amount: amountInDecimal,
                sender: from,
                timestamp: new Date().toISOString(),
              };
            }
          }
        } catch (e) {
          console.error(`${LOG_PREFIX} Log parsing error:`, e);
        }
      }

      console.warn(`${LOG_PREFIX} INVALID: TX ${txHash} did not contain a valid transfer to ${expectedRecipient}.`);
      return { status: 'INVALID' };
    } catch (error) {
      console.error(`${LOG_PREFIX} VERIFICATION_ERROR:`, error instanceof Error ? error.message : error);
      return { status: 'FAILED' };
    }
  }
}
