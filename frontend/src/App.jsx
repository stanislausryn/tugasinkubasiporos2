import { useState, useEffect } from 'react'

const API_URL = '/api/todos'

function App() {
    const [todos, setTodos] = useState([])
    const [newTitle, setNewTitle] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchTodos = async () => {
        try {
            setLoading(true)
            const res = await fetch(API_URL)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setTodos(data)
            setError(null)
        } catch (err) {
            setError('Gagal memuat data. Pastikan backend berjalan.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTodos()
    }, [])

    const addTodo = async (e) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle.trim() })
            })
            if (!res.ok) throw new Error('Failed to create')
            const todo = await res.json()
            setTodos([todo, ...todos])
            setNewTitle('')
        } catch (err) {
            setError('Gagal menambahkan todo.')
        }
    }

    const toggleTodo = async (id, completed) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !completed })
            })
            if (!res.ok) throw new Error('Failed to update')
            const updated = await res.json()
            setTodos(todos.map(t => t.id === id ? updated : t))
        } catch (err) {
            setError('Gagal mengupdate todo.')
        }
    }

    const deleteTodo = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            setTodos(todos.filter(t => t.id !== id))
        } catch (err) {
            setError('Gagal menghapus todo.')
        }
    }

    const completedCount = todos.filter(t => t.completed).length

    return (
        <div className="app">
            <div className="container">
                <header className="header">
                    <div className="header-glow"></div>
                    <h1>
                        <span className="icon">✦</span> Todo App
                    </h1>
                    <p className="subtitle">Kelola tugas harianmu dengan mudah</p>
                    <div className="stats">
                        <div className="stat">
                            <span className="stat-number">{todos.length}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{completedCount}</span>
                            <span className="stat-label">Selesai</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{todos.length - completedCount}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                </header>

                <form className="add-form" onSubmit={addTodo}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Tambahkan tugas baru..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <button type="submit" className="btn-add" disabled={!newTitle.trim()}>
                        <span>+</span> Tambah
                    </button>
                </form>

                {error && (
                    <div className="error">
                        <span>⚠</span> {error}
                        <button className="error-close" onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="todo-list">
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Memuat data...</p>
                        </div>
                    ) : todos.length === 0 ? (
                        <div className="empty">
                            <span className="empty-icon">📋</span>
                            <p>Belum ada tugas. Tambahkan tugas pertamamu!</p>
                        </div>
                    ) : (
                        todos.map(todo => (
                            <div
                                key={todo.id}
                                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                            >
                                <button
                                    className={`checkbox ${todo.completed ? 'checked' : ''}`}
                                    onClick={() => toggleTodo(todo.id, todo.completed)}
                                >
                                    {todo.completed && <span>✓</span>}
                                </button>
                                <span className="todo-title">{todo.title}</span>
                                <button
                                    className="btn-delete"
                                    onClick={() => deleteTodo(todo.id)}
                                    title="Hapus"
                                >
                                    🗑
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <footer className="footer">
                    <p>Todo App • Flask + React + MySQL</p>
                </footer>
            </div>
        </div>
    )
}

export default App
