// import { Buffer } from 'buffer';
interface TokenInterface {
  address: string;
  deadline: number;
  signed_message: string;
}

async function signAccessToken(
  account: string,
  provider: any,
  duration: number
): Promise<string> {
  console.log("auth flow entring");
  if (duration <= 0 || duration == undefined)
    throw new Error("signAccessToken: duration must be defined");
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain: {
      // Give a user friendly name to the specific contract you are signing for.
      name: "MoonstreamAuthorization",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      // "_name_": "MoonstreamAuthorization", // The value to sign
      address: account,
      // "_version_": "1",
      deadline: Math.floor(new Date().getTime() / 1000) + duration,
      // deadline: "1651008410"
    },
    // Refers to the keys of the *types* object below.
    primaryType: "MoonstreamAuthorization",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
      // Refer to PrimaryType
      MoonstreamAuthorization: [
        {
          type: "address",
          name: "address",
        },
        {
          type: "uint256",
          name: "deadline",
        },
      ],
    },
  });

  const result = await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });

  const retval = Buffer.from(
    JSON.stringify({
      address: account,
      deadline: JSON.parse(msgParams).message.deadline,
      signed_message: result,
    }),
    "utf-8"
  ).toString("base64");

  return retval;
}

function parseToken(token: string) {
  const stringToken = Buffer.from(token, "base64").toString("ascii");
  const objectToken: TokenInterface =
    stringToken !== ""
      ? JSON.parse(`${stringToken}`)
      : { address: null, deadline: null, signed_message: null };

  return objectToken;
}
