import Key from './Key';

const Keyboard = ({ keys, onKeyClick }) => {
  return (
    <div className='keyboard-wrapper'>
      <div className='keyboard-grid'>
        {keys.map((key) => (
          <Key
            key={key.key_id}
            id={key.key_id}
            color={key.color}
            onClick={onKeyClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
