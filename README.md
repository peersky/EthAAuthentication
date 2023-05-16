# Ethereum Address Authentication

Build an authentication workflow with using Ethereum address and EIP712.

token is stored as base64 encoded string of an object of following interface:

```ts
interface TokenInterface {
  address: string;
  deadline: number;
  signature: string;
}
```

Deadline is stored as number (in seconds).

install:
`yarn add @peersky/eth-auth`

### Frontend

API:

```ts
/**
 * Signs an access token
 * @function signAccessToken
 * @param  {String} signer  Signer who will sign the token
 * @param  {String} duration How long token should be valid [Seconds]
 * @param  {String} domain Optional EIP712 compliant domain data
 * @return {Promise<string>} base64 encoded token
 */
function signAccessToken(
  signer: Wallet | JsonRpcSigner | HDNodeWallet,
  duration: number,
  domain?: TypedDataDomain
): Promise<string>;
/**
 * Parses a base64 encoded token
 * @function parseToken
 * @param  {String} token token
 * @return {TokenInterface}
 */
function parseToken(token: string): TokenInterface;
/**
 * Checks if token is outdated
 * @function isOutdated
 * @param  {string | number} deadline in seconds since midnight, January 1, 1970 UTC.
 * @return {boolean}
 */
function isOutdated(deadline: number | string): boolean;
/**
 * Validates if token is legit
 * @function validateToken
 * @param  {string} token base64 encoded token
 * @param {domain} domain Optional EIP712 domain data
 * @return {boolean} If true => token is legit
 */
function validateToken(token: string, domain?: TypedDataDomain): boolean;
/**
 * Tries to get an authenticated addess from provided token.
 * Will Throw if authentication fails.
 * @function tryGetAuthenticated
 * @param  {string} token base64 encoded token
 * @param {domain} domain Optional EIP712 domain data
 * @return {boolean} If true => token is legit
 */
function tryGetAuthenticated(token: string, domain?: TypedDataDomain): string;
```
