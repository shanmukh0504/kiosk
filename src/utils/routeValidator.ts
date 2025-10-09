import { ChainAsset } from "@gardenfi/orderbook";

// Types for the policy configuration
interface RoutePolicy {
  default: "open" | "closed";
  isolation_groups: string[];
  blacklist_pairs: string[];
  whitelist_overrides: string[];
}

interface PolicyResponse {
  status: "Ok" | "Error";
  result: RoutePolicy;
  error?: string;
}

class RouteValidator {
  private policy: RoutePolicy | null = null;

  constructor(
    private apiBaseUrl: string,
    private apiKey: string
  ) {}

  // Fetch policy from the API
  async loadPolicy(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/v2/policy`, {
        headers: {
          "garden-app-id": this.apiKey,
          accept: "application/json",
        },
      });

      const data: PolicyResponse = await response.json();

      if (data.status === "Ok") {
        this.policy = data.result;
      } else {
        throw new Error(`API Error: ${data.error}`);
      }
    } catch (error) {
      throw new Error(`Failed to load policy: ${error}`);
    }
  }

  // Check if a route is valid based on the policy
  isValidRoute(fromAsset: ChainAsset, toAsset: ChainAsset): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    // Can't swap to the same asset
    if (fromAsset === toAsset) {
      return false;
    }

    // If both assets are in the same isolation group, allow the route
    if (this.isValidIsolationGroup(fromAsset, toAsset)) {
      return true;
    }

    // If either asset is in an isolation group but they're not in the same group, block it
    if (this.isInIsolationGroup(fromAsset, toAsset)) {
      return false;
    }

    // Check whitelist overrides (bypass other restrictions)
    if (this.isWhitelistOverride(fromAsset, toAsset)) {
      return true;
    }

    // Check blacklist pairs
    if (this.isBlacklisted(fromAsset, toAsset)) {
      return false;
    }

    // Apply default policy
    return this.policy.default === "open";
  }

  // Check if an asset is in any isolation group
  isAssetInIsolationGroup(asset: ChainAsset): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    return this.policy.isolation_groups.some((group) =>
      this.matchesIsolationGroupPattern(asset, group)
    );
  }

  // Get all assets that are in the same isolation group as the given asset
  getIsolationGroupAssets(
    asset: ChainAsset,
    allAssets: ChainAsset[]
  ): ChainAsset[] {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    // If the asset is not in any isolation group, return empty array
    if (!this.isAssetInIsolationGroup(asset)) {
      return [];
    }

    // Find all assets that are in the same isolation group
    const isolationGroupAssets: ChainAsset[] = [];

    for (const group of this.policy.isolation_groups) {
      if (this.matchesIsolationGroupPattern(asset, group)) {
        // This asset is in this group, find all other assets in the same group
        for (const otherAsset of allAssets) {
          if (
            otherAsset !== asset &&
            this.matchesIsolationGroupPattern(otherAsset, group)
          ) {
            isolationGroupAssets.push(otherAsset);
          }
        }
      }
    }

    return isolationGroupAssets;
  }

  // Get all valid destination assets for a given source asset
  getValidDestinations(
    fromAsset: ChainAsset,
    allAssets: ChainAsset[]
  ): ChainAsset[] {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    // If the source asset is in an isolation group, only return assets from the same group
    if (this.isAssetInIsolationGroup(fromAsset)) {
      return this.getIsolationGroupAssets(fromAsset, allAssets);
    }

    // For assets not in isolation groups, filter based on normal route validation
    return allAssets.filter((toAsset) => {
      // Skip if it's the same asset
      if (fromAsset === toAsset) return false;

      // If the destination asset is in an isolation group, it's not valid
      // (unless the source is also in the same group, which we already handled above)
      if (this.isAssetInIsolationGroup(toAsset)) return false;

      // Apply normal route validation
      return this.isValidRoute(fromAsset, toAsset);
    });
  }

  // Get all possible routes from a list of assets
  getAllValidRoutes(
    assets: ChainAsset[]
  ): Array<{ from: ChainAsset; to: ChainAsset }> {
    const routes: Array<{ from: ChainAsset; to: ChainAsset }> = [];

    for (const fromAsset of assets) {
      for (const toAsset of assets) {
        if (this.isValidRoute(fromAsset, toAsset)) {
          routes.push({ from: fromAsset, to: toAsset });
        }
      }
    }

    return routes;
  }

  // Private helper methods
  private isInIsolationGroup(
    fromAsset: ChainAsset,
    toAsset: ChainAsset
  ): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    return this.policy.isolation_groups.some((group) => {
      // For isolation groups, we check if either asset matches the pattern
      // This allows us to detect if we're dealing with an isolation group
      return (
        this.matchesIsolationGroupPattern(fromAsset, group) ||
        this.matchesIsolationGroupPattern(toAsset, group)
      );
    });
  }

  private isValidIsolationGroup(
    fromAsset: ChainAsset,
    toAsset: ChainAsset
  ): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    return this.policy.isolation_groups.some((group) => {
      // For isolation groups, both assets must be in the same group
      // This handles both -> and <-> patterns properly
      return (
        this.matchesIsolationGroupPattern(fromAsset, group) &&
        this.matchesIsolationGroupPattern(toAsset, group)
      );
    });
  }

  private isWhitelistOverride(
    fromAsset: ChainAsset,
    toAsset: ChainAsset
  ): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    return this.policy.whitelist_overrides.some((override) =>
      this.matchesPattern(fromAsset, toAsset, override)
    );
  }

  private isBlacklisted(fromAsset: ChainAsset, toAsset: ChainAsset): boolean {
    if (!this.policy) {
      throw new Error("Policy not loaded. Call loadPolicy() first.");
    }

    return this.policy.blacklist_pairs.some((blacklist) =>
      this.matchesPattern(fromAsset, toAsset, blacklist)
    );
  }

  private matchesIsolationGroupPattern(
    asset: ChainAsset,
    group: string
  ): boolean {
    // For isolation groups, we need to check if the asset matches any part of the group
    // Handle both "->" and "<->" patterns
    const separator = group.includes("<->") ? "<->" : "->";
    const patterns = group.split(separator).map((p) => p.trim());

    return patterns.some((pattern) => this.matchesAssetPattern(asset, pattern));
  }

  private matchesPattern(
    fromAsset: ChainAsset,
    toAsset: ChainAsset,
    pattern: string
  ): boolean {
    // Handle both "->" and "<->" patterns
    const separator = pattern.includes("<->") ? "<->" : "->";
    const [fromPattern, toPattern] = pattern
      .split(separator)
      .map((p) => p.trim());

    if (separator === "<->") {
      // For bidirectional patterns, check both directions
      return (
        (this.matchesAssetPattern(fromAsset, fromPattern) &&
          this.matchesAssetPattern(toAsset, toPattern)) ||
        (this.matchesAssetPattern(fromAsset, toPattern) &&
          this.matchesAssetPattern(toAsset, fromPattern))
      );
    } else {
      // For unidirectional patterns, only check the specified direction
      return (
        this.matchesAssetPattern(fromAsset, fromPattern) &&
        this.matchesAssetPattern(toAsset, toPattern)
      );
    }
  }

  private matchesAssetPattern(asset: ChainAsset, pattern: string): boolean {
    const assetStr = asset.toString().toLowerCase();
    const patternLower = pattern.toLowerCase();

    // Handle wildcard patterns
    if (patternLower === "*") return true;

    if (patternLower.includes("*")) {
      // Handle patterns like "unichain:*" or "*:usdc"
      if (patternLower.endsWith(":*")) {
        const chainPattern = patternLower.slice(0, -2);
        return assetStr.startsWith(chainPattern + ":");
      }
      if (patternLower.startsWith("*:")) {
        const symbolPattern = patternLower.slice(2);
        return assetStr.endsWith(":" + symbolPattern);
      }
    }

    // Exact match (case insensitive)
    return assetStr === patternLower;
  }
}

// Helper function to build route matrix for UI
function buildRouteMatrix(
  assets: ChainAsset[],
  validator: RouteValidator
): Record<string, ChainAsset[]> {
  const matrix: Record<string, ChainAsset[]> = {};

  for (const fromAsset of assets) {
    matrix[fromAsset.toString()] = validator.getValidDestinations(
      fromAsset,
      assets
    );
  }

  return matrix;
}

// Export for use in your application
export { RouteValidator, buildRouteMatrix, type RoutePolicy };
