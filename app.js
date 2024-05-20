const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const { appendToSheet, readSheet } = require("./utils")
const { chat } = require("./chatgpt")

const flowGPT = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, ctxFn) => {
        const gastos = await readSheet("Sheet1!A1:C10")
        const prompt = "Sos un asistente financiero que tiene acceso a mis gastos. Te voy a consultar sobre eso"
        const text = ctx.body + "\nMis gastos son: " + gastos
        const response = await chat(prompt, text)
        await ctxFn.flowDynamic(response)
    })

const flowHistory = addKeyword("Historial")
    .addAnswer("Este es el flujo historial", null,
        async (ctx, ctxFn) => {
            const response = await readSheet("Sheet1!A1:C10")
            console.log(response)
        }
    )

const flowPrincipal = addKeyword(["Gastos"])
    .addAnswer('Hola bienvenido el flujo')
    .addAnswer('Nombre del gasto', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ name: ctx.body })
        }
    )
    .addAnswer('Monto del gasto', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ amount: ctx.body })
        }
    )
    .addAnswer('Categoria del gasto', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ category: ctx.body })
        }
    )
    .addAnswer('Gracias. Tus datos fueron registrados', null,
        async (ctx, ctxFn) => {
            const name = ctxFn.state.get("name")
            const amount = ctxFn.state.get("amount")
            const category = ctxFn.state.get("category")
            await appendToSheet([[name, amount, category]])
        }
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowHistory, flowGPT])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
