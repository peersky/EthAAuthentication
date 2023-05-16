import { expect } from "chai";
// import { describe, it } from "mocha";
import {
  validateToken,
  signAccessToken,
  isOutdated,
  parseToken,
  tryGetAuthenticated,
} from "../dist/index.js";
import { ethers } from "ethers";
describe("When signing with default domain", function () {
  it("Should be able to validate signature", async function () {
    const signer = ethers.Wallet.createRandom();
    const token = await signAccessToken(signer, 100000);
    const isValid = validateToken(token);
    expect(isValid).to.be.true;
  });
  it("Should timeout if deadline reached", async () => {
    const signer = ethers.Wallet.createRandom();
    const token = await signAccessToken(signer, 1);
    await new Promise((resolve) => setTimeout(resolve, 1001));
    const isValid = validateToken(token);
    const parsed = parseToken(token);
    expect(isOutdated(parsed.deadline)).to.be.true;
    expect(isValid).to.be.false;
  });
  describe("tryGetAuthenticated() should", () => {
    it("Return correct signer address if valid", async () => {
      const signer = ethers.Wallet.createRandom();
      const token = await signAccessToken(signer, 100000);
      expect(tryGetAuthenticated(token)).to.be.equal(signer.address);
    });
    it("Return throw if outdated ", async () => {
      const signer = ethers.Wallet.createRandom();
      const token = await signAccessToken(signer, 1);
      await new Promise((resolve) => setTimeout(resolve, 1001));
      expect(() => tryGetAuthenticated(token)).to.be.throw(
        "Authentication failed"
      );
    });
    it("Return throw if addresses do not match ", async () => {
      const signer = ethers.Wallet.createRandom();
      const legitToken = await signAccessToken(signer, 10000);
      const maliciousSigner = ethers.Wallet.createRandom();
      const voidData = {
        ...parseToken(legitToken),
        address: maliciousSigner.address,
      };
      const voidToken = Buffer.from(
        JSON.stringify({
          address: voidData.address,
          deadline: voidData.deadline,
          signature: voidData.signature,
        }),
        "utf-8"
      ).toString("base64");
      expect(() => tryGetAuthenticated(voidToken)).to.be.throw(
        "Authentication failed"
      );
    });
  });
});
