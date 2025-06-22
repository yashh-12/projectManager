// src/provider/SocketProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';


const StreamContext = createContext();

export const StreamProvider = ({ children }) => {

    const [stream, setStream] = useState();

    return (
        <StreamContext.Provider value={{ stream, setStream }}>
            {children}
        </StreamContext.Provider>
    );
};

export default function useStream() {
    return useContext(StreamContext);
}
