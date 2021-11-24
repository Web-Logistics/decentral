import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import mediaAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import { sleep } from "@celo/base"

const ERC20_DECIMALS = 18
const MPContractAddress = "0xdAF15b16c131Dce50eeF14b69fAD59b3555Fd4C2"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let posts = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(mediaAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _postsLength = await contract.methods.getNumberOfPosts().call()
  const _posts = []
  for (let i = _postsLength - 1; i >= 0; i--) {
    let _post = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getPost(i).call()
      resolve({
        index: i,
        owner: p[0],
        title: p[1],
        content: p[2]
      })
    })
    _posts.push(_post)
  }
  posts = await Promise.all(_posts)
  renderProducts()
  renderProfile()
}

async function renderProducts() {
  document.getElementById("marketplace").innerHTML = ""

  const subs = await contract.methods.getSubscriptions(kit.defaultAccount).call()

  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    if(subs.includes(_post.owner) || _post.owner == kit.defaultAccount){
      newDiv.innerHTML = subPostTemplate(_post)
    }
    else{
      contract.methods.getPrice(_post.owner).call().then(response => {
        newDiv.innerHTML = postTemplate(_post, response)
      })
    }
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

async function renderProfile() {
  const subs = await contract.methods.getSubscriptions(kit.defaultAccount).call()
  document.getElementById("profile").innerHTML = ""
  const newDiv = document.createElement("div")
  newDiv.innerHTML = profileTemplate(kit.defaultAccount, subs)
  document.getElementById("profile").appendChild(newDiv)
}

function postTemplate(_post, _price) {
  return `
    <div class="card" style="width: 100%; border: solid 1px #000; margin-bottom: 20px;">
      <div class="card-body text-left position-relative">
        <div>
        ${identiconTemplate(_post.owner)}
        </div>
        <h2 class="card-title fw-bold mt-2">${_post.title}</h2>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" value="${_post.owner}">
            Subcribe for ${_price / 1000000000000000000} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function subPostTemplate(_post) {
  return `
    <div class="card" style="width: 100%; border: solid 1px #000; margin-bottom: 20px;">
      <div class="card-body text-left position-relative">
        <div>
        ${identiconTemplate(_post.owner)}
        </div>
        <h2 class="card-title fw-bold mt-2">${_post.title}</h2>
        <p class="card-text mb-4">
          ${_post.content}             
        </p>
      </div>
    </div>
  `
}

function profileTemplate(_address, subs){
  return `
    <div class="card" style="width: 12rem; text-align: center; margin: auto;">
      <div style="height: 100px;" class="bg-dark"></div>
      <div class="translate-middle-y">
      ${identiconTemplate(_address)}
        </div>
      <ul style="margin-top: -30px;" class="list-group list-group-flush">
        <li class="list-group-item">
          <span id="myInput">${_address.substring(0, 5)}...${_address.substring(_address.length-3, _address.length)}</span>
          <button class="copy" id="copy-btn" style="border: none;">
            <img class="copy" style="width:10px;" src="https://static.thenounproject.com/png/2179360-200.png">
          </button>
        </li>
        <li class="list-group-item center"><h4>Subscriptions</h4><span>${subs.length}</span></li>
      </ul>
    </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
  sleep(3000).then(()=>{
    document.querySelector(".alert").style.display = "none"
  })
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

const setPrice = async function() {
  const _price = await contract.methods.getPrice(kit.defaultAccount).call()
  document.querySelector("#newPrice").value = _price / 1000000000000000000
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  await setPrice()
  notificationOff()
});

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newPostTitle").value,
      document.getElementById("newPostContent").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .postPost(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error} 1.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.attributes[1].value
    const price = await contract.methods.getPrice(index).call()

    notification("⌛ Waiting for payment approval...")
    try {
      await approve(price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment ...`)
    try {
      const result = await contract.methods
        .subscribe(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You subscribed successfully.`)
      getProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})  

document.querySelector("#profile").addEventListener("click", async (e) => {
  if(e.target.className.includes("copy")){
    navigator.clipboard.writeText(kit.defaultAccount);
    notification("Address copied to clipboard")
  }
})