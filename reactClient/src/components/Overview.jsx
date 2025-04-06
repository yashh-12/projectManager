import React from 'react';
import { useLoaderData } from 'react-router-dom';

function Overview() {
    const data = useLoaderData();
    console.log("data  d ",data);
    
  return <h1>Welcome to Project Overview</h1>;
}

export default Overview;
