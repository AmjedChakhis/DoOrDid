const apiGateway = "https://wr032ve8gk.execute-api.us-east-1.amazonaws.com/stage";

async function addTodo() {
  const inputElement = document.getElementById('new-todo');
  const todoName = inputElement.value.trim();

  if (!todoName) {
    alert('Please enter a valid Task item.');
    return;
  }

  const apiUrl = `${apiGateway}/addtask`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: todoName })
    });

    const data = await response.json();
    alert(data.message);
    console.log(response);
    inputElement.value = '';
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function getTodo() {
    const idElement = document.getElementById('todo-id');
    const todoId = idElement.value.trim();
  
    if (!todoId) {
      alert('Please enter a valid Task ID.');
      return;
    }
  
    const apiUrl = `${apiGateway}/getTask?id=${todoId}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
      console.log('Response Data:', data);
  
      if (response.ok) {
        // Parse the JSON string in the body to get the actual data
        const todoData = JSON.parse(data.body);
        displayTodo(todoData);
      } else {
        console.error('Error:', data.error);
        alert(data.message || 'An error occurred. Please try again.');
      }
  
      idElement.value = ''; 
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  }
  
  function displayTodo(data) {
    console.log('Todo Data:', data);
  
    if (!data || !data.id || !data.id.N) {
      console.error('Invalid Todo data:', data);
      alert('Invalid Todo data received.');
      return;
    }
  
    const todoId = data.id.N;
    const todoName = data.name.S;
    const todoDescription = data.description.S;
    const todoStatus = data.status.S;
  
    document.getElementById('todo-id-display').textContent = todoId;
    document.getElementById('todo-name-display').textContent = todoName;
    document.getElementById('todo-description-display').textContent = todoDescription;
    document.getElementById('todo-status-display').textContent = todoStatus;
  
    createUpdateButtons(todoId, todoName, todoDescription, todoStatus);
  }
  
  function createUpdateButtons(todoId, todoName, todoDescription, todoStatus) {
    removeUpdateButtons();
  
    createButton('Update Name', 'update-name-button', () => {
      const newName = prompt('Enter new name:');
      if (newName) {
        updateName(todoId, newName, todoDescription);
      }
    }, 'update-name-button-container');
  
    createButton('Update Description', 'update-description-button', () => {
      const newDesc = prompt('Enter new description:');
      if (newDesc) {
        updateDescription(todoId, newDesc, todoName);
      }
    }, 'update-description-button-container');
  
    createButton('Mark as Completed', 'update-status-button', () => {
      updateStatus(todoId);
    }, 'update-status-button-container');
  
    function createButton(text, id, onClick, containerId) {
      const button = document.createElement('button');
      button.textContent = text;
      button.id = id;
      button.className = 'update-button';
      button.onclick = onClick;
      document.getElementById(containerId).appendChild(button);
    }
  }
  
  function removeUpdateButtons() {
    document.querySelectorAll('.update-button').forEach(button => button.remove());
  }
  
async function showAllTodos() {
    const todoListElement = document.getElementById('todo-list');
    const apiUrl = `${apiGateway}/getAll`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log("Type of Response Data:", typeof responseData.body); // Logging the type of responseData
        const bodyArray=JSON.parse(responseData.body);

        // Ensure responseData.body is already an array
        if (!Array.isArray(bodyArray)) {
            console.error("Received data is not an array:", responseData);
            throw new Error('Data is not an array');
        }

        toggleDisplayTable();
        todoListElement.innerHTML = '';

        bodyArray.forEach(todo => {
            const tr = document.createElement('tr');
            tr.appendChild(createTd(todo.id));
            tr.appendChild(createTd(todo.name));
            tr.appendChild(createTd(todo.description));
            tr.appendChild(createTd(todo.status));
            tr.appendChild(createActionsTd(todo.id));
            todoListElement.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }

    function createTd(text) {
        const td = document.createElement('td');
        td.textContent = text;
        return td;
    }

    function createActionsTd(id) {
        const td = document.createElement('td');
        td.appendChild(createButton('Mark as Completed', 'complete', async () => {
            await updateStatusOnList(id);
            showAllTodos();
        }));
        td.appendChild(createButton('Delete', 'delete', async () => {
            await deleteTodo(id);
            showAllTodos();
        }));
        return td;
    }

    function createButton(text, className, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `action-button ${className}`;
        button.onclick = onClick;
        return button;
    }
}

  


async function deleteTodo(id) {
  try {
    const response = await fetch(`${apiGateway}/deleteTask?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function updateName(id, newName, description) {
  try {
    const response = await fetch(`${apiGateway}/updateTask?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName, description: description })
    });

    if (response.ok) {
      document.getElementById('todo-name-display').textContent = newName;
      createUpdateButtons(id, newName, description);
    } else {
      alert('Update failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function updateDescription(id, newDescription, name) {
  try {
    const response = await fetch(`${apiGateway}/updateTask?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name, description: newDescription })
    });

    if (response.ok) {
      document.getElementById('todo-description-display').textContent = newDescription;
      createUpdateButtons(id, name, newDescription);
    } else {
      alert('Update failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function updateStatus(id) {
  try {
    const response = await fetch(`${apiGateway}/completeTask?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      document.getElementById('todo-status-display').textContent = 'COMPLETED';
    } else {
      alert('Update failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
async function updateStatusOnList(id) {
  try {
    const response = await fetch(`${apiGateway}/completeTask?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const todoStatusDisplay = document.getElementById('todo-status-display');
      if (todoStatusDisplay) {
        todoStatusDisplay.textContent = 'COMPLETED';
      }
      showAllTodos();
    } else {
      alert('Update failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}



function hideAllTodos() {
  hideDisplayTable()
  const todoListElement = document.getElementById('todo-list');
  todoListElement.innerHTML = ''; 
}