import React, { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<Props, State> {
    public state, error){
        return { hasError: true, error };
    }

    public componentDidCatch(error, errorInfo) {
        console.error("Uncaught error, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">The application encountered an unexpected error.</p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-6 max-h-48">
                            <code className="text-sm text-red-800">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
