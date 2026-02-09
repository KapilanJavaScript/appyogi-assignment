const ControlButton = ({ hasControl, onAcquire }) => {
  return (
    <button
      onClick={onAcquire}
      disabled={hasControl}
      className="control-button"
    >
      Take Control
    </button>
  );
};

export default ControlButton;
