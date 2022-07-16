import fs from "fs";
import readline from "readline";

var estados = null;
var cidades = null;
var capitais = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function init() {
    try {
        if (!fs.existsSync('./regioes')) {
            fs.mkdirSync('./regioes');
        }
        estados = JSON.parse(await fs.promises.readFile("./database/Estados.json"));
        cidades = JSON.parse(await fs.promises.readFile("./database/Cidades.json"));
        capitais = JSON.parse(await fs.promises.readFile("./database/Capitais.json"));

        estados.forEach(estado => {
            let estadoAtual = [];
            let regiaoAtual = null;
            capitais.forEach(capital => {
                if (estado.Nome == capital.Estado) {
                    regiaoAtual = capital.Regiao
                }
            })
            cidades.forEach(cidade => {
                if (cidade.Estado == estado.ID) {
                    estadoAtual.push(cidade)
                }
            });

            estado.cidades = estadoAtual;
            if (!fs.existsSync(`./regioes/${regiaoAtual}/`)) {
                fs.mkdirSync(`./regioes/${regiaoAtual}/`);
            }
            fs.promises.writeFile(`./regioes/${regiaoAtual}/${estado.Sigla}.json`, JSON.stringify(estado));
        });

    } catch (error) {
        console.log(error)
    }
}

init()
pergunta();


function pergunta() {
    rl.question("Voce deseja:\n" +
        "1- Saber a quantidade de cidades de um estado?\n" +
        "2- Estados com maior quantidade de cidades em ordem crescente\n" +
        "3- Saber a capital de um estado\n" +
        "*Responda apenas com um número\n" +
        "Sua resposta: ", numero => {
            let resp = parseInt(numero)
            switch (resp) {
                case 1:
                    rl.question(
                        "Digite o UF do estado desejado: (Ex: MG, RJ, etc) ",
                        uf => {
                            let resp = uf
                            let permitidosUF = []
                            estados.forEach(estado => {
                                permitidosUF.push(estado.Sigla)
                            });
                            if (permitidosUF.includes(resp)) {
                                estados.forEach(estado => {
                                    if (resp == estado.Sigla) {
                                        let quantasCidades = estado.cidades
                                        console.log(`${estado.Nome} tem ${quantasCidades.length} cidades.`)
                                        rl.close();
                                    }
                                });
                            } else {
                                console.log('UF inexistente!')
                                rl.close();
                            }
                        }
                    )
                    break;

                case 2:
                    let arrayOrganizado = []
                    estados.forEach(estado => {
                        arrayOrganizado.push({
                            "Nome": estado.Nome,
                            "qttdCidades": estado.cidades.length
                        })
                    })
                    let ordenadoPorQttdCidades = arrayOrganizado.sort(function (a, b) {
                        return a.qttdCidades - b.qttdCidades;
                    })
                    let topCincoEstadosComMaisCidades = ordenadoPorQttdCidades.slice(-5).reverse()
                    let mensagemFinal = "Top 5 estados com mais cidades:";
                    let index = 1;
                    topCincoEstadosComMaisCidades.forEach(element => {
                        mensagemFinal += `\n${index++}° ${element.Nome} - ${element.qttdCidades} cidades`
                    })
                    console.log(mensagemFinal)
                    rl.close();
                    break;

                case 3:
                    rl.question("Insira a Sigla(UF) do estado desejado: ",
                        resp => {
                            let permitidosUF = []
                            estados.forEach(estado => {
                                permitidosUF.push(estado.Sigla)
                            });
                            if (permitidosUF.includes(resp)) {
                                let mensagemFinal = "";
                                capitais.forEach(capital => {
                                    if (capital.Sigla == resp) {
                                        mensagemFinal = `A capital do estado ${capital.Estado} é ${capital.Capital}`
                                        console.log(mensagemFinal);
                                        rl.close();
                                    }
                                });
                            } else {
                                console.log("UF Inexistente")
                                rl.close();
                            }
                        })
                    break;
                default:
                    console.log('Resposta errada!');
                    rl.close();
                    break;
            }
        });
}