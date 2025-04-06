import React from 'react'

function FlashMsg(message) {
    return (

        <div className="absolute top-[-60px] left-0 right-0 flex items-center gap-2 p-3 bg-green-500 border border-green-700 rounded-md">
            <p className="text-white font-medium flex-1">{message}</p>
            <button
                type="button"
                onClick={() => setMessage('')}
                className="text-white hover:text-gray-300"
            >
                ✕
            </button>
        </div>

    )
}

export default FlashMsg