import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useCarsTrack from '../hooks/useCarsTrack';
import useAlert from '../hooks/useAlert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Connect from '../components/Connect';
import LoadingSpinner from '../components/LoadingSpinner';

function Attributes() {
    const { active, account, error } = useWeb3React();
    const carsTrack = useCarsTrack();
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState();
    const [canEdit, setCanEdit] = useState(false);
    const { showAlert, alertMsg, alertType, successAlert, completeAlert, errorAlert } = useAlert();

    const title = useRef(null);
    const desc = useRef(null);
    const transferTo = useRef(null);

    const requestSim = (tokenId) => {
        return Promise.all([
            carsTrack.methods.cars(tokenId).call(),
            carsTrack.methods.ownerOf(tokenId).call(),
            carsTrack.methods.tokenURI(tokenId).call(),
        ]);
    }

    const getToken = useCallback(async () => {
        if (carsTrack) {
            const [_, tokenId] = location.pathname.split('/');
            const [cars, ownerOf, tokenUri] = await requestSim(tokenId);
            let notes = [];
            for (let index = 0; index < cars.totalNotes; index++) {
                const note = await carsTrack.methods.viewNoteByCarIdAndNoteId(tokenId, index).call();
                notes.push(note);
            }
            const uriResult = await fetch(tokenUri);
            const uriData = await uriResult.json();
            const newToken = { ...cars, ownerOf, ...uriData, notes };
            setToken(newToken);
            setCanEdit(false);
            if (ownerOf === account) {
                setCanEdit(true);
            }
        }
    }, [carsTrack, account]);

    useEffect(() => {
        if (active) {
            getToken();
        }
    }, [getToken]);

    const safeTrasfer = (from, to, tokenId) => {
        carsTrack.methods.safeTransferFrom(from, to, tokenId).send({
            from: account,
        })
            .on("transactionHash", (txHash) => {
                successAlert(`Transaccion satisfactioria numero: ${txHash}`);
                setCanEdit(false);
            })
            .on("receipt", () => {
                navigate('/mytokens');
            })
            .on("error", (error) => {
                errorAlert();
                setCanEdit(true);
            });
    }

    const saveNote = (tokenId, title, desc) => {
        carsTrack.methods.addNote(tokenId, title, desc).send({
            from: account,
        })
            .on("transactionHash", (txHash) => {
                successAlert(`Transaccion satisfactioria numero: ${txHash}, veras los resultados cuando la transaccion se complete.`);
            })
            .on("receipt", () => {
                completeAlert();
                refreshView();
            })
            .on("error", (error) => {
                errorAlert();
            });
    }

    const transfer = (e) => {
        e.preventDefault();
        safeTrasfer(
            account,
            transferTo.current.value,
            token.tokenId
        );
    }

    const save = (e) => {
        e.preventDefault();
        saveNote(
            token.tokenId,
            title.current.value,
            desc.current.value
        );
    }

    const refreshView = async () => {
        const [_, tokenId] = location.pathname.split('/');
        const { totalNotes } = await carsTrack.methods.cars(tokenId).call();
        let notes = [];
        for (let index = 0; index < totalNotes; index++) {
            const note = await carsTrack.methods.viewNoteByCarIdAndNoteId(tokenId, index).call();
            notes.push(note);
        }
        title.current.value = '';
        desc.current.value = '';
        const newToken = { ...token, notes };
        setToken(newToken);
    }

    if (!active && !error) return <Connect />;
    return (
        <div className="attributes-container">
            {!error && !token &&
                <LoadingSpinner />
            }
            <div className="attributes-card">
                {!error && token &&
                    <Card>
                        <Card.Img variant="top" alt={token.name} src={token.image} />
                        <Card.Body>
                            <Card.Title>Dominio: {token.domain}</Card.Title>
                            <Card.Text>
                                <span>Marca: {token.brand.company} - Modelo: {token.brand.model}</span><br />
                                <span>Cuenta: {token.ownerOf}</span><br />
                                <span>Fecha de creacion: {new Date(token.year * 1000).toLocaleString()}</span>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                }
                {!error && canEdit &&
                    <Form>
                        <Form.Group className="mb-2" controlId="transferTo">
                            <Form.Control type="text" ref={transferTo} placeholder="Trasnferir a cuenta: Ej. 0x987..." />
                        </Form.Group>
                        <Button onClick={transfer} variant="primary" type="submit">
                            Transferir
                        </Button>
                    </Form>
                }
            </div>
            <div className="attributes-list">
                {!error && canEdit &&
                    <div className="attributes-list-form">
                        <h4>Agregar nuevo registro</h4>
                        <Form>
                            <Form.Group className="mb-2" controlId="title">
                                <Form.Control type="text" ref={title} placeholder="Titulo" />
                            </Form.Group>

                            <Form.Group className="mb-2" controlId="desc">
                                <Form.Control as="textarea" ref={desc} rows={3} placeholder="Descripcion" />
                            </Form.Group>
                            <Button onClick={save} variant="primary" type="submit">
                                Cargar
                            </Button>
                        </Form>
                    </div>
                }
                <div className={`${canEdit ? "attributes-list-note-container-owner" : "attributes-list-note-container"}`}>
                    {!error && token &&
                        token.notes.map((item, index) => {
                            return <div key={index} className="attributes-list-note">
                                <h5>{item.title}</h5>
                                <p>{item.desc}</p>
                                <p>{new Date(item.year * 1000).toLocaleString()}</p>
                                <p>{item.signer}</p>
                            </div>
                        }).reverse()
                    }
                </div>                
            </div>
            {showAlert &&
                <Alert className="alerts" variant={alertType}>
                    {alertMsg}
                </Alert>
            }
        </div>
    );
}

export default Attributes;