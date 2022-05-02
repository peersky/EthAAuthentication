# Moonstream web3 auth

## This tool helps to generate accesss tokens for moonstream.to

usage:
`yarn add @peersky/web3auth`

```js
import { signAccessToken, parseToken, isOutdated } from "@peersky/web3auth";
```

Generate access token:

```js
const _getSignature = async () => {
  const token = await signAccessToken(account, window.ethereum, 60 * 60 * 24);
};
```

Read data conained in token:

```js
const objectToken = parseToken(token);
```

parseToken returns:

```ts
interface TokenInterface {
  address: string;
  deadline: number;
  signed_message: string;
}
```

check if deadline expired:

```js
isOutdated(objectToken?.deadline);
```
