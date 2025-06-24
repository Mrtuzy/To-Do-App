import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
      <Router>
        <div className="App">
          <nav>
            {!isLoggedIn ? (
                <>
                  <Link to="/login">Giriş Yap</Link> | <Link to="/signup">Kayıt Ol</Link>
                </>
            ) : (
                <>
                  <Link to="/todos">Yapılacaklar Listem</Link> | <button onClick={handleLogout}>Çıkış Yap</button>
                </>
            )}
          </nav>

          <Routes>
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/todos" element={isLoggedIn ? <TodoListPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/" element={isLoggedIn ? <TodoListPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          </Routes>
        </div>
      </Router>
  );
}

function LoginPage({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      navigate('/todos');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Giriş başarısız oldu.');
    }
  };

  return (
      <div>
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Giriş Yap</button>
        </form>
        {message && <p>{message}</p>}
      </div>
  );
}

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/signup`, { email, password });
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Kayıt başarısız oldu.');
    }
  };

  return (
      <div>
        <h2>Kayıt Ol</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Kayıt Ol</button>
        </form>
        {message && <p>{message}</p>}
      </div>
  );
}

function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [newTodoContent, setNewTodoContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line
  }, []);

  const fetchTodos = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data.todos);
    } catch (error) {
      setMessage(error.response?.data?.message || "To-do'lar yüklenirken hata oluştu.");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(
          `${API_URL}/todos`,
          { content: newTodoContent },
          { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTodoContent('');
      fetchTodos();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Görev eklenirken hata oluştu.');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(
          `${API_URL}/todos/${id}`,
          { completed: !completed },
          { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Görev güncellenirken hata oluştu.');
    }
  };

  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Görev silinirken hata oluştu.');
    }
  };

  return (
      <div>
        <h2>Yapılacaklar Listem</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleAddTodo}>
          <input
              type="text"
              placeholder="Yeni görev ekle..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              required
          />
          <button type="submit">Ekle</button>
        </form>
        <ul>
          {todos.map((todo) => (
              <li key={todo._id} >
                <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.content}
                </span>
                <button onClick={() => handleToggleComplete(todo._id, todo.completed)}>
                  {todo.completed ? 'Geri Al' : 'Tamamlandı'}
                </button>
                <button onClick={() => handleDeleteTodo(todo._id)}>Sil</button>
              </li>
          ))}
        </ul>
      </div>
  );
}

export default App;