# Decentral

Project Demo: https://web-logistics.github.io/decentral/

Decentral is a dapp that lets users create their own posts, talking or giving their own opinion about any topic, to see the posts of a user anyone can subscribe to them, paying a price established by the creator of the post, with this subscription, the user can see all the posts that the same user made. With each post the subscription price can be changed, but isn't a must.

## Contract Methods

The contract has 6 methods; getNumberOfPosts, getPost, getPrice, getSubscriptions, postPost and subscribe.

### getNumberOfPosts

Returns the number of published posts.

### getPost

Returns all the information relatedthe one post by indication the index of the post.

### getPrice

Returns the price of subcription that the creator establishes.

### getSubscriptions

Returns all the addresses that one user, referenced by his address, is subscribed to.

### postPost

Adds a post o the system by introducing the title and the content of the post, and changing the price if needed.

### subscribe

Pays to the owner of the post the specified price for a subscription, and then, unlocks all the posts created by the same user to the user that paid.

# Install

```

npm install

```

or

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```

# Usage

1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
