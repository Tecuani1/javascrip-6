const link = "https://reqres.in/api/users?delay=4";

function fetchUsers() {
    const spinner = document.getElementById('spinner');
    const userList = document.getElementById('user-list');

    // Mostrar el spinner agregando la clase 'show-spinner'
    spinner.classList.remove('hide-spinner');
    spinner.classList.add('show-spinner');

    fetch(link)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            userList.innerHTML = ''; // Limpiar la tabla antes de llenarla

            // Crear y agregar la fila de encabezado
            const headerRow = document.createElement('tr');
            const idHeader = document.createElement('th');
            idHeader.textContent = 'Id';
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'Name';
            const emailHeader = document.createElement('th');
            emailHeader.textContent = 'Email';

            headerRow.appendChild(idHeader);
            headerRow.appendChild(nameHeader);
            headerRow.appendChild(emailHeader);
            userList.appendChild(headerRow);

            data.data.forEach(user => {
                // Crear una nueva fila para cada usuario
                const userRow = document.createElement('tr');

                // Crear la celda para el avatar
                const avatarCell = document.createElement('td');
                avatarCell.classList.add('avatarCell');
                const avatarImg = document.createElement('img');
                avatarImg.src = user.avatar;
                avatarImg.alt = `Avatar de ${user.first_name} ${user.last_name}`;
                avatarImg.classList.add('avatar');
                avatarCell.appendChild(avatarImg);

                // Crear la celda para el ID
                const idCell = document.createElement('td');
                idCell.classList.add('idCell');
                idCell.textContent = user.id;

                // Crear la celda para el nombre
                const nameCell = document.createElement('td');
                nameCell.textContent = `${user.first_name} ${user.last_name}`;

                // Crear la celda para el email
                const emailCell = document.createElement('td');
                emailCell.textContent = user.email;

                // Agregar las celdas a la fila
                userRow.appendChild(avatarCell);
                userRow.appendChild(idCell);
                userRow.appendChild(nameCell);
                userRow.appendChild(emailCell);

                // Agregar la fila a la tabla
                userList.appendChild(userRow);
            });

            // Ocultar el spinner después de cargar los datos
            spinner.classList.remove('show-spinner');
            spinner.classList.add('hide-spinner');
        })
        .catch(error => {
            console.error('Error:', error);
            // Ocultar el spinner en caso de error
            spinner.classList.remove('show-spinner');
            spinner.classList.add('hide-spinner');
        });
}

// Llamar a la función para obtener los usuarios al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});
