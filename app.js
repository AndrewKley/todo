(() => {
  const storageKey = 'todo.tasks.v1';

  function initialize() {
    const form = document.querySelector('#task-form');
    const input = document.querySelector('#task-input');
    const list = document.querySelector('#task-list');
    const emptyState = document.querySelector('#empty-state');
    const storageError = document.querySelector('#storage-error');
    let tasks = [];

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every(task => (
            task !== null && typeof task === 'object'
            && typeof task.id === 'string'
            && typeof task.text === 'string'
            && typeof task.completed === 'boolean'
          ))) {
            tasks = parsed.map(({ id, text, completed }) => ({ id, text, completed }));
          }
        } catch {
          tasks = [];
        }
      }
    } catch {
      storageError.hidden = false;
    }

    function save() {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(tasks));
        storageError.hidden = true;
      } catch {
        storageError.hidden = false;
      }
    }

    function render() {
      list.replaceChildren();
      emptyState.hidden = tasks.length > 0;

      tasks.forEach(task => {
        const item = document.createElement('li');
        item.className = 'task-item';
        item.classList.toggle('is-completed', task.completed);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', task.text);
        checkbox.addEventListener('change', () => {
          task.completed = checkbox.checked;
          item.classList.toggle('is-completed', task.completed);
          save();
        });

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'task-delete';
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => {
          tasks = tasks.filter(candidate => candidate !== task);
          save();
          render();
        });

        item.append(checkbox, text, deleteButton);
        list.append(item);
      });
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const id = typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      tasks.push({ id, text, completed: false });
      save();
      render();
      input.value = '';
      input.focus();
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
