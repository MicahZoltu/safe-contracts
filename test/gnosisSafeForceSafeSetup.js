const utils = require('./utils/general')

const GnosisSafe = artifacts.require("./GnosisSafe.sol")

contract('GnosisSafe setup', function(accounts) {

    let gnosisSafe
    let executor = accounts[8]

    const CALL = 0

    it('should not be able to call execTransaction before setup', async () => {

        // Create lightwallet
        gnosisSafe = await utils.deployContract("deploying Gnosis Safe", GnosisSafe)

        // Fund Safe
        await web3.eth.sendTransaction({from: accounts[0], to: gnosisSafe.address, value: web3.toWei(1, 'ether')})
        assert.equal(await web3.eth.getBalance(gnosisSafe.address).toNumber(), web3.toWei(1, 'ether'))

        let sigs = "0x000000000000000000000000" + executor.replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01"

        await utils.assertRejects(
            gnosisSafe.execTransaction(
                accounts[0], web3.toWei(1, 'ether'), "0x", CALL, 0, 0, 0, 0, 0, sigs, {from: executor}
            ),
            "Should not be able to execute transaction before setup"
        )

        assert.equal(await web3.eth.getBalance(gnosisSafe.address).toNumber(), web3.toWei(1, 'ether'))

        let setup = await gnosisSafe.setup([executor], 1, 0, "0x", 0, 0, 0, 0)
        utils.logGasUsage("setup", setup)

        assert.equal(await web3.eth.getBalance(gnosisSafe.address).toNumber(), web3.toWei(1, 'ether'))

        let tx = await gnosisSafe.execTransaction(
            executor, web3.toWei(1, 'ether'), "0x", CALL, 0, 0, 0, 0, 0, sigs, {from: executor}
        )
        utils.logGasUsage("execTransaction after setup", tx)

        assert.equal(await web3.eth.getBalance(gnosisSafe.address).toNumber(), web3.toWei(0, 'ether'))

    })
})
