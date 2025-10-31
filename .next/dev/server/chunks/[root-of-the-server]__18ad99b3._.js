module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/relatorios/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/lib/auth'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/lib/firebase-admin'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
;
async function GET(request) {
    try {
        const usuario = await verificarToken(request);
        if (!usuario) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                erro: 'Não autorizado'
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo') || 'vendas';
        const periodo = searchParams.get('periodo') || 'mes';
        const dataInicio = searchParams.get('dataInicio');
        const dataFim = searchParams.get('dataFim');
        let relatorio = {};
        // Calcular datas baseado no período
        const agora = new Date();
        let inicio, fim;
        if (dataInicio && dataFim) {
            inicio = new Date(dataInicio);
            fim = new Date(dataFim);
        } else {
            switch(periodo){
                case 'hoje':
                    inicio = new Date(agora.setHours(0, 0, 0, 0));
                    fim = new Date();
                    break;
                case 'semana':
                    inicio = new Date(agora.setDate(agora.getDate() - 7));
                    fim = new Date();
                    break;
                case 'mes':
                    inicio = new Date(agora.setMonth(agora.getMonth() - 1));
                    fim = new Date();
                    break;
                case 'trimestre':
                    inicio = new Date(agora.setMonth(agora.getMonth() - 3));
                    fim = new Date();
                    break;
                case 'ano':
                    inicio = new Date(agora.setFullYear(agora.getFullYear() - 1));
                    fim = new Date();
                    break;
                default:
                    inicio = new Date(agora.setMonth(agora.getMonth() - 1));
                    fim = new Date();
            }
        }
        if (tipo === 'vendas') {
            relatorio = await gerarRelatorioVendas(usuario.uid, inicio, fim);
        } else if (tipo === 'clientes') {
            relatorio = await gerarRelatorioClientes(usuario.uid, inicio, fim);
        } else if (tipo === 'leads') {
            relatorio = await gerarRelatorioLeads(usuario.uid, inicio, fim);
        } else if (tipo === 'completo') {
            relatorio = await gerarRelatorioCompleto(usuario.uid, inicio, fim);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sucesso: true,
            tipo,
            periodo,
            dataInicio: inicio.toISOString(),
            dataFim: fim.toISOString(),
            dados: relatorio
        });
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            erro: 'Erro ao gerar relatório'
        }, {
            status: 500
        });
    }
}
// Gerar relatório de vendas
async function gerarRelatorioVendas(userId, inicio, fim) {
    const vendasRef = db.collection('vendas');
    const snapshot = await vendasRef.where('userId', '==', userId).where('criadoEm', '>=', inicio).where('criadoEm', '<=', fim).get();
    let totalVendas = 0;
    let totalReceita = 0;
    let vendasPorStatus = {
        concluida: 0,
        pendente: 0,
        cancelada: 0
    };
    let vendasPorMes = {};
    let vendasPorFormaPagamento = {};
    snapshot.forEach((doc)=>{
        const venda = doc.data();
        totalVendas++;
        if (venda.status === 'concluida') {
            totalReceita += venda.valor || 0;
        }
        vendasPorStatus[venda.status] = (vendasPorStatus[venda.status] || 0) + 1;
        // Agrupar por mês
        const mes = new Date(venda.criadoEm.toDate()).toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        vendasPorMes[mes] = (vendasPorMes[mes] || 0) + 1;
        // Agrupar por forma de pagamento
        vendasPorFormaPagamento[venda.formaPagamento] = (vendasPorFormaPagamento[venda.formaPagamento] || 0) + 1;
    });
    return {
        totalVendas,
        totalReceita,
        ticketMedio: totalVendas > 0 ? totalReceita / totalVendas : 0,
        vendasPorStatus,
        vendasPorMes,
        vendasPorFormaPagamento
    };
}
// Gerar relatório de clientes
async function gerarRelatorioClientes(userId, inicio, fim) {
    const clientesRef = db.collection('clientes');
    const snapshot = await clientesRef.where('userId', '==', userId).where('criadoEm', '>=', inicio).where('criadoEm', '<=', fim).get();
    let totalClientes = 0;
    let clientesPorStatus = {
        ativo: 0,
        inativo: 0
    };
    let clientesPorMes = {};
    snapshot.forEach((doc)=>{
        const cliente = doc.data();
        totalClientes++;
        clientesPorStatus[cliente.status] = (clientesPorStatus[cliente.status] || 0) + 1;
        const mes = new Date(cliente.criadoEm.toDate()).toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        clientesPorMes[mes] = (clientesPorMes[mes] || 0) + 1;
    });
    return {
        totalClientes,
        clientesPorStatus,
        clientesPorMes,
        taxaAtivos: totalClientes > 0 ? (clientesPorStatus.ativo / totalClientes * 100).toFixed(2) : 0
    };
}
// Gerar relatório de leads
async function gerarRelatorioLeads(userId, inicio, fim) {
    const leadsRef = db.collection('leads');
    const snapshot = await leadsRef.where('userId', '==', userId).where('criadoEm', '>=', inicio).where('criadoEm', '<=', fim).get();
    let totalLeads = 0;
    let leadsPorStatus = {};
    let leadsPorOrigem = {};
    let leadsPorMes = {};
    snapshot.forEach((doc)=>{
        const lead = doc.data();
        totalLeads++;
        leadsPorStatus[lead.status] = (leadsPorStatus[lead.status] || 0) + 1;
        leadsPorOrigem[lead.origem] = (leadsPorOrigem[lead.origem] || 0) + 1;
        const mes = new Date(lead.criadoEm.toDate()).toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        leadsPorMes[mes] = (leadsPorMes[mes] || 0) + 1;
    });
    return {
        totalLeads,
        leadsPorStatus,
        leadsPorOrigem,
        leadsPorMes,
        taxaConversao: totalLeads > 0 ? ((leadsPorStatus.convertido || 0) / totalLeads * 100).toFixed(2) : 0
    };
}
// Gerar relatório completo
async function gerarRelatorioCompleto(userId, inicio, fim) {
    const [vendas, clientes, leads] = await Promise.all([
        gerarRelatorioVendas(userId, inicio, fim),
        gerarRelatorioClientes(userId, inicio, fim),
        gerarRelatorioLeads(userId, inicio, fim)
    ]);
    return {
        vendas,
        clientes,
        leads,
        resumo: {
            totalReceita: vendas.totalReceita,
            totalClientes: clientes.totalClientes,
            totalLeads: leads.totalLeads,
            totalVendas: vendas.totalVendas
        }
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__18ad99b3._.js.map