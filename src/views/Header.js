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
      <section className='section-header'>
        <h1>Cars Track Dapp</h1>
        <h2>Registro de vehiculos</h2>
      </section>

      <nav className='nav'>
        {!error &&
          <>
            <Button onClick={navigateToHome}>Home</Button>
            <Button onClick={navigateToMyTokens}>Mis tokens</Button>
          </>
        }
        {!error && owner === account && (
          <>
            <Button onClick={navigateToAdmin}>Crear nuevo token</Button>
          </>
        )}
      </nav>

      <section className='user-info'>
        {error && !active &&
          <div>
            <h4>Hubo un error, asegurate de estar en la TestNet Goerli</h4>
          </div>
        }

        {!error && !active &&
          <div className='connect-btn'>
            <Button onClick={connect}>conectar</Button>
          </div>
        }

        {!error && active &&
          <>
            <div className='user-accounts'>
              <div className='user-account-data'>
                <span>Cuenta:</span><span>{account}</span>
              </div>
              <div className='user-account-data'>
                <span>Saldo:</span><span>{balance}</span>
              </div>
            </div>
            <Button onClick={disconnect}>desconectar</Button>
          </>
        }
      </section>
    </>
  );
}

export default Header;
