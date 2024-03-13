#!/usr/bin/env zx
$.verbose = false; //DEBUG

// NPM General que controle WASP

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

let md5Old = "";
try {
  await spinner(() => $`test -f ${FILES.CHECKSUM}`);
  md5Old = (await $`head -n 1 ${FILES.CHECKSUM}`).stdout;
} catch {
  await spinner(() => $`touch ${FILES.CHECKSUM}`);
}

try {
  await spinner(() => $`test -f ${FILES.EXT}`);
} catch {
  await spinner(() => $`touch ${FILES.EXT}`);
}

const firstLine = await $`head -n 1 ${FILES.EXT}`;

firstLine.stdout === "" ? await $`echo ${TEXT.PIVOT} >> ${FILES.EXT}` : null;

let action = "";
do {
  action !== "" ? console.log(chalk.red(TEXT.ERROR.RETRY)) : null;
  action = await question(
    `${TEXT.QUESTION.ACTION} (${CHOICES.ACTIONS.toString()})\n> `,
    {
      choices: CHOICES.ACTIONS,
    }
  );
} while (!CHOICES.ACTIONS.includes(action));

switch (action) {
  case CHOICES.ACTIONS[0]: // AUTH
    console.log(chalk.yellow(TEXT.DISABLE));
    break;
  case CHOICES.ACTIONS[1]: // CRUD
    let entityName = "";
    let existsEntity = true;

    do {
      if (existsEntity && entityName !== "") {
        console.log(chalk.red(TEXT.ERROR.SAME_NAME));
      }
      entityName = (
        await question(`${TEXT.QUESTION.ENTITYNAME}\n> `)
      ).toLowerCase();
      const grep = await $`grep -E "entity ${
        entityName.charAt(0).toUpperCase() + entityName.slice(1)
      }" ${FILES.MAIN} -q && echo Y || echo N`;
      existsEntity = grep.stdout == "Y\n";
    } while (existsEntity);

    const args = [
      {
        name: "id",
        type: "String",
      },
      {
        name: "name",
        type: "String",
      },
    ];
    // let flagMoreArg = true;
    // do {
    //   const argName = await question(`${TEXT.QUESTION.ARGNAME}\n> `);
    //   if (argName === "id") {
    //     console.log(chalk.red(TEXT.ERROR.RESERVED_NAME));
    //     continue;
    //   }
    //   let argType = "";
    //   do {
    //     argType !== "" ? console.log(chalk.red(TEXT.ERROR.RETRY)) : null;
    //     argType = await question(`${TEXT.QUESTION.ARGTYPE}\n> `, {
    //       choices: CHOICES.ARGTYPES,
    //     });
    //   } while (!CHOICES.ARGTYPES.includes(argType));

    //   args.push({
    //     name: argName,
    //     type: argType,
    //   });

    //   const flag = await question(`${TEXT.QUESTION.MOREARG}\n> `, {
    //     choices: CHOICES.YN,
    //   });
    //   flagMoreArg = CHOICES.YES.includes(flag.toLowerCase());
    // } while (flagMoreArg);

    //create entity
    let entityText = `entity ${
      entityName.charAt(0).toUpperCase() + entityName.slice(1)
    } {=psl\n`;
    entityText += `\tid\t\t\tInt\t\t@id @default(autoincrement())\n`;
    for (let index = 0; index < args.length; index++) {
      const element = args[index];
      entityText += `\t${element.name}\t\t\t${element.type}\n`;
    }
    entityText += `psl=}\n`;
    await $`echo ${entityText} >> ${FILES.EXT}`;

    const apiFile = `${entityName}s.js`;

    //create CRUD
    let crudText = `crud ${
      entityName.charAt(0).toUpperCase() + entityName.slice(1)
    }s {\n`;
    crudText += `\tentity: ${
      entityName.charAt(0).toUpperCase() + entityName.slice(1)
    },\n`;
    crudText += `\toperations: {\n`;
    crudText += `\t\tget: {\n`;
    crudText += `\t\t},\n`;
    crudText += `\t\tgetAll: {\n`;
    crudText += `\t\t},\n`;
    crudText += `\t\tcreate: {\n`;
    crudText += `\t\t},\n`;
    crudText += `\t\tupdate: {\n`;
    crudText += `\t\t},\n`;
    crudText += `\t\tdelete: {\n`;
    crudText += `\t\t},\n`;
    crudText += `\t},\n`;
    crudText += `}\n`;
    await $`echo ${crudText} >> ${FILES.EXT}`;

    const md5New = await $`md5 ${FILES.EXT}`;

    if (md5Old !== md5New) {
      await $`echo "\n" >> ${FILES.MAIN}`;

      try {
        const line = (
          await $`grep -n ${TEXT.PIVOT} ${FILES.MAIN} | cut -d ":" -f1`
        ).stdout;
        await $`head -n ${parseInt(line) - 1} ${FILES.MAIN} > temp_file`;
        await $`cat ${FILES.EXT} >> temp_file`;
        await $`cat temp_file > ${FILES.MAIN}`;
        await $`rm temp_file`;
      } catch (error) {
        await $`cat ${FILES.EXT} >> ${FILES.MAIN}`;
      }
      console.log(chalk.green(TEXT.SUCCESS.ENTITY));
      try {
        await spinner(
          TEXT.SPINNER.MIGRATEDB,
          () => $`${WASP_COMMANDS.MIGRATE}`
        );
        console.log(chalk.green(TEXT.SUCCESS.MIGRATE));
      } catch (error) {
        console.log(chalk.red(TEXT.ERROR.MIGRATE));
        console.log(`Run ${WASP_COMMANDS.MIGRATE} manually`);
      }

      await $`echo ${md5New} > ${FILES.CHECKSUM}`;
    }

    break;
  case CHOICES.ACTIONS[2]: // MIDDLEWARE
    console.log(chalk.yellow(TEXT.DISABLE));
    break;
  case CHOICES.ACTIONS[3]: // API
    let apiName = "";
    let existsApi = true;

    do {
      if (existsApi && apiName !== "") {
        console.log(chalk.red(TEXT.ERROR.SAME_NAME));
      }
      apiName = await question(`${TEXT.QUESTION.APINAME}\n> `);
      const grep =
        await $`grep -E "api ${apiName}" ${FILES.MAIN} -q && echo Y || echo N`;
      existsApi = grep.stdout == "Y\n";
    } while (existsApi);

    let functionName = "";
    let existsFunction = true;
    do {
      if (existsFunction && functionName !== "") {
        console.log(chalk.red(TEXT.ERROR.SAME_NAME));
      }
      functionName = await question(`${TEXT.QUESTION.FUNCTIONNAME}\n> `);
      const grep =
        await $`grep -E "export const ${functionName}" ${FILES.SERVERPATH}/api.js -q && echo Y || echo N`;
      existsFunction = grep.stdout == "Y\n";
    } while (existsFunction);

    let method = "";
    do {
      method !== "" ? console.log(chalk.red(TEXT.ERROR.RETRY)) : null;
      method = await question(`${TEXT.QUESTION.METHOD} (${CHOICES.METHOD.toString()})\n> `, {
        choices: CHOICES.METHOD,
      });
    } while (!CHOICES.METHOD.includes(method));

    let apiText = `\napi ${apiName} {\n`;
    apiText += `\tfn: import { ${functionName} } from "@server/apis.js",\n`;
    apiText += `\thttpRoute: (${method}, "/api/${apiName.replace(/ /g, "")}"),\n`;
    apiText += `}\n`;
    await $`echo ${apiText} >> ${FILES.MAIN}`;

    let apiTextInFile = `\nexport const ${functionName} = (_req, res, context) => {\n`;
    apiTextInFile += `\tconst data = {};\n`;
    apiTextInFile += `\t\n`;
    apiTextInFile += `\tres.json(data);\n`;
    apiTextInFile += `}`;
    await $`echo ${apiTextInFile} >> ${FILES.APIFILE}`;

    break;

  default:
    break;
}
