const link = 'https://reqres.in/api/users?delay=4';
const postLink = 'https://reqres.in/api/users';

// Función para mostrar u ocultar el spinner de carga
function statusSpinner(isVisible) {
  const spinner = document.getElementById('spinner');
  if (isVisible) {
    spinner.classList.remove('hide-spinner'); // Muestra el spinner
    spinner.classList.add('show-spinner');
  } else {
    spinner.classList.remove('show-spinner'); // Oculta el spinner
    spinner.classList.add('hide-spinner');
  }
}

// Función para crear una celda de tabla con contenido y una clase opcional
function createTableCell(content, className) {
  const cell = document.createElement('td');
  if (className) cell.classList.add(className); // Añade una clase si se proporciona
  cell.textContent = content; // Establece el contenido de la celda
  return cell;
}

// Función para crear una fila de la tabla de usuarios a partir de los datos de un usuario
function createUserRow(user) {
  const { id, first_name, last_name, email, avatar, company, job_title } = user; // Desestructuración del objeto usuario
  const userRow = document.createElement('tr');

  // Crear celda para el avatar
  const avatarCell = document.createElement('td');
  const avatarImg = document.createElement('img');
  avatarImg.src = avatar || 'default-avatar.png'; // Usa un avatar por defecto si no hay uno
  avatarImg.alt = `${first_name} ${last_name}`;
  avatarImg.classList.add('avatar-img'); // Clase para estilos del avatar
  avatarCell.appendChild(avatarImg);
  userRow.appendChild(avatarCell); // Añade la celda del avatar a la fila

  // Crear celda para el ID
  userRow.appendChild(createTableCell(id, 'idCell')); // Celda para el ID

  // Crear celda para el nombre completo
  userRow.appendChild(createTableCell(`${first_name} ${last_name}`, 'nameCell')); // Celda para el nombre completo

  // Crear celda para el correo electrónico
  userRow.appendChild(createTableCell(email, 'emailCell')); // Celda para el email

  // Crear celda para el puesto y empresa, vacías si no existen
  userRow.appendChild(createTableCell(company || '', 'CompanyCell')); // Celda para empresa, vacía si no hay valor
  userRow.appendChild(createTableCell(job_title || '', 'JobCell')); // Celda para el puesto, vacía si no hay valor

  return userRow; // Retorna la fila completa
}

// Función para manejar la respuesta de la API y mostrar los usuarios en la tabla
function handleUserResponse(data) {
  const userList = document.getElementById('user-list');
  userList.innerHTML = ''; // Limpia el contenido existente en la lista de usuarios

  // Crear fila de encabezado de la tabla
  const headerRow = document.createElement('tr');
  ['', 'ID', 'Name', 'Email', 'Company', 'Job Title'].forEach((text) => {
    const headerCell = document.createElement('th');
    headerCell.textContent = text; // Asigna el texto del encabezado
    headerRow.appendChild(headerCell); // Añade la celda de encabezado a la fila
  });
  userList.appendChild(headerRow); // Añade la fila de encabezado a la tabla

  // Crear y añadir filas de usuarios
  data.data.forEach((user) => userList.appendChild(createUserRow(user)));

  // Crear y agregar el botón "Create Contact" después de la tabla
  const createContactBtn = document.createElement('button');
  createContactBtn.id = 'create-contact-btn';
  createContactBtn.textContent = 'Create Contact'; // Texto del botón
  createContactBtn.classList.add('create-contact-btn'); // Añade clase para estilos
  userList.parentElement.appendChild(createContactBtn); // Añade el botón después de la tabla

  // Event listener para mostrar el formulario al hacer clic en el botón
  createContactBtn.addEventListener('click', () => {
    document.querySelector('.contact-form').classList.remove('hide-form'); // Muestra el formulario de contacto
  });
}

// Función para manejar errores en la petición
function handleError(error) {
  console.error('Error:', error);
  alert(
    error.message === 'Fetch aborted due to timeout'
      ? 'Request timed out. Please try again.' // Mensaje de error si la petición fue abortada por timeout
      : 'An error occurred while fetching the data.', // Mensaje de error general
  );
}

// Función para obtener la lista de usuarios desde la API
function fetchUsers() {
  statusSpinner(true); // Muestra el spinner de carga

  const controller = new AbortController(); // Controlador para abortar la petición
  const signal = controller.signal;

  setTimeout(() => controller.abort(), 5000); // Aborta la petición después de 5 segundos si tarda demasiado

  fetch(link, { signal })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`); // Lanza un error si la respuesta no es exitosa
      }
      return res.json(); // Convierte la respuesta a JSON
    })
    .then(handleUserResponse) // Maneja la respuesta y muestra los usuarios
    .catch(handleError) // Maneja errores en la petición
    .finally(() => statusSpinner(false)); // Oculta el spinner de carga
}

// Función para obtener el próximo ID en la secuencia
function getNextId() {
  const userList = document.getElementById('user-list');
  const rows = userList.querySelectorAll('tr');
  let maxId = 0;

  rows.forEach((row) => {
    const idCell = row.querySelector('.idCell');
    if (idCell) {
      const id = parseInt(idCell.textContent, 10);
      if (id > maxId) {
        maxId = id;
      }
    }
  });

  return maxId + 1; // Retorna el próximo ID en la secuencia
}

// Función para manejar el envío del formulario de contacto
function submitContactForm(event) {
  event.preventDefault(); // Prevenir la acción por defecto del formulario (enviar)

  // Mostrar el spinner mientras se envía el formulario
  statusSpinner(true);

  // Obtener los valores de los campos del formulario
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const company = document.getElementById('company').value;
  const jobTitle = document.getElementById('jobTitle').value;

  // Validar que los campos requeridos no estén vacíos
  if (!firstName || !lastName || !email) {
    alert('Please fill out all required fields.'); // Muestra alerta si faltan campos
    statusSpinner(false); // Oculta el spinner si hay error en el formulario
    return;
  }

  // Crear el objeto JSON con los datos del formulario
  const formData = {
    first_name: firstName,
    last_name: lastName,
    company: company,
    job_title: jobTitle,
    email: email,
  };

  // Realiza la petición POST para crear un nuevo contacto
  fetch(postLink, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Indica que el cuerpo de la petición es JSON
    },
    body: JSON.stringify(formData), // Convierte los datos del formulario a JSON
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Lanza un error si la respuesta no es exitosa
      }
      return response.json(); // Convierte la respuesta a JSON
    })
    .then((data) => {
      console.log('Contact created:', data); // Imprime la respuesta en la consola
      alert('Contact created successfully!'); // Muestra una alerta de éxito
      document.getElementById('contact-form').reset(); // Limpia el formulario después del envío

      // Agregar el nuevo contacto a la tabla
      const newUser = {
        id: getNextId(), // Obtener el siguiente ID secuencial
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        company: formData.company,
        job_title: formData.job_title,
        avatar: data.avatar || 'default-avatar.png', // Usa un avatar por defecto si no hay uno
      };
      document.getElementById('user-list').appendChild(createUserRow(newUser));
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while creating the contact.'); // Muestra alerta si ocurre un error
    })
    .finally(() => statusSpinner(false)); // Oculta el spinner de carga al finalizar
}

// Event listener para el formulario de contacto
document.getElementById('contact-form').addEventListener('submit', submitContactForm);

// Cargar la lista de usuarios al cargar la página
fetchUsers();
