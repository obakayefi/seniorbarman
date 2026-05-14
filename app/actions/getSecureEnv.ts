"use server"

/**
 * Ensures strict segregation between the Client DOM and the Node process.
 * Reads the OCH securely natively to conditionally render dev escalation nodes.
 */
export async function hasSecureOchEnv() {
    return !!process.env.OCH;
}
