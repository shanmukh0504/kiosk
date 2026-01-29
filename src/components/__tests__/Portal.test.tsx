import { render } from "../../__tests__/test-utils";
import { Portal } from "../Portal";

describe("Portal", () => {
  beforeEach(() => {
    // Clear any existing portal root
    if (typeof document !== "undefined") {
      const existingPortal = document.getElementById("portal-root");
      if (existingPortal) {
        existingPortal.remove();
      }
    }
  });

  afterEach(() => {
    // Clean up portal root after each test
    if (typeof document !== "undefined") {
      const portalRoot = document.getElementById("portal-root");
      if (portalRoot) {
        portalRoot.remove();
      }
    }
  });

  it("creates portal root if it does not exist", () => {
    render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );

    const portalRoot = document.getElementById("portal-root");
    expect(portalRoot).toBeInTheDocument();
  });

  it("renders children in portal root", () => {
    render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );

    const portalRoot = document.getElementById("portal-root");
    expect(portalRoot).toContainHTML(
      '<div data-testid="portal-content">Portal Content</div>'
    );
  });

  it("uses existing portal root if it exists", () => {
    // Create portal root manually
    const existingRoot = document.createElement("div");
    existingRoot.id = "portal-root";
    document.body.appendChild(existingRoot);

    render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );

    const portalRoot = document.getElementById("portal-root");
    expect(portalRoot).toBe(existingRoot);
    expect(portalRoot).toContainHTML(
      '<div data-testid="portal-content">Portal Content</div>'
    );
  });

  it("renders multiple children in portal", () => {
    render(
      <Portal>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Portal>
    );

    const portalRoot = document.getElementById("portal-root");
    expect(
      portalRoot?.querySelector('[data-testid="child-1"]')
    ).toBeInTheDocument();
    expect(
      portalRoot?.querySelector('[data-testid="child-2"]')
    ).toBeInTheDocument();
  });
});
