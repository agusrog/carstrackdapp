import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useCarsTrack from '../hooks/useCarsTrack';
import useAlert from '../hooks/useAlert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

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
                successAlert(`Transaccion satisfactioria numero: ${txHash}`);
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
        const newToken = { ...token, notes };
        setToken(newToken);
    }

    if (!active && !error) return 'Conecta tu wallet';
    return (
        <>
            {canEdit &&
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
            }
            {canEdit &&
                <Form>
                    <Form.Group className="mb-2" controlId="transferTo">
                        <Form.Control type="text" ref={transferTo} placeholder="Trasnferir a:" />
                    </Form.Group>
                    <Button onClick={transfer} variant="primary" type="submit">
                        Transferir
                    </Button>
                </Form>
            }
            {!error && token &&
                <div>
                    <img src={token.image} alt={token.name} width="150" />
                    <p>{token.domain}</p>
                    <p>{token.brand.company}</p>
                    <p>{token.brand.model}</p>
                    <p>{token.ownerOf}</p>
                    <p>{new Date(token.year * 1000).toLocaleString()}</p>
                </div>

            }

            {!error && token &&
                token.notes.map((item, index) => {
                    return <div key={index}>
                        <p>{item.title}</p>
                        <p>{item.desc}</p>
                        <p>{new Date(item.year * 1000).toLocaleString()}</p>
                    </div>
                })
            }
            {showAlert &&
                <Alert variant={alertType}>
                    {alertMsg}
                </Alert>
            }
        </>
    );
}

export default Attributes;