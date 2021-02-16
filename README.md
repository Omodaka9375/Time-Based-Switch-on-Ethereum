# Time-Based Switch on Ethereum Blockchain

This is a simple demo implementing Time-Based Switch on Ethereum Blockchain.
```TimeBasedSwitch.sol``` smart contract provides standard methods and processes for safe transactions based on `block.timestamp`. This enables users to secure their accounts from lockout by predefining fallback addresses to transfer the funds after the predefined time.

It includes a minimalistic front-end built using Truffle.

Inspiration:
*Google's Inactive Account Manager allows the account holder to nominate someone else to access their services if not used for an extended period.*

Source: https://en.wikipedia.org/wiki/Dead_man%27s_switch
## Team
[Branislav Đalić](https://github.com/Omodaka9375) \
[Mališa Pušonja](https://github.com/horohronos) \
[Ivor Jugo](https://github.com/ivorrr) \
[Marko Kolašinac](https://github.com/SefSmrka) \
[Andrej Rakić](https://github.com/andrejrakic)

## How will it work here?

### Flowchart

![Dead Account Switch Flowchart](flowchart.png)

### Entities

![Dead Account Switch Entities](das.png)
## Requirements

Node.js version +5
Truffle v12 

## Installation

Install ganache and truffle
```
npm install -g truffle
```
## Run it

```
npm run dev
```

## License

This project is licensed under the MIT License

