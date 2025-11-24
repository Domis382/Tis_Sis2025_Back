
// src/tests/auth/login.test.js
import request from 'supertest';
import app from '../../server.js';

describe('POST /api/auth/login', () => {
    
  test('Login Admin correcto retorna 200 + token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'juan.perez@sis.example',   
        password: 'juan.perez@sis.example',   
        role: 'Administrador'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
  });

/*

//2
test('Login Admin con contraseña incorrecta retorna 400 + mensaje de error', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'juan.perez@sis.example',      // mismo usuario válido
      password: 'clave_incorrecta',            // contraseña mala
      role: 'Administrador'
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.ok).toBe(false);
  expect(res.body.error).toBe('Credenciales inválidas');
});


test('Usuario no encontrado retorna 404 + mensaje de error', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'no.existe@correo.c',   // Asegúrate que NO exista en tu BD
      password: 'cualquiercosa',
      role: 'Administrador'
    });

  expect(res.statusCode).toBe(404);
  expect(res.body.ok).toBe(false);
  expect(res.body.error).toBe('Usuario no encontrado para ese rol');
});

/*
test('Campos faltantes retornan 400 + mensaje de campos requeridos', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({}); // body vacío

  expect(res.statusCode).toBe(400);
  expect(res.body.ok).toBe(false);
  expect(res.body.error).toBe('username, password y role son requeridos');
});

test('Rol no válido se maneja como usuario no encontrado (404)', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'juan.perez@sis.example',
      password: 'juan.perez@sis.example',
      role: 'SuperSaiyajin'
    });

  expect(res.statusCode).toBe(404);
  expect(res.body.ok).toBe(false);
  expect(res.body.error).toBe('Usuario no encontrado para ese rol');
});

*/

});
//juan.perez@sis.example