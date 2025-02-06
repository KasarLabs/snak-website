import { Plugin } from "../src/app/plugins/utils/types"

const vesuPlugin: Plugin = {
	id: '9d3e05ef-c85a-43cc-8e57-486e94fcf40f',
	name: 'Vesu',
	description: 'Deposit and withdraw tokens to earn yield in the Vesu DeFi protocol',
	image: '/logos/vesu.png',

	actions: [
	  {
		name: 'Deposit Earn',
		description: 'Deposit tokens into Vesu protocol to earn yield',
		parameters: [
		  {
			name: 'depositTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to deposit (e.g., ETH, USDC)',
			required: true
		  },
		  {
			name: 'depositAmount',
			type: 'string',
			description: 'Amount of tokens to deposit',
			required: true
		  }
		]
	  },
	  {
		name: 'Withdraw Earn',
		description: 'Withdraw tokens and earned yield from Vesu protocol',
		parameters: [
		  {
			name: 'withdrawTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to withdraw',
			required: true
		  }
		]
	  }
	]
}

const unruggablePlugin: Plugin = {
	id: '8d3e05ef-c85a-43cc-8e57-486e94fcf39e',
	name: 'Unruggable',
	description: 'Create secure, transparent memecoins with built-in protections against common exploits and rug pulls',
	image: '/logos/unruggable.png',

	actions: [
		{
		name: 'Create Memecoin',
		description: 'Deploy a new memecoin contract with built-in security features and customizable parameters',
		parameters: [
			{
			name: 'owner',
			type: 'string',
			description: 'Owner address of the memecoin',
			required: true
			},
			{
			name: 'name',
			type: 'string',
			description: 'Name of the memecoin',
			required: true
			},
			{
			name: 'symbol',
			type: 'string',
			description: 'Symbol of the memecoin',
			required: true
			},
			{
			name: 'initialSupply',
			type: 'string',
			description: 'Initial supply of tokens (will be scaled by 18 decimals)',
			required: true
			}
		]
		},
		{
		name: 'Verify Memecoin',
		description: 'Check if a contract is a legitimate memecoin created by the Unruggable Factory',
		parameters: [
			{
			name: 'contractAddress',
			type: 'string',
			description: 'Address of the contract to verify',
			required: true
			}
		]
		},
		{
		name: 'Launch on Ekubo',
		description: 'Launch memecoin on Ekubo DEX with concentrated liquidity and trading restrictions',
		parameters: [
			{
			name: 'memecoinAddress',
			type: 'string',
			description: 'Address of the memecoin to launch',
			required: true
			},
			{
			name: 'transferRestrictionDelay',
			type: 'number',
			description: 'Delay in seconds before transfers are allowed',
			required: true
			},
			{
			name: 'maxPercentageBuyLaunch',
			type: 'number',
			description: 'Maximum percentage of tokens that can be bought at launch',
			required: true
			},
			{
			name: 'startingPrice',
			type: 'string',
			description: 'Initial trading price of the token',
			required: true
			}
		]
		},
		{
		name: 'Check Locked Liquidity',
		description: 'Verify if a memecoin has locked liquidity and get detailed information about the liquidity lock',
		parameters: [
			{
			name: 'contractAddress',
			type: 'string',
			description: 'Address of the memecoin contract to check',
			required: true
			}
		]
		}
	]
}

const avnuPlugin: Plugin = {
	id: '7d3e05ef-c85a-43cc-8e57-486e94fcf38e',
	name: 'AVNU',
	description: 'Decentralized exchange aggregator for swapping tokens on StarkNet with the best rates',
	image: '/logos/avnu.png',

	actions: [
	  {
		name: 'Swap Tokens',
		description: 'Swap tokens using the best available routes and rates',
		parameters: [
		  {
			name: 'sellTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to sell (e.g., ETH, USDC)',
			required: true
		  },
		  {
			name: 'buyTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to buy (e.g., ETH, USDC)',
			required: true
		  },
		  {
			name: 'sellAmount',
			type: 'string',
			description: 'Amount of tokens to sell',
			required: true
		  }
		]
	  },
	  {
		name: 'Fetch Route',
		description: 'Get the best route and quote for a token swap without executing it',
		parameters: [
		  {
			name: 'sellTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to sell (e.g., ETH, USDC)',
			required: true
		  },
		  {
			name: 'buyTokenSymbol',
			type: 'string',
			description: 'Symbol of the token to buy (e.g., ETH, USDC)',
			required: true
		  },
		  {
			name: 'sellAmount',
			type: 'number',
			description: 'Amount of tokens to sell',
			required: true
		  }
		]
	  }
	]
}

const coingeckoPlugin: Plugin = {
	id: '6d3e05ef-c85a-43cc-8e57-486e94fcf37e',
	name: 'CoinGecko',
	description: 'Get real-time cryptocurrency prices, market data, and trends using CoinGecko API',
	image: '/logos/coingecko.png',

	actions: [
	  {
		name: 'Check Server Status',
		description: 'Check if the CoinGecko API server is operational'
	  },
	  {
		name: 'Check Token Price',
		description: 'Get current price for specified tokens in USD',
		parameters: [
		  {
			name: 'tokenNames',
			type: 'string',
			description: 'Comma-separated list of token names (e.g., "bitcoin,ethereum")',
			required: true
		  }
		]
	  },
	  {
		name: 'List Supported Tokens',
		description: 'Get a list of all supported tokens/currencies on CoinGecko'
	  },
	  {
		name: 'Trending Search List',
		description: 'Get list of trending cryptocurrency searches'
	  }
	]
}

const dexscreenerPlugin : Plugin = {
	id: '5d3e05ef-c85a-43cc-8e57-486e94fcf36e',
	name: 'Dexscreener',
	description: '',
	image: '/logos/dexscreener.png',
	actions: [],
}

const artpeacePlugin : Plugin = {
	id: '4d3e05ef-c85a-43cc-8e57-486e94fcf35e',
	name: 'Artpeace',
	description: '',
	image: '/logos/artpeace.png',
	actions: [],
}

const twitterPlugin : Plugin = {
	id: '3d3e05ef-c85a-43cc-8e57-486e94fcf34e',
	name: 'Twitter',
	description: '',
	image: '/logos/twitter.png',
	actions: [],
}

export const allPlugins: Array<Plugin> = [
	unruggablePlugin,
	vesuPlugin,
	avnuPlugin,
	coingeckoPlugin,
	dexscreenerPlugin,
	artpeacePlugin,
	twitterPlugin,
];

