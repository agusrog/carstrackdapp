import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState, useRef } from 'react';
import useCarsTrack from '../hooks/useCarsTrack';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Connect from '../components/Connect';
import LoadingSpinner from '../components/LoadingSpinner';

function MyTokens() {
  const { active, account, error } = useWeb3React();
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

  const getMyTokens = useCallback(async () => {
    if (carsTrack) {
      const totalMyToken = await carsTrack.methods.balanceOf(account).call();
      for (let index = 0; index < totalMyToken; index++) {
        const tokenId = await carsTrack.methods.tokenOfOwnerByIndex(account, index).call();
        const [cars, ownerOf, tokenUri] = await requestSim(tokenId);
        const uriResult = await fetch(tokenUri);
        const uriData = await uriResult.json();
        const newToken = { ...cars, ownerOf, ...uriData };
        setTokens(oldTokens => [...oldTokens, newToken]);
      }
    }
  }, [carsTrack, account]);

  useEffect(() => {
    if (active) {
      if (tokens.length !== 0 && tokens[0]?.ownerOf !== account) {
        dataFetchedRef.current = true;
        setTokens([]);
        getMyTokens();
      }
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      getMyTokens();
    }
  }, [getMyTokens]);

  if (!active && !error) return <Connect />;

  return (
    <>
      {!error && account && tokens.length === 0 &&
        <LoadingSpinner />
      }
      {!error && account &&
        tokens.map(item => {
          return <Card key={item.tokenId}>
            <Card.Img variant="top" alt={item.name} src={item.image} />
            <Card.Body>
              <Card.Title>Dominio: {item.domain}</Card.Title>
              <Card.Text>
                <span>Marca: {item.brand.company} - Modelo: {item.brand.model}</span><br />
                <span>Cuenta: {item.ownerOf}</span><br />
                <span>Fecha de creacion: {new Date(item.year * 1000).toLocaleString()}</span>
              </Card.Text>
              <Link to={`/${item.tokenId}`}>
                <Button>Ver detalle</Button>
              </Link>
            </Card.Body>
          </Card>
        })
      }
    </>
  );
}

export default MyTokens;