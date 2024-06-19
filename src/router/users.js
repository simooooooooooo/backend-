import { Router } from "express";
import { auth, createUsers, getMateriasByDni, logIn, addMateria, cursar, getMateriaById } from "../controller/users";


const routerUsers = Router();

// Endpoint para loguear usuario
/**
 * @swagger
 * /user/login:
 *  post:
 *      summary: Loguear usuario
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /user/usersp:
 *  post:
 *      summary: Crea usuarios
 */
routerUsers.post("/user/usersp", createUsers);

/**
 * @swagger
 * /user/getMaterias:
 *  get:
 *      summary: Devuelve las materias de un usuario determinado
 */
routerUsers.get("/user/getMaterias", auth, getMateriasByDni);

/**
 * @swagger
 * /user/addMateria:
 *  post:
 *      summary: Cargar una nueva materia
 */
routerUsers.post("/user/addMateria", addMateria);

/**
 * @swagger
 * /user/cursar:
 *  post:
 *      summary: Relacionar un usuario con una materia
 */
routerUsers.post("/user/cursar", cursar);

/**
 * @swagger
 * /user/getMateriaById/{dni}:
 *  get:
 *      summary: Devolver las materias que cursa un alumno determinado
 *      parameters:
 *        - in: path
 *          name: dni
 *          schema:
 *            type: string
 *          required: true
 *          description: DNI del alumno
 */
routerUsers.get("/user/getMateriaById/:dni", getMateriaById);

export default routerUsers;
