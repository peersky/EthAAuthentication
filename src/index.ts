import {
  HDNodeWallet,
  JsonRpcSigner,
  TypedDataDomain,
  Wallet,
  ethers,
} from "ethers";

const types = {
  EOAAuth: [
    {
      type: "address",
      name: "address",
    },
    {
      type: "uint256",
      name: "deadline",
    },
  ],
};

const defaultName = "Ethereum Address Authentication";
const defaultVersion = "1";

interface TokenInterface {
  address: string;
  deadline: number;
  signature: string;
}

/**
 * Signs an access token
 * @function signAccessToken
 * @param  {String} signer  Signer who will sign the token
 * @param  {String} duration How long token should be valid [Seconds]
 * @param  {String} domain Optional EIP712 compliant domain data
 * @return {Promise<string>} base64 encoded token
 */
export async function signAccessToken(
  signer: Wallet | JsonRpcSigner | HDNodeWallet,
  duration: number,
  domain: TypedDataDomain = {
    name: defaultName,
    version: defaultVersion,
  }
): Promise<string> {
  const message = {
    address: await signer.getAddress(),
    deadline: Math.floor(new Date().getTime() / 1000) + duration,
  };

  const _s = await signer.signTypedData(domain, types, message);

  const retval = Buffer.from(
    JSON.stringify({
      address: message.address,
      deadline: message.deadline,
      signature: _s,
    }),
    "utf-8"
  ).toString("base64");

  return retval;
}

/**
 * Parses a base64 encoded token
 * @function parseToken
 * @param  {String} token token
 * @return {TokenInterface}
 */
export function parseToken(token: string) {
  const stringToken = Buffer.from(token, "base64").toString("ascii");
  const objectToken: TokenInterface =
    stringToken !== ""
      ? JSON.parse(`${stringToken}`)
      : { address: null, deadline: null, signature: null };
  if (!objectToken.address) throw new Error("Parsing token failed");
  return objectToken;
}

/**
 * Checks if token is outdated
 * @function isOutdated
 * @param  {string | number} deadline in seconds since midnight, January 1, 1970 UTC.
 * @return {boolean}
 */
export function isOutdated(deadline: number | string) {
  if (!deadline) return true;
  if (Number(deadline) <= Math.floor(new Date().getTime() / 1000)) return true;
  return false;
}

/**
 * Validates if token is legit
 * @function validateToken
 * @param  {string} token base64 encoded token
 * @param {domain} domain Optional EIP712 domain data
 * @return {boolean} If true => token is legit
 */
export function validateToken(
  token: string,
  domain: TypedDataDomain = { name: defaultName, version: defaultVersion }
) {
  const parsed = parseToken(token);
  if (isOutdated(parsed.deadline)) {
    console.log("EOA Auth token is outdated");
    return false;
  }

  const signerAddress = ethers.verifyTypedData(
    domain,
    types,
    {
      address: parsed.address,
      deadline: parsed.deadline,
    },
    parsed.signature
  );
  return signerAddress === parsed.address;
}
/**
 * Tries to get an authenticated addess from provided token.
 * Will Throw if authentication fails.
 * @function tryGetAuthenticated
 * @param  {string} token base64 encoded token
 * @param {domain} domain Optional EIP712 domain data
 * @return {boolean} If true => token is legit
 */
export function tryGetAuthenticated(
  token: string,
  domain: TypedDataDomain = { name: defaultName, version: defaultVersion }
) {
  if (!validateToken(token, domain)) throw new Error("Authentication failed");
  return parseToken(token).address;
}
export default {
  validateToken,
  isOutdated,
  parseToken,
  signAccessToken,
};
