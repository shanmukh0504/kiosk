# Changelog

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
- Fixed Network Fee for Bitcoin.
- Fixed Total cost in Fee tooltip.
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
