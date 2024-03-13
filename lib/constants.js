const TEXT = {
  QUESTION: {
    ACTION: "Que desea crear?",
    ENTITYNAME: "Ingrese el nombre de la entidad ",
    APINAME: "Ingrese el nombre del api ",
    FUNCTIONNAME: "Ingrese el nombre de la funcion ",
    ARGNAME: "Ingrese el nombre del argumento ",
    ARGTYPE: "Ingrese el tipo del argumento (Int, String, Boolean) ",
    METHOD: "Ingrese el método",
    MOREARG: "Desea ingresar otro argumento? (y/n) ",
  },
  SUCCESS: {
    ENTITY: "Entidad agregada correctamente",
    MIGRATE: "Migración finalizada correctamente",
  },
  ERROR: {
    MIGRATE: "Hubo un error con la migración",
    RETRY: "Intente otra vez la opción correcta",
    SAME_NAME: "Nombre ingresado repetido",
    RESERVED_NAME: "Nombre ingresado reservado",
  },
  SPINNER: {
    MIGRATEDB: "Se está generando migración...",
  },
  PIVOT: "//EXT",
  DISABLE: "Opción no disponible",
};

const FILES = {
  CHECKSUM: "CHECKSUM",
  EXT: ".main.wasp.ext",
  MAIN: "main.wasp",
  SERVERPATH: "./src/server",
  APIFILE: "./src/server/apis.js"
};

const CHOICES = {
  ACTIONS: ["auth", "crud", "middleware", "api"],
  ARGTYPES: ["Int", "String", "Boolean"],
  METHOD: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  YN: ["yes", "no"],
  YES: ["yes", "y", "si", "s"],
};

const WASP_COMMANDS = {
  MIGRATE: "wasp db migrate-dev --name 'add entity'",
};

module.exports = {
  TEXT,
  FILES,
  CHOICES,
  WASP_COMMANDS
}