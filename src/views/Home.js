import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState, useRef } from 'react';
import useCarsTrack from '../hooks/useCarsTrack';
import { Link } from 'react-router-dom';

function Home() {
  const { active, error } = useWeb3React();
  const carsTrack = useCarsTrack();
  const [tokens, setTokens] = useState([]);
  const dataFetchedRef = useRef(false);


  const requestSim = (tokenId) => {
    return Promise.all([
      carsTrack.methods.cars(tokenId).call(),
      carsTrack.methods.ownerOf(tokenId).call(),
      carsTrack.methods.tokenURI(tokenId).call()
    ]);
  }

  const getTotalTokens = useCallback(async () => {
    if (carsTrack) {
      const total = await carsTrack.methods.totalSupply().call();
      for (let tokenId = 0; tokenId < total; tokenId++) {
        const [cars, ownerOf, tokenUri] = await requestSim(tokenId);
        const uriResult = await fetch(tokenUri);
        const uriData = await uriResult.json();
        const newToken = { ...cars, ownerOf, ...uriData };
        setTokens(oldTokens => [...oldTokens, newToken]);
      }
    }
  }, [carsTrack]);

  useEffect(() => {
    if (active) {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      getTotalTokens();
    }
  }, [getTotalTokens]);

  if (!active && !error) return 'Conecta tu wallet';
  return (
    <>
      {!error &&
        tokens.map(item => {
          return <Link key={item.tokenId} to={`/${item.tokenId}`}>
              <img src={item.image} alt={item.name} width="150" />
              <p>{item.domain}</p>
              <p>{item.brand.company}</p>
              <p>{item.brand.model}</p>
              <p>{item.ownerOf}</p>
              <p>{new Date(item.year * 1000).toLocaleString()}</p>
          </Link>
        })
      }
    </>
  );
}

export default Home;