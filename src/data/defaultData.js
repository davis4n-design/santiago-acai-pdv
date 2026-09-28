// Bairros reais e taxas padrão de Caçapava (SP)
export const DEFAULT_BAIRROS = [
  { nome: 'Bairro do Grama', taxa: 9.0 },
  { nome: 'Bairro do Tijuco', taxa: 8.0 },
  { nome: 'Borda da Mata', taxa: 5.0 },
  { nome: 'Caçapava Velha', taxa: 8.0 },
  { nome: 'Centro', taxa: 5.0 },
  { nome: 'Chácaras Santa Rita', taxa: 10.0 },
  { nome: 'Condomínio Aldeias da Serra', taxa: 8.0 },
  { nome: 'Condomínio Reserva do Vale', taxa: 9.0 },
  { nome: 'Condomínio Terras do Vale', taxa: 9.0 },
  { nome: 'Jardim Amália', taxa: 5.0 },
  { nome: 'Jardim Caçapava', taxa: 4.0 },
  { nome: 'Jardim Campo Grande', taxa: 5.0 },
  { nome: 'Jardim Eldorado', taxa: 6.0 },
  { nome: 'Jardim Jequitibá', taxa: 7.0 },
  { nome: 'Jardim Julieta', taxa: 6.0 },
  { nome: 'Jardim Maria Cândida', taxa: 5.0 },
  { nome: 'Jardim Panorama', taxa: 5.0 },
  { nome: 'Jardim Primavera', taxa: 6.0 },
  { nome: 'Jardim Rafael', taxa: 6.0 },
  { nome: 'Jardim São José', taxa: 5.0 },
  { nome: 'Paiol Grande', taxa: 14.0 },
  { nome: 'Parque do Museu', taxa: 6.0 },
  { nome: 'Parque Residencial Alvorada', taxa: 6.0 },
  { nome: 'Parque Residencial Maria Elmira', taxa: 5.0 },
  { nome: 'Parque Residencial Nova Caçapava', taxa: 6.0 },
  { nome: 'Parque Residencial Santo André', taxa: 6.0 },
  { nome: 'Pinus do Iriguassu', taxa: 8.0 },
  { nome: 'Residencial Esperança', taxa: 6.0 },
  { nome: 'Santa Luzia da Boa Vista', taxa: 10.0 },
  { nome: 'Sapé', taxa: 8.0 },
  { nome: 'Vera Cruz', taxa: 7.0 },
  { nome: 'Vila Antônio Augusto', taxa: 4.0 },
  { nome: 'Vila Bandeirantes', taxa: 4.0 },
  { nome: 'Vila Brasil', taxa: 4.0 },
  { nome: 'Vila Centenário', taxa: 4.0 },
  { nome: 'Vila Galvão', taxa: 5.0 },
  { nome: 'Vila Independência', taxa: 5.0 },
  { nome: 'Vila Menino Jesus', taxa: 7.0 },
  { nome: 'Vila Pantaleão', taxa: 5.0 },
  { nome: 'Vila Paraíba', taxa: 4.0 },
  { nome: 'Vila Resende', taxa: 5.0 },
  { nome: 'Vila Santa Isabel', taxa: 5.0 },
  { nome: 'Vila Santos', taxa: 5.0 },
  { nome: 'Vila São João', taxa: 5.0 },
  { nome: 'Vila Velha', taxa: 6.0 },
  { nome: 'Village das Flores', taxa: 7.0 }
];

export const EXPENSE_CATEGORIES = [
  { id: 'frios', label: 'Frios / Fatinha', cor: '#3b82f6', icon: 'Beef' },
  { id: 'hortifruti', label: 'Hortifrúti', cor: '#10b981', icon: 'Apple' },
  { id: 'paes', label: 'Pães', cor: '#f59e0b', icon: 'Wheat' },
  { id: 'gas', label: 'Gás', cor: '#ef4444', icon: 'Flame' },
  { id: 'outros', label: 'Outros', cor: '#8b5cf6', icon: 'ShoppingBag' }
];

export const PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX', short: 'PIX', icon: 'QrCode', cor: 'emerald' },
  { id: 'CREDITO', label: 'Cartão Crédito', short: 'Crédito', icon: 'CreditCard', cor: 'blue' },
  { id: 'DEBITO', label: 'Cartão Débito', short: 'Débito', icon: 'CreditCard', cor: 'indigo' },
  { id: 'DINHEIRO', label: 'Dinheiro', short: 'Dinheiro', icon: 'Banknote', cor: 'amber' },
  { id: 'A REC', label: 'A Receber / Fiado', short: 'Fiado', icon: 'ClockAlert', cor: 'amber' },
  { id: 'ON', label: 'Pago Online (iFood/99)', short: 'Online', icon: 'Smartphone', cor: 'purple' }
];

export const CHANNELS = [
  { id: 'ZAP', label: 'WhatsApp', short: 'WhatsApp', color: '#22c55e', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
  { id: 'IFOOD', label: 'iFood', short: 'iFood', color: '#ea1d2c', bg: 'bg-red-500/15 border-red-500/40 text-red-400' },
  { id: '99F', label: '99Food', short: '99Food', color: '#f97316', bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400' },
  { id: 'Balcão', label: 'Balcão', short: 'Balcão', color: '#38bdf8', bg: 'bg-sky-500/15 border-sky-500/40 text-sky-400' }
];

export const INITIAL_FIADOS = [
  { id: 'f-1', cliente: 'ADRIANO', saldo: 399.40, telefone: '12991000001', dataAtualizacao: new Date().toISOString() },
  { id: 'f-2', cliente: 'FELIPE', saldo: 682.97, telefone: '12991000002', dataAtualizacao: new Date().toISOString() },
  { id: 'f-3', cliente: 'HUDSON', saldo: 285.79, telefone: '12991000003', dataAtualizacao: new Date().toISOString() },
  { id: 'f-4', cliente: 'TIO NALDO', saldo: 179.60, telefone: '12991000004', dataAtualizacao: new Date().toISOString() },
  { id: 'f-5', cliente: 'ANA RITA', saldo: 219.87, telefone: '12991000005', dataAtualizacao: new Date().toISOString() },
  { id: 'f-6', cliente: 'SERGIO', saldo: 146.00, telefone: '', dataAtualizacao: new Date().toISOString() },
  { id: 'f-7', cliente: 'VITORIA', saldo: 101.90, telefone: '', dataAtualizacao: new Date().toISOString() },
  { id: 'f-8', cliente: 'RAFA', saldo: 74.90, telefone: '', dataAtualizacao: new Date().toISOString() },
  { id: 'f-9', cliente: 'LUIS', saldo: 34.00, telefone: '', dataAtualizacao: new Date().toISOString() }
];

const now = new Date();
const todayISO = now.toISOString().split('T')[0];

export const INITIAL_PEDIDOS = [
  {
    id: 'PED-101',
    tipo: 'Delivery',
    canal: 'ZAP',
    bairro: 'VP',
    taxa_entrega: 4.0,
    valor_itens: 48.0,
    valor_total: 52.0,
    forma_pagto: 'PIX',
    obs_pagto: '2x X-Salada especial + Coca',
    data: `${todayISO}T10:15:00.000Z`,
    synced: true
  },
  {
    id: 'PED-102',
    tipo: 'Delivery',
    canal: 'IFOOD',
    bairro: 'VAA',
    taxa_entrega: 4.0,
    valor_itens: 68.5,
    valor_total: 72.5,
    forma_pagto: 'ON',
    obs_pagto: 'Pedido #4892 iFood',
    data: `${todayISO}T10:42:00.000Z`,
    synced: true
  },
  {
    id: 'PED-103',
    tipo: 'Balcão',
    canal: 'Balcão',
    bairro: 'Balcão',
    taxa_entrega: 0,
    valor_itens: 32.0,
    valor_total: 32.0,
    forma_pagto: 'DEBITO',
    obs_pagto: '1x X-Tudo + Guaraná Lata',
    data: `${todayISO}T11:05:00.000Z`,
    synced: true
  },
  {
    id: 'PED-104',
    tipo: 'Delivery',
    canal: '99F',
    bairro: 'PINUS',
    taxa_entrega: 8.0,
    valor_itens: 55.0,
    valor_total: 63.0,
    forma_pagto: 'CREDITO',
    obs_pagto: 'Troco p/ 100 na maquininha',
    data: `${todayISO}T11:28:00.000Z`,
    synced: true
  },
  {
    id: 'PED-105',
    tipo: 'Balcão',
    canal: 'Balcão',
    bairro: 'Balcão',
    taxa_entrega: 0,
    valor_itens: 79.9,
    valor_total: 79.9,
    forma_pagto: 'A REC',
    obs_pagto: 'Cliente: ADRIANO (anotado no caderno)',
    data: `${todayISO}T11:55:00.000Z`,
    synced: true
  },
  {
    id: 'PED-106',
    tipo: 'Delivery',
    canal: 'ZAP',
    bairro: 'ME',
    taxa_entrega: 5.0,
    valor_itens: 42.0,
    valor_total: 47.0,
    forma_pagto: 'DINHEIRO',
    obs_pagto: 'Levar troco para R$ 50',
    data: `${todayISO}T12:10:00.000Z`,
    synced: true
  }
];

export const INITIAL_DESPESAS = [
  {
    id: 'DESP-1',
    categoria: 'Pães',
    valor: 46.40,
    obs: 'Padaria Central - Pães de Hambúrguer',
    data: `${todayISO}T09:00:00.000Z`,
    synced: true
  },
  {
    id: 'DESP-2',
    categoria: 'Hortifrúti',
    valor: 53.00,
    obs: 'Nota 272 - Alface, tomate, cebola roxa',
    data: `${todayISO}T09:30:00.000Z`,
    synced: true
  }
];
