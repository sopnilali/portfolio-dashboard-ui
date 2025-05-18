import React from 'react'

const LoadingSpinner = () => {
    return (
        <div>
            <div className="flex justify-center items-center py-8 max-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-primary-600 border-solid"></div>
            </div>
        </div>
    )
}

export default LoadingSpinner
