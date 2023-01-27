import Spinner from 'react-bootstrap/Spinner';

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <Spinner className="loading" animation="grow" variant="success">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <Spinner className="loading" animation="grow" variant="success">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <Spinner className="loading" animation="grow" variant="success">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default LoadingSpinner;