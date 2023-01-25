import { useState } from 'react';

const useAlert = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState('');

    const successAlert = (msg) => {
        setAlertMsg(msg);
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    }

    const completeAlert = () => {
        setAlertMsg(`¡Transaccion completada!`);
        setAlertType('primary');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    }

    const errorAlert = () => {
        setAlertMsg(`Hubo un error en la transaccion. Por favor intente nuevamente.`);
        setAlertType('danger');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    }

  return {
    showAlert,
    alertMsg,
    alertType,
    successAlert,
    completeAlert,
    errorAlert
  };
};

export default useAlert;