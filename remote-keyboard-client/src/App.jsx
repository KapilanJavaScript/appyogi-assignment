import { useState, useEffect } from 'react';
import ControlButton from './component/ControlButton';
import Keyboard from './component/Keyboard';
import { COLOR_MAP, USER_COLOR_MAP } from './utilis/constants';
import { acquireControl, getKeyboardState, toggleKey } from './action/remoteKeyboard';
import socket from './config/socket';


function App() {
  const [keys, setKeys] = useState([]);
  const [hasControl, setHasControl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [color, setColor] = useState(null);
  const [controlUser, setControlUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userFromQuery = params.get('user');

    if(!userFromQuery || ![1, 2].includes(Number(userFromQuery))) { 
      window.location.replace('?user=1');
      return;
    }

    const user = Number(userFromQuery || 1);
    setUser(user);
    setColor(USER_COLOR_MAP[user]);

    // socket connection
    socket.connect();

    socket.emit('join', { user });

    // 🔑 Key update from another user
    socket.on('keyboard:update', (payload) => {
      console.log("Keyboard update received:", user, payload);
      const { key_id, color } = payload;
      setKeys((prev) =>
        prev.map((key) =>
          key.key_id === key_id
            ? { ...key, color: COLOR_MAP[color] }
            : key
        )
      );
      // Control is always released after toggle
      setHasControl(false);
      setControlUser(null);
    });

    // Control state update
    socket.on('control:update', ({ acquired_by }) => {
      console.log("Control update received:",user, acquired_by);
      setHasControl(acquired_by);
      setControlUser(acquired_by);
    });

    return () => {
      socket.off('keyboard:update');
      socket.off('control:update');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if(user) {
      handleFetchKeyboardState()
    }
  }, [user]);

  // API
  const handleFetchKeyboardState = async () => {
    try {
        const keyboardStateResponse = await getKeyboardState(user);
        console.log("Keyboard state:", keyboardStateResponse);
        if (keyboardStateResponse?.status === "success" && Array.isArray(keyboardStateResponse?.response?.keys)) {
          const mappedKeys = keyboardStateResponse.response.keys.map((k) => ({
            key_id: k.key_id,
            color: COLOR_MAP[k.color] || 'white'
          }));
          setIsLoading(false);
          setHasControl(keyboardStateResponse?.response?.keyboardControl);
          setControlUser(keyboardStateResponse?.response?.keyboardControl);
          setKeys(mappedKeys);
        } else {
          alert(keyboardStateResponse?.message || "Failed to load keyboard state. Please try again later.");
        }
    } catch (error) {
      console.error("Error fetching keyboard state:", error);
      alert("Failed to load keyboard state. Please try again later.");
    }
  };

  const handleToggleKey = async (keyId, key) => {
    try {
      const toggleKeyResponse = await toggleKey(user, keyId, { color });
      console.log("Toggle key response:", toggleKeyResponse);
      if (toggleKeyResponse?.status === "success" && toggleKeyResponse?.response) {
        const { key_id, color } = toggleKeyResponse.response;
        setKeys((prev) =>
          prev.map((key) =>
            key.key_id === key_id
              ? { ...key, color: COLOR_MAP[color] }
              : key
          )
        );
        setHasControl(false);
      } else {
        alert(toggleKeyResponse?.message || "Failed to toggle key. Please try again later.");
      }
    } catch (error) {
      console.error("Error toggling key:", error);
      alert(error?.message || "Failed to toggle key. Please try again later.");
    }
  };

  const handleAcquireKeyboardControl = async () => {
    try {
      const acquireControlResponse = await acquireControl(user);
      console.log("Acquire control response:", acquireControlResponse);
      if (acquireControlResponse?.status === "success") {
        setHasControl(true);
        setControlUser(user);
      } else {
        alert(acquireControlResponse?.message || "Failed to acquire control. Please try again later.");
      }
    } catch (error) {
      console.error("Error acquiring control:", error);
      alert(error?.message || "Failed to acquire control. Please try again later.");
    }
  }

  // event handlers
  const handleAcquireControl = () => {
    handleAcquireKeyboardControl();
  };

  const handleKeyClick = (keyId) => {
    console.log("first", keyId, user, color);
    handleToggleKey(keyId);
  };

  if (isLoading) {
    return <div className="app-container">Loading keyboard...</div>;
  }

  return (
    <div className='app-container'>
      <Keyboard
        keys={keys}
        onKeyClick={handleKeyClick}
      />
      <ControlButton
        hasControl={hasControl}
        onAcquire={handleAcquireControl}
      />

      <div className="status-text">
        Status: {hasControl ? `User ${controlUser} has control now` : 'No user has control now'}
      </div>

    </div>
  );
}

export default App;
