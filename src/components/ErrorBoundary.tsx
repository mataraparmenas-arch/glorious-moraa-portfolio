import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

/** Keeps a failure in the WebGL layer from ever taking the page down. */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D environment unavailable, falling back to 2D.", error, info.componentStack);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
