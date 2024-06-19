import { connect } from "../databases";
import jwt from "jsonwebtoken";

const claveSecreta = process.env.SECRET_KEY;

export const addMateria = async (req, res) => { //addMateria --> carga una nueva materia
  try {
    const connection = await connect();
    const {nombre} = req.body;

    const [result] = await connection.query("INSERT INTO materia (nombre_materia) VALUES (?)", [nombre]);

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Materia creada", success: true });
    } else {
      return res.status(500).json({ message: "Materia no creada", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const cursar = async (req, res) => { //cursar --> relaciona usuario con la materia
  try {
    const connection = await connect();
    const { dni, id_m } = req.body;

    //verificar si alumno y materia existen
    const [alumnoResult] = await connection.query("SELECT * FROM alumno WHERE dni = ?", [dni]);
    const [materiaResult] = await connection.query("SELECT * FROM materia WHERE id_m = ?", [id_m]);

    if (alumnoResult.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado", success: false });
    }

    if (materiaResult.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada", success: false });
    }

    //insertar la relacion en la tabla cursar
    const [result] = await connection.query("INSERT INTO cursar (dni, id_m) VALUES (?, ?)", [dni, id_m]);

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Relacion creada", success: true });
    } else {
      return res.status(500).json({ message: "No se creo la relacion", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getMateriaById = async (req, res) => { //getMateriaById --> devolver materias que cursa un alumno
  try {
    const connection = await connect();
    const { dni } = req.params;

    //verificar si el alumno existe
    const [alumnoResult] = await connection.query("SELECT * FROM alumno WHERE dni = ?", [dni]);
    if (alumnoResult.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado", success: false });
    }

    //obtener las materias que cursa el alumno
    const [result] = await connection.query(
      "SELECT m.id_m, m.nombre_materia FROM materia m INNER JOIN cursar c ON m.id_m = c.id_m WHERE c.dni = ?",
      [dni]
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//crear un token
const getToken = (payLoad) => {
  const token = jwt.sign(payLoad, claveSecreta, { expiresIn: "1m" });
  return token;
};

export const logIn = async (req, res) => {
  try {
    const { dni, password } = req.body;
    const connection = await connect();
    const q = "SELECT pass FROM alumno WHERE dni=?";
    const value = [dni];
    const [result] = await connection.query(q, value);

    if (result.length > 0) {
      if (result[0].pass === password) {
        const token = getToken({ dni: dni });
        return res.status(200).json({ message: "correcto", success: true, token: token });
      } else {
        return res.status(401).json({ message: "la contraseña no coincide", success: false });
      }
    } else {
      return res.status(400).json({ message: "el user no existe", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "fallo en el catch", error: error });
  }
};

const validate = async (campo, valor, tabla, cnn) => {
  const q = `SELECT * FROM ${tabla} WHERE ${campo}=? `;
  const value = [valor];
  const [result] = await cnn.query(q, value);
  return result.length === 1;
};

export const createUsers = async (req, res) => {
  try {
    const conexion = await connect();
    const { dni, nombre, password } = req.body;
    if (await validate("dni", dni, "alumno", conexion)) {
      console.log("OK");
    }
    const [result] = await conexion.query("INSERT INTO alumno (dni, nombre, pass) VALUES (?,?,?)", [dni, nombre, password]);
    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "usuario creado", success: true });
    } else {
      return res.status(500).json({ message: "no se creo el usuario", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const auth = (req, res, next) => {
  const tokenFront = req.headers['auth'];
  if (!tokenFront) return res.status(400).json({ message: "no hay token" });
  jwt.verify(tokenFront, claveSecreta, (error, payLoad) => {
    if (error) {
      return res.status(400).json({ message: "El token no es valido" });
    } else {
      req.payload = payLoad;
      next();
    }
  });
};

export const getMateriasByDni = (req, res) => {
  const dni = req.payload;
  const materias = [
    { id: 1, nombre: "SO2" },
    { id: 2, nombre: "ARQ2" },
    { id: 3, nombre: "Redes" },
    { id: 4, nombre: "Seguridad Infor." }
  ];
  return res.status(200).json(materias);
};
