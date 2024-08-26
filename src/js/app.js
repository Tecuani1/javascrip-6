const link = 'https://reqres.in/api/users?delay=4';

// Función para mostrar u ocultar el spinner de carga
function statusSpinner(isVisible) {
  const spinner = document.getElementById('spinner');
  const form = document.getElementById('contact-form');
  const mainCont = document.querySelector('.main-cont');

  if (isVisible) {
    spinner.classList.remove('hide-spinner');
    spinner.classList.add('show-spinner');
    form.classList.add('disabled-form');

    // Crear y añadir el fondo bloqueado
    const lockedBg = document.createElement('div');
    lockedBg.classList.add('locked-background');
    lockedBg.id = 'locked-bg';
    mainCont.appendChild(lockedBg);
  } else {
    spinner.classList.remove('show-spinner');
    spinner.classList.add('hide-spinner');
    form.classList.remove('disabled-form');

    // Eliminar el fondo bloqueado
    const lockedBg = document.getElementById('locked-bg');
    if (lockedBg) {
      lockedBg.remove();
    }
  }
}

// Función para crear una celda de tabla con contenido y una clase opcional
function createTableCell(content, className) {
  const cell = document.createElement('td');
  if (className) cell.classList.add(className);
  cell.textContent = content;
  return cell;
}

// Función para generar un color aleatorio
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createInitialCircle(firstName) {
  const circleDiv = document.createElement('div');
  circleDiv.classList.add('initial-circle'); // Añadir clase para estilos
  circleDiv.style.backgroundColor = getRandomColor(); // Asignar color aleatorio
  circleDiv.textContent = firstName.charAt(0).toUpperCase(); // Asignar la primera letra en mayúsculas
  return circleDiv;
}

function createUserRow(user) {
  const { first_name, last_name, email, avatar, company, job_title } = user;
  const userRow = document.createElement('tr');

  // Crear celda para el avatar o el div circular con la inicial
  const avatarCell = document.createElement('td');
  avatarCell.classList.add('avatar-cell');
  if (avatar) {
    const avatarImg = document.createElement('img');
    avatarImg.src = avatar;
    avatarImg.alt = `${first_name} ${last_name}`;
    avatarImg.classList.add('avatar-img'); // Clase CSS opcional para estilos
    avatarCell.appendChild(avatarImg);
  } else {
    const initialCircle = createInitialCircle(first_name);
    avatarCell.appendChild(initialCircle);
  }

  userRow.appendChild(avatarCell);
  userRow.appendChild(createTableCell(`${first_name} ${last_name}`, 'nameCell'));
  userRow.appendChild(createTableCell(email, 'emailCell'));
  userRow.appendChild(createTableCell(company || '', 'companyCell'));
  userRow.appendChild(createTableCell(job_title || '', 'jobCell'));

  return userRow;
}

// Función general para realizar peticiones
function makeRequest(url, options = {}, callback) {
  statusSpinner(true);
  const saveButton = document.getElementById('saveBtn');
  saveButton.disabled = true; // Deshabilitar el botón al iniciar la petición

  fetch(url, options)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json(); // Convierte la respuesta a JSON
    })
    .then(callback) // Ejecuta la función callback pasada
    .catch(handleError)
    .finally(() => {
      statusSpinner(false);
      saveButton.disabled = false; // Rehabilitar el botón después de completar la petición
    });
}

// Función para manejar la respuesta de la API y mostrar los usuarios en la tabla
function handleUserResponse(data) {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';

  data.data.forEach((user) => userList.appendChild(createUserRow(user)));

  const createContactBtn = document.createElement('button');
  createContactBtn.id = 'create-contact-btn';
  createContactBtn.textContent = 'Create Contact';
  createContactBtn.classList.add('create-contact-btn');
  userList.parentElement.appendChild(createContactBtn);

  createContactBtn.addEventListener('click', () => {
    const contactForm = document.querySelector('.contact-form');
    const saveButton = document.getElementById('saveBtn');

    // Mostrar el formulario
    contactForm.classList.remove('hide-form');

    // Deshabilitar el botón de Save inicialmente
    toggleButtonState(saveButton, true);

    // Ejecutar la validación para asegurar que el botón se mantenga deshabilitado
    validateForm();
  });
}

function handleError(error) {
  console.error('Error:', error);
  alert('An error occurred while fetching the data.');
}

// Función para manejar el envío del formulario de contacto
function toggleButtonState(button, isDisabled) {
  button.disabled = isDisabled;
  if (isDisabled) {
    button.classList.remove('btn-active');
  } else {
    button.classList.add('btn-active');
  }
}

// En la función submitContactForm, asegúrate de llamar a toggleButtonState
function submitContactForm(event) {
  event.preventDefault();

  const saveButton = document.getElementById('saveBtn');
  toggleButtonState(saveButton, true); // Deshabilitar el botón al enviar el formulario

  const first_name = document.getElementById('firstName').value;
  const last_name = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const company = document.getElementById('company').value;
  const job_title = document.getElementById('jobTitle').value;
  
  const formData = {
    first_name,
    last_name,
    company,
    job_title,
    email,
  };  

  makeRequest(
    link,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    },
    (data) => {
      console.log('Contact created:', data);
      document.getElementById('contact-form').reset();

      const newUser = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        company: formData.company,
        job_title: formData.job_title,
      };
      document.getElementById('user-list').appendChild(createUserRow(newUser));
      markRequiredFields();
      toggleButtonState(saveButton, false); // Habilitar el botón después de procesar la respuesta
    },
  );
}

document.getElementById('contact-form').addEventListener('submit', submitContactForm);

// Añadir asterisco (*) a los campos obligatorios
function markRequiredFields() {
  document.querySelectorAll('#contact-form [required]').forEach((input) => {
    const label = input.labels[0];
    if (label) {
      // Agregar clase para estilo inicial (rojo)
      label.classList.add('required');
    } else {
      // Si no hay valor, agregar la clase 'required'
      label.classList.add('required');
    }
  });
}

// Función para verificar si todos los campos requeridos están llenos
// Función para verificar si todos los campos requeridos están llenos y habilitar/deshabilitar el botón Save
function validateForm() {
  const form = document.getElementById('contact-form');
  const saveButton = document.getElementById('saveBtn');

  // Verifica si el formulario es válido
  const isValid = form.checkValidity();

  // Habilita o deshabilita el botón según la validez del formulario
  if (isValid) {
    saveButton.disabled = false;
    saveButton.classList.add('btn-active'); // Clase para indicar que el botón está activo
  } else {
    saveButton.disabled = true;
    saveButton.classList.remove('btn-active'); // Clase para indicar que el botón está inactivo
  }
}

// Añadir eventos de validación a los campos requeridos
document.querySelectorAll('#contact-form [required]').forEach((input) => {
  input.addEventListener('input', validateForm);
  input.addEventListener('change', validateForm);
});

// Ejecutar la validación inicial cuando la página cargue
validateForm();

// Cargar la lista de usuarios al cargar la página usando makeRequest
makeRequest(link, {}, handleUserResponse);
markRequiredFields(); // Marcar los campos
