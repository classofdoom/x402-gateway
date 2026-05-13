/**
 * x402 Handshake Helper
 * Assists AI agents in handling the 402 challenge.
 */

export interface x402Challenge {
  network: string;
  asset: string;
  address: string;
  amount: string;
}

export class x402Client {
  /**
   * Parses a 402 response from a Tresslers Group compatible endpoint.
   */
  static parseChallenge(responseBody: any): x402Challenge | null {
    if (responseBody?.status === 'PAYMENT_REQUIRED' && responseBody?.payment_details) {
      return responseBody.payment_details as x402Challenge;
    }
    return null;
  }

  /**
   * Wraps a fetch call with automatic x402 header injection if a proof is available.
   */
  static async authenticatedFetch(
    url: string,
    paymentProof?: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (paymentProof) {
      headers.set('x-payment-proof', paymentProof);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}
