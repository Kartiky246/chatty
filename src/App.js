import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import './App.css';
import {AuthContext} from './context/Auth'
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';






function App() {
  const {online} = useContext(AuthContext);
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>

        <Route exact path='/' element={online ? <Home /> : <Navigate replace to={'/login'} />}/>
        {/* <Route exact path = '/' element={<Home/>}/> */}
        <Route exact path ='/register' element={<Register/>}/>
        <Route exact path ='/login' element={<Login/>}/>
        <Route exact path = '/profile' element={ online ? <Profile/> : <Navigate replace to={'/login'}/>}/>

        </Routes>
        

        
     
    
   
    </BrowserRouter>
  );
}

export default App;
