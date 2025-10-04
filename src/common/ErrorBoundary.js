// src/common/ErrorBoundary.js

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // This lifecycle method is used to render a fallback UI after an error has been thrown.
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  // This lifecycle method is used to log error information.
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service like Sentry, LogRocket, etc.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // A function to reset the error state and try rendering again.
  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI.
      // We pass the error and a reset function as props to a dedicated fallback component.
      return (
        <ErrorFallback
          error={this.state.error}
          onTryAgain={this.handleTryAgain}
        />
      );
    }

    return this.props.children;
  }
}

// A dedicated component for the fallback UI for better organization.
function ErrorFallback({ error, onTryAgain }) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-center p-4 bg-light"
      role="alert"
    >
      <div className="card shadow-sm p-5" style={{ maxWidth: "600px" }}>
        <h2 className="card-title text-danger mb-3">
          😟 Oops! Something Went Wrong.
        </h2>
        <p className="card-text text-muted">
          We're sorry for the inconvenience. Our team has been notified, but you
          can also try to go back or refresh the page.
        </p>
        <pre
          className="alert alert-danger-soft mt-3"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
        >
          {error?.message || "An unknown error occurred."}
        </pre>
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
