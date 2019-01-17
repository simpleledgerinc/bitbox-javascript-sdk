/*
  Integration tests for the BITBOX. Only covers calls made to
  rest.bitcoin.com.

  TODO
  - getMempoolEntry() only works on TXs in the mempool, so it needs to be part
  of an e2e test to be properly tested.
*/

const chai = require("chai")
const assert = chai.assert
const BITBOXSDK = require("../../src/bitbox-sdk").default
const BITBOX = new BITBOXSDK()
const axios = require("axios")

// Inspect utility used for debugging.
const util = require("util")
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
  depth: 3
}

describe(`#blockchain`, () => {
  describe(`#getBestBlockHash`, () => {
    it(`should GET best block hash`, async () => {
      const result = await BITBOX.Blockchain.getBestBlockHash()
      //console.log(`result: ${util.inspect(result)}`)

      assert.isString(result)
      assert.equal(result.length, 64, "Specific hash length")
    })
  })

  describe("#getMempoolEntry", () => {
    /*
    // To run this test, the txid must be unconfirmed.
    const txid =
      "8be69f3ba6bde8152ae11789aa4ba292a4d2cea40bef3d7cb9f69adde150b9fd"

    it(`should GET single mempool entry`, async () => {
      const result = await BITBOX.Blockchain.getMempoolEntry(txid)

      assert.hasAnyKeys(result, [
        "size",
        "fee",
        "modifiedfee",
        "time",
        "height",
        "startingpriority",
        "currentpriority",
        "descendantcount",
        "descendantsize",
        "descendantfees",
        "ancestorcount",
        "ancestorsize",
        "ancestorfees",
        "depends"
      ])
    })

    it(`should get an array of mempool entries`, async () => {
      const result = await BITBOX.Blockchain.getMempoolEntry([txid, txid])

      assert.isArray(result)
      assert.hasAnyKeys(result[0], [
        "size",
        "fee",
        "modifiedfee",
        "time",
        "height",
        "startingpriority",
        "currentpriority",
        "descendantcount",
        "descendantsize",
        "descendantfees",
        "ancestorcount",
        "ancestorsize",
        "ancestorfees",
        "depends"
      ])
    })
    */

    it(`should throw an error if txid is not in mempool`, async () => {
      try {
        const txid =
          "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7"

        await BITBOX.Blockchain.getMempoolEntry(txid)

        assert.equal(true, false, "Unexpected result!")
      } catch (err) {
        //console.log(`err: ${util.inspect(err)}`)
        assert.hasAnyKeys(err, ["error"])
        assert.include(err.error, `Transaction not in mempool`)
      }
    })

    it(`should throw an error for improper single input`, async () => {
      try {
        const txid = 12345

        await BITBOX.Blockchain.getMempoolEntry(txid)
        assert.equal(true, false, "Unexpected result!")
      } catch (err) {
        assert.include(
          err.message,
          `Input must be a string or array of strings`
        )
      }
    })
  })

  describe(`#getTxOutProof`, () => {
    it(`should get single tx out proof`, async () => {
      const txid =
        "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7"

      const result = await BITBOX.Blockchain.getTxOutProof(txid)
      //console.log(`result: ${util.inspect(result)}`)

      assert.isString(result)
    })

    it(`should get an array of tx out proofs`, async () => {
      const txid = [
        "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7",
        "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7"
      ]

      const result = await BITBOX.Blockchain.getTxOutProof(txid)
      //console.log(`result: ${util.inspect(result)}`)

      assert.isArray(result)
      assert.isString(result[0])
    })

    it(`should throw an error for improper single input`, async () => {
      try {
        const txid = 12345

        await BITBOX.Blockchain.getTxOutProof(txid)
        assert.equal(true, false, "Unexpected result!")
      } catch (err) {
        assert.include(
          err.message,
          `Input must be a string or array of strings`
        )
      }
    })
  })

  describe(`#verifyTxOutProof`, () => {
    const mockTxOutProof =
      "0000002086a4a3161f9ba2174883ec0b93acceac3b2f37b36ed1f90000000000000000009cb02406d1094ecf3e0b4c0ca7c585125e721147c39daf6b48c90b512741e13a12333e5cb38705180f441d8c7100000008fee9b60f1edb57e5712839186277ed39e0a004a32be9096ee47472efde8eae62f789f9d7a9f59d0ea7093dea1e0c65ff0b953f1d8cf3d47f92e732ca0295f603c272d5f4a63509f7a887f2549d78af7444aa0ecbb4f66d9cbe13bc6a89f59e05a199df8325d490818ffefe6b6321d32d7496a68580459836c0183f89082fc1b491cc91b23ecdcaa4c347bf599a62904d61f1c15b400ebbd5c90149010c139d9c1e31b774b796977393a238080ab477e1d240d0c4f155d36f519668f49bae6bd8cd5b8e40522edf76faa09cca6188d83ff13af6967cc6a569d1a5e9aeb1fdb7f531ddd2d0cbb81879741d5f38166ac1932136264366a4065cc96a42e41f96294f02df01"

    it(`should verify a single proof`, async () => {
      const result = await BITBOX.Blockchain.verifyTxOutProof(mockTxOutProof)
      //console.log(`result: ${util.inspect(result)}`)

      assert.isArray(result)
      assert.isString(result[0])
      assert.equal(
        result[0],
        "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7"
      )
    })

    it(`should verify an array of proofs`, async () => {
      const proofs = [mockTxOutProof, mockTxOutProof]
      const result = await BITBOX.Blockchain.verifyTxOutProof(proofs)
      //console.log(`result: ${util.inspect(result)}`)

      assert.isArray(result)
      assert.isString(result[0])
      assert.equal(
        result[0],
        "03f69502ca32e7927fd4f38c1d3f950bff650c1eea3d09a70e9df5a9d7f989f7"
      )
    })

    it(`should throw an error for improper single input`, async () => {
      try {
        const txid = 12345

        await BITBOX.Blockchain.verifyTxOutProof(txid)
        assert.equal(true, false, "Unexpected result!")
      } catch (err) {
        assert.include(
          err.message,
          `Input must be a string or array of strings`
        )
      }
    })
  })
})