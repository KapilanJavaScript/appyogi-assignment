const Key = ({ id, color, onClick }) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={`key ${color}`}
    >{id}</div>
  );
};

export default Key;
