const ethers = require('ethers');
const bipList = require('./bipWordList.json')
const destAddressRaw = '0x5a079e590B94F377EAF4d3f97CCABD821D0CF1cE'
const destAddress = destAddressRaw.toLowerCase()

let word1 = 'brisk'
let word2 = 'reason'
let word3 = 'country'
let word4 = 'joke'
let word5 = 'donkey'
let word6 = 'genuine'
let word7 = 'ice'
let word8 = 'slight'
let word9 = 'attack'
let word10 = ''
let word11 = 'hawk'
let word12 = 'travel'

// super ugly brute force to try to find the seed phrase for destAddress
async function doIt() {
    for (let testWord1 of bipList) {
        word10 = testWord1

        // uncomment these for more than 1 unknown word
        // for (let testWord2 of bipList) {
        //     word5 = testWord2
        //     for (let testWord3 of bipList) {
        //         word11 = testWord3
        //         for (let testWord4 of bipList) {
        //             word12 = testWord4
        //             testWords()
        //         }
        //     }
        // }

        testWords()
    }

    console.log('done')
}

async function testWords() {
    try {
        let phrase = `${word1} ${word2} ${word3} ${word4} ${word5} ${word6} ${word7} ${word8} ${word9} ${word10} ${word11} ${word12}`
        const testWallet = new ethers.Wallet.fromMnemonic(phrase)
        const publicKey = await testWallet.getAddress()
        if (publicKey.toLowerCase() == destAddress) {
            console.log('FOUND!!!')
            console.log(phrase)
            return
        }
    } catch {
        // words create an invalid wallet
    }
}

doIt()