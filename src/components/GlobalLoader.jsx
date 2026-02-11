import React from 'react';
import { useLoader } from '../context/LoaderContext';
import Loader from './Loader';

const GlobalLoader = () => {
  const { loading, loaderProps } = useLoader();

  if (!loading) return null;

  return <Loader {...loaderProps} />;
};

export default GlobalLoader;