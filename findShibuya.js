const ethers = require('ethers');
const { Alchemy, Network } = require("alchemy-sdk");

const gaias = '0xa449b4f43d9a33fcdcf397b9cc7aa909012709fd'
const degen = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed'

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

// used to find all holders of gaias, and check their degen balance.  those with ~100k degen are likely the shibuya wallet
async function doIt() {
    const owners = await alchemy.nft.getOwnersForContract(gaias);

    for (let owner of owners.owners) {
        const degenBalance = await alchemy.core.getTokenBalances(owner, [degen])
        var amountStr = ethers.utils.formatEther(degenBalance.tokenBalances[0].tokenBalance)
        var amount = parseFloat(amountStr)
        if (amount >= 99000 && amount <= 110000) {
            console.log(`${owner} has ${amount}`)
        }
        // don't get timed out
        await delay(500)
    }
}


doIt()