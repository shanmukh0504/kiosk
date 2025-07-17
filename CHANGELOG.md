# Changelog

## [1.0.7]

### Fixed

- Transaction broadcast issue for Bitcoin through phantom wallet.
- Use only confirmed balance for Bitcoin instead of total balance.
- Status label in swap in progress component for bitcoin non-initiated transactions.

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
