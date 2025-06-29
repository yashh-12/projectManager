import React from 'react'
import useStream from '../provider/StreamProvide'

function VideoCall() {

  const {stream ,setStream} = useStream();
  console.log("stream ",stream);
  
  return (
    <div>VideoCall</div>
  )
}

export default VideoCall