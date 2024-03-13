const conf = new (require("conf"))();
const chalk = require("chalk");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const rl = readline.createInterface({ input, output });
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const { TEXT, CHOICES, FILES } = require("../lib/constants");

const add = async (obj) => {
  let md5Old = "";
  try {
    await exec(`test -f ${FILES.CHECKSUM}`);
    const { stdout } = await exec(`head -n 1 ${FILES.CHECKSUM}`);
    md5Old = stdout;
  } catch {
    await exec(`touch ${FILES.CHECKSUM}`);
  }

  try {
    await exec(`test -f ${FILES.EXT}`);
  } catch {
    await exec(`touch ${FILES.EXT}`);
  }

  const { stdout } = await exec(`head -n 1 ${FILES.EXT}`);

  stdout === "" ? await exec(`echo ${TEXT.PIVOT} >> ${FILES.EXT}`) : null;

  let action = "";
  do {
    action !== "" ? console.log(chalk.red(TEXT.ERROR.RETRY)) : null;

    action = await rl.question(
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
          await rl.question(`${TEXT.QUESTION.ENTITYNAME}\n> `)
        ).toLowerCase();
        const grep = await exec(`grep -E "entity ${
          entityName.charAt(0).toUpperCase() + entityName.slice(1)
        }" ${FILES.MAIN} -q && echo Y || echo N`);
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
      await exec(`echo ${entityText} >> ${FILES.EXT}`);

      const apiFile = `${entityName}s.js`;

      //create CRUD
      let crudText = `crud ${
        entityName.charAt(0).toUpperCase() + entityName.slice(1)
      }s {\n`;
      crudText += `\tentity: ${
        entityName.charAt(0).toUpperCase() + entityName.slice(1)
      },\n`;
      crudText += `\toperations: {\n`;
      crudText += `\t\tget: {},\n`;
      crudText += `\t\tgetAll: {},\n`;
      crudText += `\t\tcreate: {},\n`;
      crudText += `\t\tupdate: {},\n`;
      crudText += `\t\tdelete: {}\n`;
      crudText += `\t},\n`;
      crudText += `}\n`;
      await exec(`echo ${crudText} >> ${FILES.EXT}`);

      const md5New = await exec(`md5 ${FILES.EXT}`);

      if (md5Old !== md5New) {
        await exec(`echo "\n" >> ${FILES.MAIN}`);

        try {
          const { stdout: line } = await exec(`grep -n ${TEXT.PIVOT} ${FILES.MAIN} | cut -d ":" -f1`)
          await exec(`head -n ${parseInt(line) - 1} ${FILES.MAIN} > temp_file`);
          await exec(`cat ${FILES.EXT} >> temp_file`);
          await exec(`cat temp_file > ${FILES.MAIN}`);
          await exec(`rm temp_file`);
        } catch (error) {
          await exec(`cat ${FILES.EXT} >> ${FILES.MAIN}`);
        }
        console.log(chalk.green(TEXT.SUCCESS.ENTITY));
        try {
          await exec(`${WASP_COMMANDS.MIGRATE}`);
          console.log(chalk.green(TEXT.SUCCESS.MIGRATE));
        } catch (error) {
          console.log(chalk.red(TEXT.ERROR.MIGRATE));
          console.log(`Run ${WASP_COMMANDS.MIGRATE} manually`);
        }

        await exec(`echo ${md5New} > ${FILES.CHECKSUM}`);
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
        apiName = await rl.question(`${TEXT.QUESTION.APINAME}\n> `);
        const { stdout: grep } =
          await exec(`grep -E "api ${apiName}" ${FILES.MAIN} -q && echo Y || echo N`);
        existsApi = grep == "Y\n";
      } while (existsApi);

      let functionName = "";
      let existsFunction = true;
      do {
        if (existsFunction && functionName !== "") {
          console.log(chalk.red(TEXT.ERROR.SAME_NAME));
        }
        functionName = await rl.question(`${TEXT.QUESTION.FUNCTIONNAME}\n> `);
        const { stdout: grep } =
          await exec(`grep -E "export const ${functionName}" ${FILES.SERVERPATH}/api.js -q && echo Y || echo N`);
        existsFunction = grep == "Y\n";
      } while (existsFunction);

      let method = "";
      do {
        method !== "" ? console.log(chalk.red(TEXT.ERROR.RETRY)) : null;
        method = await rl.question(
          `${TEXT.QUESTION.METHOD} (${CHOICES.METHOD.toString()})\n> `,
          {
            choices: CHOICES.METHOD,
          }
        );
      } while (!CHOICES.METHOD.includes(method));

      let apiText = `\napi ${apiName} {\n`;
      apiText += `\tfn: import { ${functionName} } from "@server/apis.js",\n`;
      apiText += `\thttpRoute: (${method}, "/api/${apiName.replace(
        / /g,
        ""
      )}"),\n`;
      apiText += `}\n`;
      await exec(`echo ${apiText} >> ${FILES.MAIN}`);

      let apiTextInFile = `\nexport const ${functionName} = (_req, res, context) => {\n`;
      apiTextInFile += `\tconst data = {};\n`;
      apiTextInFile += `\t\n`;
      apiTextInFile += `\tres.json(data);\n`;
      apiTextInFile += `}`;
      await exec(`echo ${apiTextInFile} >> ${FILES.APIFILE}`);

      break;

    default:
      break;
  }

  console.log(chalk.green.bold("successfully!"));
};

module.exports = add;
