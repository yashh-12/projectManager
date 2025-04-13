import React from 'react';
import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';

function Overview() {
    const data = useLoaderData();
    // const message = useSelector(state => state.ui.message)
    console.log("data  d ",data);
    
  return <h1>Welcome to Project Overview</h1>;
}

export default Overview;
