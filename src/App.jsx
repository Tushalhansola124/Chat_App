import React, { useEffect, useState, useRef } from 'react';
import ZIM from 'zego-zim-web';

function App() {
  const [zimInstance, setZimInstance] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedUser, setSelectedUser] = useState('Tushal');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const appID = 730546168;

  const tokenA = '04AAAAAGg36YcADBpfkC4Z6Fvn6qhHNgCv79x/SUvqhnJ1/e/3XM7oBCHfd8HqndjTKx4+iUbK9KYRoCQoVnfP6k2rZY5vR3wXrBzmbLv1J6YINRkC0JBh/w/G+F14uSuw3rDbCkr5+GuQ+/2KXvG6fQWN9T4C+4VVk8RaQjb1Y001wMb6/tW4ZYexG4i9q1EqeGyt378ZpH9TtrIoSrkbcOByTLAQcT9b+Czl97yGz4EM+53MR17btmfyzuwRwkBlv3Uuzg5tEQE='; // Trimmed for brevity
  const tokenB = '04AAAAAGg36ZoADDJMvV7zGHKdlVDb6QCv+M2/2OlK45wrJDQBUiYDA7Ws0zFZnxzx9F/juOmTdAyQzoiMGGa0aAIgOAVlTaTdI8m/wzjmsDEVT1jjfhpGI8JrwygXUlFVnaMYbWi0obcI6MQ2ZyVc6C8QoQ+cjQv3YYHqKsUMYCiuKv7SJ4aYdB4UMalu/pR4X4ftBgn18y1vzM5N5n5sbWWCp8x7vII/yBpLL9plGYDEaKYXtIiD9UuI6xjWLvoRao6pC3hWZwE='; // Trimmed for brevity

  useEffect(() => {
    const instance = ZIM.create({ appID });
    setZimInstance(instance);

    instance.on('error', (zim, errorInfo) => {
      console.error('ZIM Error:', errorInfo.code, errorInfo.message);
    });

    instance.on('connectionStateChanged', (zim, { state, event }) => {
      console.log('Connection State:', state, event);
    });

    instance.on('peerMessageReceived', (zim, { messageList }) => {
      setMessages((prev) => [...prev, ...messageList]);
    });

    instance.on('tokenWillExpire', (zim, { second }) => {
      console.log('Token will expire in', second, 'seconds');
      const newToken = selectedUser === 'Tushal' ? tokenA : tokenB;
      zim.renewToken(newToken)
        .then(() => console.log('Token renewed'))
        .catch((err) => console.error('Token renewal failed', err));
    });

    return () => {
      if (instance) instance.destroy();
    };
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isLoggedIn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (!zimInstance) return alert('ZIM instance not ready');

    const userID = selectedUser;
    const userName = selectedUser === 'Tushal' ? 'Client A' : 'Client B';
    const loginToken = selectedUser === 'Tushal' ? tokenA : tokenB;

    zimInstance
      .login({ userID, userName }, loginToken)
      .then(() => {
        setIsLoggedIn(true);
        setUserInfo({ userID, userName });
        setMessages([]);
      })
      .catch((err) => alert(`Login failed [${err.code}]: ${err.message}`));
  };

  const handleSendMessage = () => {
    if (!isLoggedIn) return alert('Please login first');
    if (!messageText.trim()) return;

    const toID = selectedUser === 'Tushal' ? 'Vinay' : 'Tushal';
    const msgObj = { type: 1, message: messageText.trim(), extendedData: '' };

    zimInstance
      .sendMessage(msgObj, toID, 0, { priority: 1 })
      .then(({ message }) => {
        setMessages((prev) => [...prev, message]);
        setMessageText('');
      })
      .catch((err) => alert('Send message failed: ' + err.message));
  };

  const handleLogout = () => {
    if (zimInstance) zimInstance.logout();
    setIsLoggedIn(false);
    setUserInfo(null);
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recipient = selectedUser === 'Tushal' ? 'Vinay' : 'Tushal';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>💬 TPH CHAT</h1>

      {!isLoggedIn ? (
        <div style={{
          background: '#f0f0f0', padding: '30px', borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Select User</h2>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', fontSize: '16px' }}
          >
            <option value="Tushal">USER_A</option>
            <option value="Vinay">USER_B</option>
          </select>
          <button
            onClick={handleLogin}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <h3>Chatting as <span style={{ color: '#4CAF50' }}>{userInfo.userName}</span> with <span style={{ color: '#2196F3' }}>{recipient}</span></h3>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#f44336',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '5px'
              }}
            >
              Logout
            </button>
          </div>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#e5ddd5'
          }}>
            {messages.map((msg, index) => {
              const isOwn = msg.senderUserID === userInfo.userID;
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{
                    background: isOwn ? '#dcf8c6' : '#fff',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    maxWidth: '70%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {!isOwn && (
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
                        {msg.senderUserID}
                      </div>
                    )}
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '4px', color: '#777' }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flexGrow: 1,
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '30px',
                border: '1px solid #ccc',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                borderRadius: '30px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
