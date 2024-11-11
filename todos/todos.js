// Selectores
const form = document.querySelector('#main-form');
const nameInput = document.querySelector('#name-input');
const phoneInput = document.querySelector('#phone-input');
const mainFormBtn = document.querySelector('#main-form-btn');
const contactsList = document.querySelector('#contacts-list');
const user = JSON.parse(localStorage.getItem("user"));
const closeBtn = document.querySelector('#cerrar-btn');

if (!user) {
  window.location.href = "../home/index.html";
}

const NAME_REGEX = /^[A-Z]{1}[a-z]*[ ][A-Z]{1}[a-z]*$/;
const PHONE_REGEX = /^(0212|0412|0424|0414|0426|0416)[0-9]{7}$/;

let nameInputValidation = false; 
let phoneInputValidation = false;


// Contactos
const contactsManagerInit = () => {
  const publicAPI = {
    
    renderContacts: async () => {

      const response = await fetch("http://localhost:3000/todos", {method: "GET"});
    const todos = await response.json();
    const userTodos = todos.filter(todo => todo.user === user.username);
    contactsList.innerHTML = '';
    userTodos.forEach(todo => {
        const listItem = document.createElement("li");
        listItem.classList.add('contacts-list-item');
        listItem.innerHTML = `
        <li class="contacts-list-item" id="${todo.id}">
        <div class="inputs-container">
          <input class="contacts-list-item-name-input" type="text" value="${todo.name}" readonly>
          <input class="contacts-list-item-phone-input" type="text" value="${todo.phone}" readonly>
        </div>
        <div class="btns-container">
          <button class="edit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button class="delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </li>
        `;
        contactsList.append(listItem);
    });
    displayList();
    },
  }
  return publicAPI;
}
const contactsManager = contactsManagerInit();

const checkValidations = () => {
  if (nameInputValidation && phoneInputValidation) {
    mainFormBtn.disabled = false;
  } else {
    mainFormBtn.disabled = true;
  }
}

// es la funcion para colocar en rojo o en verde el borde de los inputs.
const validateInput = (input, validation) => {
  const helpText = input.parentElement.children[2];
  if (input.value === '') {
    input.classList.remove('valid');
    input.classList.remove('invalid');
    helpText.classList.remove('invalidText');
  } else if (validation) {
    input.classList.add('valid');
    input.classList.remove('invalid');
    helpText.classList.remove('invalidText');
  } else {
    input.classList.add('invalid');
    input.classList.remove('valid');
    helpText.classList.add('invalidText');
  }
}

const displayList = () => {
  if (contactsList.childElementCount === 0) {
    contactsList.style.display = 'none';
} else {
  contactsList.style.display = 'flex';
}
}


//evento: Input la letra e que se coloca viene de evento. target es a que le estoy aplicando el evento  y value es el valor.
nameInput.addEventListener('input', e => {
  nameInputValidation = NAME_REGEX.test(nameInput.value);
  validateInput(nameInput, nameInputValidation);
  checkValidations();
});

phoneInput.addEventListener('input', e => {
  phoneInputValidation = PHONE_REGEX.test(phoneInput.value);
  validateInput(phoneInput, phoneInputValidation);
  checkValidations();
});

form.addEventListener('submit', async e => {

  e.preventDefault();
  await fetch("http://localhost:3000/todos", { 
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({name: nameInput.value, phone: phoneInput.value, user: user.username}),
  });

  contactsManager.renderContacts();
});

contactsList.addEventListener('click', async e => {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  if (deleteBtn) {
    const li = deleteBtn.parentElement.parentElement;
    const id = li.id;
    await fetch(`http://localhost:3000/todos/${id}`, {method: "DELETE",});
    e.target.parentElement.remove();
    contactsManager.renderContacts();
} else if (editBtn) {
  const li = editBtn.parentElement.parentElement;
  const id = li.id;
  // Selecciono ambos inputs
  const nameInputEdit = li.children[0].children[0];
  const phoneInputEdit = li.children[0].children[1];

  let editNameValidation = NAME_REGEX.test(nameInputEdit.value);
  let editPhoneValidation = PHONE_REGEX.test(phoneInputEdit.value);

  // Esta condicional es para que el borde se  ponga en rojo cuando sea incorrecto

  if (!editNameValidation && editBtn.classList.contains('editando')) {
    nameInputEdit.classList.add('invalidEdit')
  } else {
    nameInputEdit.classList.remove('invalidEdit')
  };

  if (!editPhoneValidation && editBtn.classList.contains('editando')) {
    phoneInputEdit.classList.add('invalidEdit');
  } else {
    phoneInputEdit.classList.remove('invalidEdit')
  }

  // Esta condicional es para que el borde se ponga en verde cuando sea correcto

  if (editNameValidation && editBtn.classList.contains('editando')) {
    nameInputEdit.classList.add('validEdit')
  } else {
    nameInputEdit.classList.remove('validEdit')
  };

  if (editPhoneValidation && editBtn.classList.contains('editando')) {
    phoneInputEdit.classList.add('validEdit');
  } else {
    phoneInputEdit.classList.remove('validEdit')
  }    

  if (editNameValidation && editPhoneValidation && editBtn.classList.contains('editando')) {
    editBtn.classList.remove('editando');
    // Añado el atributo readonly para no poder editar los contactos
    nameInputEdit.setAttribute('readonly', true);
    phoneInputEdit.setAttribute('readonly', true);
    nameInputEdit.classList.remove('edit')
    phoneInputEdit.classList.remove('edit')

    await fetch(`http://localhost:3000/todos/${id}`, { 
      method: "PATCH",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({name: nameInputEdit.value, phone: phoneInputEdit.value}),
  });

    // Se renderiza el array sin el contacto eliminado.
    contactsManager.renderContacts();
  } else {
    editBtn.classList.add('editando');
    // Remuevo el atributo readonly para poder editar los contactos
    nameInputEdit.removeAttribute('readonly');
    phoneInputEdit.removeAttribute('readonly')
  }
  }
  
}); 

closeBtn.addEventListener("click", async e => {
  localStorage.removeItem("user");
  window.location.href = "../home/index.html";
});

window.onload = () => {
  // Muestro los contactos en el html
  contactsManager.renderContacts();
}