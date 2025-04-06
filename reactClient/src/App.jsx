
import { useSelector } from 'react-redux';
import './App.css'

function App() {
  const user = useSelector(state => state.auth.userState)
  console.log(user);
  return (
    <>
      <h1>hello</h1>
    </>
  )
}

export default App
