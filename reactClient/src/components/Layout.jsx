import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigation , useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import Loader from '../pages/Loader';
import Header from './Header';
import { getUserDetails } from '../services/authService';
import { dispatchLogin } from '../store/authSlice';
import { setLoaderTrue , setLoaderFalse } from '../store/uiSlice';

function Layout() {
  const navigate = useNavigate();
  const navigation = useNavigation()
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userState);
  const loader = useSelector((state) => state.ui.loader);
  const [authLoader, setAuthLoader] = useState(true);
  const navigating = navigation.state == "loading"

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserDetails();
        if (res?.success) {
          dispatch(dispatchLogin(res.data));
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setAuthLoader(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  
  
  if (authLoader || loader || navigating) {
    return <Loader />;
  }
  
  const isAuthPage = [
    '/login',
    '/Login',
    '/signup',
    '/verify',
    '/verify-email',
    '/',
    '/about',
    '/contact',
  ].includes(location.pathname);

  if (!user &&!isAuthPage) {
    dispatch(setLoaderTrue())
      navigate('/')
      dispatch(setLoaderFalse())
  }
  else if (user && isAuthPage) {
    dispatch(setLoaderTrue())
    navigate('/projects')
    dispatch(setLoaderFalse())
  }
  
  
  
  return (
    <>
      {user && !isAuthPage ? <Header /> : <></>}
      <Outlet />
    </>
  );
}

export default Layout;
