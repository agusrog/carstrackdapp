import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { connector } from '../config/web3';
import { useCallback, useEffect, useState } from 'react';
import useCarsTrack from '../hooks/useCarsTrack';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

function Header() {
  const { active, activate, deactivate, account, error, library } =
    useWeb3React();
  const carsTrack = useCarsTrack();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [owner, setOwner] = useState('');


  const connect = () => {
    activate(connector);
    localStorage.setItem('previouslyConnected', 'true');
  };

  const disconnect = () => {
    deactivate();
    localStorage.removeItem('previouslyConnected');
  };

  const getBalance = useCallback(async () => {
    const toSet = await library.eth.getBalance(account);
    setBalance((toSet / 1e18).toFixed(2));
  }, [library?.eth, account]);

  const getOwner = useCallback(async () => {
    if (carsTrack) {
      const result = await carsTrack.methods.owner().call();
      setOwner(result);
    }
  }, [carsTrack]);

  useEffect(() => {
    if (active) getBalance();
  }, [active, getBalance]);

  useEffect(() => {
    if (active) getOwner();
  }, [account]);

  useEffect(() => {
    if (localStorage.getItem('previouslyConnected') === 'true') connect();
  }, []);

  const navigateToHome = async () => {
    return navigate('/');
  };

  const navigateToMyTokens = async () => {
    return navigate('/mytokens');
  };

  const navigateToAdmin = async () => {
    return navigate('/admin');
  };

  return (
    <>
      <section>
        <h1>Cars Track Dapp</h1>
      </section>

      <nav>
        {!error && active &&
          <div>
            <h4>{account}</h4>
            <h4>{balance}</h4>
          </div>
        }

        {!error ? (
          <div>
            <Button onClick={navigateToHome}>Home</Button>
            <Button onClick={navigateToMyTokens}>Mis tokens</Button>
            <Button onClick={connect}>conectar</Button>
            <Button onClick={disconnect}>desconectar</Button>
          </div>
        ) : (
          <div>
            <h4>Esta red no esta soportada, cambia a la TestNet Goerli</h4>
          </div>
        )}

        {!error && owner === account && (
          <div>
            <Button onClick={navigateToAdmin}>Crear nuevo token</Button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;
