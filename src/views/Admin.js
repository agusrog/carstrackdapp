import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCarsTrack from '../hooks/useCarsTrack';
import useAlert from '../hooks/useAlert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Connect from '../components/Connect';

function Admin() {
  const { active, account, error } = useWeb3React();
  const carsTrack = useCarsTrack();
  const navigate = useNavigate();
  const { showAlert, alertMsg, alertType, successAlert, completeAlert, errorAlert } = useAlert();

  const wallet = useRef(null);
  const domain = useRef(null);
  const company = useRef(null);
  const model = useRef(null);
  const meta = useRef(null);

  const getOwner = useCallback(async () => {
    if (carsTrack) {
      const owner = await carsTrack.methods.owner().call();
      if (active && owner !== account) navigate('/');
    }
  }, [carsTrack, account]);

  useEffect(() => {
    if (active) getOwner();
  }, [getOwner]);

  const mint = (to, domain, company, model, meta) => {
    carsTrack.methods.safeMint(to, domain, company, model, meta).send({
      from: account,
    })
      .on("transactionHash", (txHash) => {
        successAlert(`Transaccion satisfactioria numero: ${txHash}, veras los resultados cuando la transaccion se complete.`);
      })
      .on("receipt", () => {
        completeAlert();
      })
      .on("error", (error) => {
        errorAlert();
      });
  }

  const create = (e) => {
    e.preventDefault();
    if (meta.current.value >= 0 && meta.current.value < 8) {
      mint(
        wallet.current.value,
        domain.current.value,
        company.current.value,
        model.current.value,
        meta.current.value
      );
    }
  }

  if (!active && !error) return <Connect />;
  return (
    <>
      {!error &&
        <div className="admin-form">
          <h4>Agregar nueva unidad</h4>
          <Form>

            <Form.Group className="mb-2" controlId="wallet">
              <Form.Control type="text" ref={wallet} placeholder="Direccion de cuenta" />
            </Form.Group>

            <Form.Group className="mb-2" controlId="domain">
              <Form.Control type="text" ref={domain} placeholder="Dominio" />
            </Form.Group>

            <Form.Group className="mb-2" controlId="company">
              <Form.Control type="text" ref={company} placeholder="Marca" />
            </Form.Group>

            <Form.Group className="mb-2" controlId="model">
              <Form.Control type="text" ref={model} placeholder="Modelo" />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Select id="meta" ref={meta}>
                <option value={10}>-- Color --</option>
                <option value={0}>Rojo</option>
                <option value={1}>Amarillo</option>
                <option value={2}>Verde</option>
                <option value={3}>Azul</option>
                <option value={4}>Violeta</option>
                <option value={5}>Negro</option>
                <option value={6}>Gris</option>
                <option value={7}>Blanco</option>
              </Form.Select>
            </Form.Group>

            <Button onClick={create} variant="primary" type="submit">
              Crear
            </Button>
          </Form>
        </div>
      }
      {showAlert &&
        <Alert className="alerts" variant={alertType}>
          {alertMsg}
        </Alert>
      }
    </>
  );
}

export default Admin;