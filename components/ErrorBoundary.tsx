import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-gray-100">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-8">
                            We apologize for the inconvenience. The application encountered an unexpected error.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Reload Application</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
