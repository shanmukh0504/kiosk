# Coinbase Wallet Mini App Integration

This document outlines the changes made to integrate Garden Kiosk with Coinbase Wallet Mini App.

## Overview

The application has been updated to support Coinbase Wallet Mini App environment with the following key features:

- **Mini App Environment Detection**: Automatically detects when running in Coinbase Wallet Mini App
- **Optimized Wallet Connection**: Streamlined wallet connection experience for Mini App users
- **Mini App Specific UI**: Specialized components and styling for Mini App environment
- **Navigation Support**: Mini App specific navigation utilities
- **Responsive Design**: Optimized for mobile webview experience

## Changes Made

### 1. Dependencies Added

- `@coinbase/wallet-sdk`: Official Coinbase Wallet SDK for Mini App support

### 2. New Files Created

#### `src/utils/miniAppDetection.ts`

- Environment detection utilities
- React hooks for Mini App state management
- Functions to check Mini App compatibility

#### `src/layout/MiniAppContextProvider.tsx`

- React context provider for Mini App state
- Provides Mini App environment information throughout the app
- Handles environment changes and updates

#### `src/components/navbar/connectWallet/MiniAppWalletConnect.tsx`

- Specialized wallet connection component for Mini App
- Optimized UI for Coinbase Wallet users
- Simplified connection flow

#### `src/utils/miniAppNavigation.ts`

- Mini App specific navigation utilities
- Functions for sharing data with parent app
- Mini App close functionality

#### `src/styles/miniApp.css`

- Mini App specific CSS styles
- Optimized for mobile webview
- Touch-friendly interactions

### 3. Modified Files

#### `package.json`

- Added `@coinbase/wallet-sdk` dependency

#### `src/layout/wagmi/config.ts`

- Added Coinbase Wallet connector to Wagmi configuration
- Configured with app name and logo

#### `src/components/navbar/connectWallet/getSupportedWallets.ts`

- Updated wallet sorting to prioritize Coinbase Wallet in Mini App
- Added Mini App environment detection

#### `src/components/navbar/connectWallet/ConnectWallet.tsx`

- Integrated Mini App context
- Added conditional rendering for Mini App environment
- Default ecosystem selection for Mini App

#### `src/layout/Layout.tsx`

- Wrapped app with MiniAppProvider
- Added Mini App specific CSS classes
- Conditional styling based on environment

#### `src/index.css`

- Imported Mini App specific styles

## Features

### Mini App Environment Detection

The app automatically detects when running in Coinbase Wallet Mini App using:

- User agent detection
- Ethereum provider checks
- Coinbase Wallet specific indicators

### Optimized Wallet Connection

- In Mini App environment, shows simplified Coinbase Wallet connection
- Prioritizes Coinbase Wallet in wallet selection
- Streamlined connection flow

### Responsive Design

- Touch-optimized interactions
- Mobile-friendly UI components
- Proper viewport handling

### Navigation Support

- Mini App specific navigation utilities
- Data sharing with parent app
- Mini App close functionality

## Testing

### Local Development

1. Run the development server:

   ```bash
   yarn dev
   ```

2. Test Mini App detection by simulating the environment:
   - Open browser developer tools
   - Set user agent to include "CoinbaseWallet" or "MiniApp"
   - Check if Mini App specific UI appears

### Mini App Environment Testing

1. **Coinbase Wallet App**: Test in actual Coinbase Wallet app
2. **WebView Testing**: Test in mobile webview environment
3. **Wallet Connection**: Verify Coinbase Wallet connection works
4. **Navigation**: Test Mini App navigation features

### Environment Detection Testing

```javascript
// In browser console
import { detectMiniAppEnvironment } from "./src/utils/miniAppDetection";
console.log(detectMiniAppEnvironment());
```

## Configuration

### Mini App Settings

The Mini App is configured with:

- **App Name**: "Garden Kiosk"
- **App Logo**: Ethereum logo URL
- **Supported Networks**: All EVM-compatible chains

### Wallet Configuration

- Coinbase Wallet connector is automatically prioritized in Mini App
- Fallback to other wallets in non-Mini App environments
- Seamless switching between environments

## Best Practices

### Mini App Development

1. **Avoid Popups**: Use in-app modals instead of browser popups
2. **Touch Optimization**: Ensure all interactive elements are touch-friendly
3. **Performance**: Optimize for mobile webview performance
4. **Navigation**: Use Mini App specific navigation when available

### Testing Checklist

- [ ] Mini App environment detection works
- [ ] Coinbase Wallet connection functions properly
- [ ] UI is responsive and touch-friendly
- [ ] Navigation works in Mini App environment
- [ ] Fallback behavior works in non-Mini App environments

## Troubleshooting

### Common Issues

1. **Wallet Not Detected**: Ensure Coinbase Wallet app is installed and updated
2. **Connection Fails**: Check network connectivity and wallet permissions
3. **UI Issues**: Verify Mini App CSS is loaded properly
4. **Navigation Problems**: Check if Mini App navigation is available

### Debug Information

Enable debug logging by checking the browser console for:

- Mini App environment detection results
- Wallet connection status
- Navigation attempts and results

## Future Enhancements

### Planned Features

- Enhanced Mini App analytics
- Advanced navigation patterns
- Improved error handling
- Additional Mini App specific features

### Integration Opportunities

- Deep linking support
- Push notifications
- Advanced sharing features
- Custom Mini App themes

## Support

For issues related to Mini App integration:

1. Check the troubleshooting section
2. Review browser console for errors
3. Test in different environments
4. Contact the development team

## Compliance

This integration follows Coinbase Wallet Mini App guidelines:

- ✅ No deprecated detection methods used
- ✅ Proper environment detection
- ✅ Optimized for Mini App experience
- ✅ Fallback support for non-Mini App environments
