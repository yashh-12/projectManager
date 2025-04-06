import React from 'react'

function Error(error) {
    return (

        <div className="absolute top-[-60px] left-0 right-0 flex items-center gap-2 p-3 bg-red-500 border border-red-700 rounded-md">
            <p className="text-white font-medium flex-1">{error}</p>
            <button
                type="button"
                onClick={() => setError('')}
                className="text-white hover:text-gray-300"
            >
                ✕
            </button>
        </div>

    )
}

export default Error