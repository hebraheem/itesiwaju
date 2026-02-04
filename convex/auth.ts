export function decodeIdentity(identity: any) {
  return JSON.parse(Buffer.from(identity.tokenIdentifier, "base64").toString());
}
