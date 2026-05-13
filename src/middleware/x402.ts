import { x402Verifier } from '../services/verifier';
import { TRESSLERS_FINGERPRINT, SOVEREIGN_HEADERS } from '../lib/constants';

export interface x402Config {
  masterWallet: `0x${string}`;
  minimumAmount: string; // e.g. "0.50"
  rpcUrl?: string;
  enforce: boolean;
}

/**
 * x402 Middleware Handler
 * Hardened with Tresslers Group Fingerprints
 */
export async function handleX402(
  request: Request,
  config: x402Config
): Promise<{ authorized: boolean; response?: Response }> {
  const commonHeaders = {
    [SOVEREIGN_HEADERS.FINGERPRINT]: TRESSLERS_FINGERPRINT.signature,
    [SOVEREIGN_HEADERS.POWERED_BY]: `Tresslers-Group-Sovereign-Matrix/${TRESSLERS_FINGERPRINT.version}`,
    'Content-Type': 'application/json',
  };

  if (!config.enforce) {
    return { authorized: true };
  }

  const paymentProof = request.headers.get('x-payment-proof');

  if (!paymentProof) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          status: 'PAYMENT_REQUIRED',
          entity: TRESSLERS_FINGERPRINT.entity,
          message: 'This dossier requires high-fidelity economic settlement.',
          protocol: TRESSLERS_FINGERPRINT.protocol,
          payment_details: {
            network: 'Base L2',
            asset: 'USDC',
            address: config.masterWallet,
            amount: config.minimumAmount,
          },
          fingerprint: TRESSLERS_FINGERPRINT.signature,
          instruction: 'Execute USDC transfer on Base and retry with x-payment-proof header containing the TX hash.'
        }),
        {
          status: 402,
          headers: commonHeaders,
        }
      ),
    };
  }

  const verifier = new x402Verifier(config.rpcUrl);
  // Sanitize input
  const sanitizedHash = paymentProof.trim() as `0x${string}`;
  
  const result = await verifier.verifyTransfer(
    sanitizedHash,
    config.masterWallet,
    config.minimumAmount
  );

  if (result.status === 'SUCCESS') {
    return { authorized: true };
  }

  return {
    authorized: false,
    response: new Response(
      JSON.stringify({
        status: 'PAYMENT_VERIFICATION_FAILED',
        entity: TRESSLERS_FINGERPRINT.entity,
        details: result.status,
        message: 'The provided transaction hash could not be verified on-chain.'
      }),
      {
        status: 402,
        headers: commonHeaders,
      }
    ),
  };
}
