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

    fetch(url, options)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json(); // Convierte la respuesta a JSON
        })
        .then(callback) // Ejecuta la función callback pasada
        .catch(handleError)
        .finally(() => statusSpinner(false));
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
        document.querySelector('.contact-form').classList.remove('hide-form');
    });
}

function handleError(error) {
    console.error('Error:', error);
    alert('An error occurred while fetching the data.');
}

// Función para manejar el envío del formulario de contacto
function submitContactForm(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const jobTitle = document.getElementById('jobTitle').value;

    const formData = {
        first_name: firstName,
        last_name: lastName,
        company: company,
        job_title: jobTitle,
        email: email,
    };

    // Realiza la petición POST para crear un nuevo contacto usando la función makeRequest
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
function validateForm() {
    const form = document.getElementById('contact-form');
    const requiredFields = form.querySelectorAll('[required]');
    let allFieldsFilled = true;

    requiredFields.forEach((field) => {
        if (field.value.trim() === '') {
            allFieldsFilled = false;
        }
    });

    // Habilitar o deshabilitar el botón Save basado en la validación
    document.getElementById('saveBtn').disabled = !allFieldsFilled;
}

// Añadir eventos de validación a los campos requeridos
document.querySelectorAll('#contact-form [required]').forEach((input) => {
    input.addEventListener('input', validateForm);
    input.addEventListener('change', validateForm);
});

// Ejecutar la validación inicial
validateForm();

// Cargar la lista de usuarios al cargar la página usando makeRequest
makeRequest(link, {}, handleUserResponse);
markRequiredFields(); // Marcar los campos
