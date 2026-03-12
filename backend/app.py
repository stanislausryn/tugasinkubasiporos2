import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'db'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'rootpassword'),
    'database': os.environ.get('DB_NAME', 'tododb')
}


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def wait_for_db(max_retries=30, delay=2):
    for i in range(max_retries):
        try:
            conn = get_db_connection()
            conn.close()
            print("Database connection established!")
            return True
        except Error as e:
            print(f"Waiting for database... attempt {i+1}/{max_retries}")
            time.sleep(delay)
    raise Exception("Could not connect to database")


@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Error:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 503


@app.route('/api/todos', methods=['GET'])
def get_todos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM todos ORDER BY created_at DESC')
        todos = cursor.fetchall()
        cursor.close()
        conn.close()
        for todo in todos:
            todo['completed'] = bool(todo['completed'])
            todo['created_at'] = todo['created_at'].isoformat()
        return jsonify(todos), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    if not data or 'title' not in data or not data['title'].strip():
        return jsonify({'error': 'Title is required'}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'INSERT INTO todos (title) VALUES (%s)',
            (data['title'].strip(),)
        )
        conn.commit()
        todo_id = cursor.lastrowid
        cursor.execute('SELECT * FROM todos WHERE id = %s', (todo_id,))
        todo = cursor.fetchone()
        cursor.close()
        conn.close()
        todo['completed'] = bool(todo['completed'])
        todo['created_at'] = todo['created_at'].isoformat()
        return jsonify(todo), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM todos WHERE id = %s', (todo_id,))
        todo = cursor.fetchone()
        if not todo:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Todo not found'}), 404

        title = data.get('title', todo['title'])
        completed = data.get('completed', todo['completed'])

        cursor.execute(
            'UPDATE todos SET title = %s, completed = %s WHERE id = %s',
            (title, completed, todo_id)
        )
        conn.commit()
        cursor.execute('SELECT * FROM todos WHERE id = %s', (todo_id,))
        updated_todo = cursor.fetchone()
        cursor.close()
        conn.close()
        updated_todo['completed'] = bool(updated_todo['completed'])
        updated_todo['created_at'] = updated_todo['created_at'].isoformat()
        return jsonify(updated_todo), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM todos WHERE id = %s', (todo_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Todo not found'}), 404
        cursor.execute('DELETE FROM todos WHERE id = %s', (todo_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Todo deleted'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    wait_for_db()
    app.run(host='0.0.0.0', port=5000, debug=False)
