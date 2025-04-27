// src/provider/SocketProvider.jsx
import React, { createContext, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const socket = io('http://localhost:3000'); 

export const SocketProvider = ({ children }) => {

  socket.on("connect",() => {
    console.log("connected to server");
  })

  return (
    <SocketContext.Provider value={{ client: socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default function useSocket() {
  return useContext(SocketContext);
}
