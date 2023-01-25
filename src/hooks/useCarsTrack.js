import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import CarsTracks from '../config/artifacts/CarsTracks';

const { address, abi } = CarsTracks;

const useCarsTrack = () => {
  const { active, library, chainId } = useWeb3React();

  const carsTracks = useMemo(() => {
    if (active) return new library.eth.Contract(abi, address[chainId]);
  }, [active, chainId, library?.eth?.Contract]);

  return carsTracks;
};

export default useCarsTrack;