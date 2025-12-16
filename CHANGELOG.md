# Changelog

## [2.0.3]

### Added

- Added Starknet and Solana support to OKX, and added Solana support to MetaMask.

### Fixed

- enable starknet for wallet connection.
- Update Packages to support BNB, Botanix to Starknet routes.
- Balance display logic in AssetSelector and fix formatBigNumber function for precision.
- Fix Alpen Signet Bitcoin Address show.
- Update Alpen testnet multicall address
- Update max spendable sbtc in alpen testnet
- Update okx wallet connector from injected connector to legacyInjected in starknet config.
- Update starknet config
- Update Starknet balance fetching with multiple rpc nodes

## [2.0.2]

### Added

- Warning message in console.
- Added Monad Mainnet Support.

### Fixed

- Updated output error handling and fixed balance formatting.
- Reduced unnecessary GET requests triggered by reactive useEffect dependencies in useOrderStatus hook.

## [2.0.1]

### Added

- Added API key requirement for quote fetching.

### Fixed

- Updated coinbase wallet connection logic and hid unsupported ecosystems in connect wallet modal.

## [2.0.0]

### Fixed

- Migrated to v2 routes.
- Fixed chain and wallet logos.
- Fixed Icon rounded issue in assets and chain, added new footer.
- Fixed Native assets balances fetching.
- Fixed X Link URL
- Add dry run to all staking and distributor contract calls

## [1.1.8]

### Added

- Added starknet support for Xverse wallet.
- Redirect link to mempool transaction hash when deposit is not confirmed.
- Added starknet support for Xverse wallet.
- Implemented Swap bridge functionality.
- New Stake page with GardenPass and refreshed UI.
- Added Alpen Testnet support.
- Add solver_id in Create Order Request.

### Fixed

- Update toast for successful swap and add abort controller to fetch assets function.
- Update the coinbase wallet id.
- Fixed the link redirecting to staking docs.
- Disable Core chain in output-asset on Phantom, Keplr and Leap wallet.
- Update title to "Swap completed" from "Swap in progress" when swap is completed.
- Ensure chainRpcs defaults to an empty array if undefined.
- Display mempool redirect on deposit detected only on initiate tx hash.

## [1.1.7]

- Fixed USD value formatting and rate display.
- Added Evm and Sui support for Backpack wallet.
- Fixed broken base chain logo in staking constants.
- Added Husky pre-commit hook to run ESLint with --fix, restage updated files, and block empty commits.

## [1.1.6]

### Fixed

- Fixed missing Bitcoin chain in Phantom wallet's multi-chain connection modal.
- Updated description in farcaster config.

## [1.1.5]

### Fixed

- Updated balance retrieval function to use fallback RPC clients as default instead of default wallet RPCs.
- Rate conversion and display estimated token price for inputAsset.
- Fixed fiat token prices.
- Add Tokeo wallet support for SUI Mainnet

## [1.1.4]

### Fixed

- Fixed fallback network fees handling.
- Progress steps for refunded orders.
- Reduced fallback rpc calls for balance fetching.
- Fixed favicon in safari browser by updating the format to .png.

## [1.1.3]

### Added

- Made required changes to support our kiosk app to support coinbase mini app
- Added support for core chain.

### Fixed

- Fixed from bitcoin orders fetch issue
- Changed and improved the connect, available wallets handling.

## [1.1.2]

### Fixed

- Updated @gardenfi version to latest version.
- Remove unused Code.
- Change XIcon from solid to outline.

## [1.1.1]

### Added

- Added support for sui chain in garden.

### Fixed

- Updated the asset routes in competitor savings constant.
- Search functionality in AssetSelector component.
- Updated network fees logic for Sui chain.
- Updated GradientScroll height for UX.
- Updated the script url

## [1.1.0]

### Added

- Brand refresh

### Fixed

- updated open-graph image in metadata
- Fixed competitor comparisons screen
- Fixed redirect url for explorer
- Fixed status label for awaiting deposit
- Fixed Swap button's bg color on quote refreshes

## [1.0.14]

### Fixed

- Fixed formatAmount utility for larger values.

## [1.0.13]

### Added

- Added Sentry for error tracking.

### Fixed

- Fixed sidebar menu and notification in mobile view.
- Asset chain logos display for evm native tokens.

## [1.0.13]

### Added

- Added support for solana spl tokens.

### Fixed

- Fetch balance on mount.
- Max spendable balance for Evm chains.

## [1.0.12]

- Update starknet packages to latest versions.
- Fix add network to wallet in rabby wallet.

## [1.0.11]

### Added

- Added BNB Smart Chain support.
- Enabled pre-image management to be handled at server level.

### Fixed

- Optimize Dockerfile for better caching
- Checks for Coinbase wallet based on the updated window object.
- Use vite modes for dev and build commands.
- Added rel attribute to external links in navbar.
- Tweak animation for fee details dropdown in swap component.
- Made network fee value to 0.49$ when fee is not loaded.

## [1.0.10]

### Added

- Added EVM wallet support for leap and keplr.

### Fixed

- Bitcoin redeems

## [1.0.9]

### Fixed

- Fetch and set max spendable balance for Bitcoin and Solana at the time of fetching balances.

## [1.0.8]

### Added

- Added new fee structure UI

### Fixed

- Fixed posting refundSacp for an order regardless any state.
- Fixed rate display heading when dropdown is collapsed and removed price impact calculation

## [1.0.7]

### Added

- Added faucet link that redirects to testnet BTC faucet and Testnet badge in testnet environment.

### Fixed

- Transaction broadcast issue for Bitcoin through phantom wallet.
- Use only confirmed balance for Bitcoin instead of total balance.
- Status label in swap in progress component for bitcoin non-initiated transactions.
- Fixed asset sorting to handle undefined balance cases properly.

## [1.0.6]

### Fixed

- Disable swap button and update its label when phantom wallet doesn't support the chain
- Fixed Price impact sign based on it's values.
- Remove catalogfi package dependencies.

## [1.0.5]

### Fixed

- Fixed the max spendable balance for Bitcoin and Solana.
- update Argent wallets's name to Ready wallet.

## [1.0.4]

### Added

- Added dynamic price impact in the fee tooltip.
- Added inputAmount in the url to preload a pair of assets and rate.

### Fixed

- Fixed Network Fee for Bitcoin.
- Fixed Total cost in Fee tooltip.
- Fixed the Price impact logic in fee tooltip.
- Added Faucet external link footer
- Optimized transaction loading to display new results without full rerender, and improved swap progress UI for refunded transactions.
- updated the fee breakdown UI

## [1.0.3]

### Added

- Added support for Solana.
- Added new loading animation for pending orders in navbar capsule

### Fixed

- Display up to 8 decimal places for balance and input amount values.
- Token balances are now displayed in the asset selector modal, arranged in decreasing order of their USD value.
- Added sidebar and bottom sheet animations for chain filtering.
- Added check for CHANGELOG updates in github actions
- Fixed BTC wallet connections in phantom, added disable assets for unsupported chains by phantom in mainnet.
- Fixed Awaiting Deposit Transaction
- Fixed phantom Logo
- Fixed asset chain logo order in asset selector and availableChainSidebars
- Fixed solana initiate when clicked pending orders
- Fixed show network logo for asset selector
- Fixed Notification bubble Wrap
- Fixed Modal dropdown overflow for stake duration.

## [1.0.2]

### Added

- Integrated support for dynamically fetching the latest announcement notifications from the info-server without requiring a code update.

## [1.0.1]

### Added

- Added a new feature to delete orders from the pending orders list.

### Fixed

- Connect button label when wallets are not connected.

## [1.0.0]

### Added

- Smooth animations for swap component transitions.
- Rolling number animations for input and output amounts using NumberFlow.
- Competitor fee and time comparison features.
- Network fee calculation for Bitcoin output transactions.
- Fee breakdown display showing both protocol and network fees.
