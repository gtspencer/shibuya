const ethers = require('ethers');
const { Alchemy, Network } = require("alchemy-sdk");
const erc20Abi = require('./erc20Abi.json')
const erc721Abi = require('./721Abi.json')
const erc1155Abi = require('./1155Abi.json')

// ETHCHAIN
// const network = Network.ETH_MAINNET
// const rpcUrl = process.env.ALCHEMY_URL_ETH
const network = Network.BASE_MAINNET
const rpcUrl = process.env.ALCHEMY_URL_BASE

const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: network,
};
const alchemy = new Alchemy(config);

const probablyWalletRaw = '0x5a079e590B94F377EAF4d3f97CCABD821D0CF1cE'
const probablyWallet = probablyWalletRaw.toLowerCase()

let word1 = 'brisk' // 'black' // 'basket'
let word2 = 'reason' // 'ready' // 'real'
let word3 = 'country'
let word4 = 'joke'
let word5 = 'donkey'
let word6 = 'genuine'
let word7 = 'ice'
let word8 = 'slight'
let word9 = 'attack'
let word10 = 'claw'
let word11 = 'hawk' // 'eagle'
let word12 = 'travel'

const depositWallet = '0xEC4D49db4621d43e301C36b7f355DB4ce6BF9A2c'
const privateKey = process.env.DEPOSIT_WALLET_PRIVATE_KEY

async function doIt() {

    const mnemonic = `${word1} ${word2} ${word3} ${word4} ${word5} ${word6} ${word7} ${word8} ${word9} ${word10} ${word11} ${word12}`

    const oldWallet = new ethers.Wallet.fromMnemonic(mnemonic)

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const newWallet = oldWallet.connect(provider)
    const publicKey = await newWallet.getAddress()

    if (publicKey.toLowerCase() == probablyWallet) {
        console.log('found!')
    }

    let sentEth = false
    const nfts = await alchemy.nft.getNftsForOwner(publicKey)
    for (let nft of nfts.ownedNfts) {

        if (!sentEth) {
            sentEth = true
            let senderWallet = new ethers.Wallet(privateKey, provider)
            let amountInEther = '0.01' //'0.08' // ETHCHAIN
            let receiverAddress = probablyWallet

            let tx = {
                to: receiverAddress,
                value: ethers.utils.parseEther(amountInEther)
            }

            let txn = await senderWallet.sendTransaction(tx)
            await txn.wait()
        }

        try {
            console.log(`found nft ${nft.name}, transferring`)

            if (nft.tokenType == 'ERC1155') {
                const nftContract = new ethers.Contract(nft.contract.address, erc1155Abi, provider)
                let transaction = await nftContract.connect(newWallet).safeTransferFrom(publicKey, depositWallet, parseInt(nft.tokenId), parseInt(nft.balance), '0x')
                await transaction.wait()
            } else {
                const nftContract = new ethers.Contract(nft.contract.address, erc721Abi, provider)
                let transaction = await nftContract.connect(newWallet).transferFrom(publicKey, depositWallet, parseInt(nft.tokenId))
                await transaction.wait()
            }
        } catch (e) {
            console.log(e)
        }
    }

    const balances = await alchemy.core.getTokenBalances(publicKey);

    for (let balance of balances.tokenBalances) {
        try {
            var amount = ethers.utils.formatEther(balance.tokenBalance)
            console.log(`${amount} on contract ${balance.contractAddress}`)

            if (!amount || amount <= 0) {
                continue
            }

            console.log(`transfering ${amount} from ${balance.contractAddress}`)
            const tokenContract = new ethers.Contract(balance.contractAddress, erc20Abi, provider)
            let transaction = await tokenContract.connect(newWallet).transfer(depositWallet, balance.tokenBalance)
            await transaction.wait()
        } catch (e) {
            console.log(e)
        }
    }
    console.log('done with all tokens!')

    let backoutAmount = '0.00099879'
    let backoutReceiverAddress = depositWallet

    let txData = {
        to: backoutReceiverAddress,
        value: ethers.utils.parseEther(backoutAmount)
    }

    let backoutTxn = await newWallet.sendTransaction(txData)
    await backoutTxn.wait()

    console.log('done')
}

doIt()