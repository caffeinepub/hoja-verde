import type {
  Client,
  FinancialEntry,
  Garden,
  Invoice,
  Job,
  MaintenanceSchedule,
  Prospect,
  Quote,
} from "../backend.d";
import {
  FinancialEntryType,
  JobStatus,
  ProspectStatus,
  QuoteStatus,
} from "../backend.d";
import { addDaysToToday, getTodayStr } from "./format";

const SEED_KEY = "hoja_verde_seeded_v2";

export function isSeeded(): boolean {
  return localStorage.getItem(SEED_KEY) === "true";
}

export function markSeeded(): void {
  localStorage.setItem(SEED_KEY, "true");
}

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: "client-001",
    name: "María Rodríguez",
    phone: "88451234",
    address: "San José, Barrio Escalante, Calle 39 #214",
    mapLocation: "https://maps.google.com/?q=9.9376,-84.0667",
    notes:
      "Cliente preferida, jardín con árboles frutales y flores tropicales.",
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 90),
  },
  {
    id: "client-002",
    name: "Carlos Jiménez",
    phone: "87321456",
    address: "Curridabat, Guayabos, Residencial Las Palmas #18",
    mapLocation: "https://maps.google.com/?q=9.9178,-84.0234",
    notes: "Jardín amplio con césped bermuda. Prefiere servicio los sábados.",
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 60),
  },
  {
    id: "client-003",
    name: "Ana Solís",
    phone: "86543210",
    address: "Santa Ana, Pozos, Condominio Los Cedros #5",
    mapLocation: "https://maps.google.com/?q=9.9333,-84.1833",
    notes: "Jardín pequeño, mantenimiento mensual. Mascota en el jardín.",
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 30),
  },
];

export const SAMPLE_GARDENS: Garden[] = [
  {
    clientId: "client-001",
    sizeM2: 280,
    grassType: "Grama San Agustín",
    terrainType: "Plano con leve pendiente",
    toolsRequired: "Cortadora, bordeadora, podadora, soplador",
    avgWorkTimeHours: 3.5,
    photoUrls: [],
    observations:
      "Árboles de mango y aguacate requieren poda semestral. Flores de heliconias en la esquina sur.",
  },
  {
    clientId: "client-002",
    sizeM2: 450,
    grassType: "Bermuda",
    terrainType: "Plano",
    toolsRequired: "Cortadora industrial, bordeadora, rastrillo",
    avgWorkTimeHours: 4.0,
    photoUrls: [],
    observations:
      "Requiere fertilización mensual. Piscina en el área norte, tener cuidado con el recorte.",
  },
  {
    clientId: "client-003",
    sizeM2: 120,
    grassType: "Grama Kikuyo",
    terrainType: "Plano",
    toolsRequired: "Cortadora pequeña, tijeras de poda",
    avgWorkTimeHours: 1.5,
    photoUrls: [],
    observations:
      "Jardín pequeño y acogedor. Perro grande en propiedad - avisar al llegar.",
  },
];

export const SAMPLE_SCHEDULES: MaintenanceSchedule[] = [
  {
    id: "sched-001",
    clientId: "client-001",
    frequencyDays: BigInt(15),
    lastDate: addDaysToToday(-10),
    nextDate: addDaysToToday(5),
    isActive: true,
    notes: "Mantenimiento quincenal acordado",
  },
  {
    id: "sched-002",
    clientId: "client-002",
    frequencyDays: BigInt(7),
    lastDate: addDaysToToday(-6),
    nextDate: addDaysToToday(1),
    isActive: true,
    notes: "Semanal los sábados",
  },
  {
    id: "sched-003",
    clientId: "client-003",
    frequencyDays: BigInt(30),
    lastDate: addDaysToToday(-20),
    nextDate: addDaysToToday(10),
    isActive: true,
    notes: "Mantenimiento mensual",
  },
];

export const SAMPLE_JOBS: Job[] = [
  {
    id: BigInt(1001),
    clientId: "client-001",
    clientName: "María Rodríguez",
    date: getTodayStr(),
    serviceDescription: "Corte de césped, bordeado y poda de arbustos",
    status: JobStatus.scheduled,
    notes: "Incluir poda del árbol de mango",
    price: BigInt(45000),
  },
  {
    id: BigInt(1002),
    clientId: "client-002",
    clientName: "Carlos Jiménez",
    date: getTodayStr(),
    serviceDescription: "Corte de césped bermuda con cortadora industrial",
    status: JobStatus.inProgress,
    notes: "",
    price: BigInt(65000),
  },
  {
    id: BigInt(1003),
    clientId: "client-003",
    clientName: "Ana Solís",
    date: addDaysToToday(2),
    serviceDescription: "Mantenimiento mensual completo",
    status: JobStatus.scheduled,
    notes: "Llevar fertilizante",
    price: BigInt(30000),
  },
  {
    id: BigInt(1004),
    clientId: "client-001",
    clientName: "María Rodríguez",
    date: addDaysToToday(-7),
    serviceDescription: "Corte de césped y limpieza general",
    status: JobStatus.completed,
    notes: "",
    price: BigInt(45000),
  },
  {
    id: BigInt(1005),
    clientId: "client-002",
    clientName: "Carlos Jiménez",
    date: addDaysToToday(-14),
    serviceDescription: "Corte de césped bermuda",
    status: JobStatus.completed,
    notes: "",
    price: BigInt(65000),
  },
];

export const SAMPLE_QUOTES: Quote[] = [
  {
    id: BigInt(2001),
    clientId: "client-001",
    clientName: "María Rodríguez",
    serviceDescription:
      "Mantenimiento mensual: corte, bordeado, poda y limpieza completa",
    price: BigInt(45000),
    date: addDaysToToday(-5),
    status: QuoteStatus.accepted,
    notes: "Servicio quincenal acordado",
  },
  {
    id: BigInt(2002),
    clientId: "client-003",
    clientName: "Ana Solís",
    serviceDescription: "Poda de arbustos ornamentales y fertilización",
    price: BigInt(25000),
    date: addDaysToToday(-2),
    status: QuoteStatus.sent,
    notes: "Esperando confirmación",
  },
  {
    id: BigInt(2003),
    clientId: "client-002",
    clientName: "Carlos Jiménez",
    serviceDescription: "Instalación de sistema de riego automático",
    price: BigInt(180000),
    date: getTodayStr(),
    status: QuoteStatus.pending,
    notes: "Cotización nueva para proyecto de riego",
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: BigInt(1),
    clientId: "client-001",
    clientName: "María Rodríguez",
    services: [
      "Corte y bordeado de césped",
      "Poda de arbustos",
      "Limpieza general del jardín",
    ],
    totalAmount: BigInt(45000),
    date: addDaysToToday(-7),
    nextMaintenanceDate: addDaysToToday(5),
    isPaid: true,
  },
  {
    id: BigInt(2),
    clientId: "client-002",
    clientName: "Carlos Jiménez",
    services: [
      "Corte de césped bermuda con cortadora industrial",
      "Fertilización",
    ],
    totalAmount: BigInt(75000),
    date: addDaysToToday(-3),
    nextMaintenanceDate: addDaysToToday(1),
    isPaid: false,
  },
];

export const SAMPLE_PROSPECTS: Prospect[] = [
  {
    id: BigInt(3001),
    name: "Roberto Mora",
    phone: "85674321",
    address: "Escazú, San Rafael, Residencial La Colina #22",
    serviceRequested: "Mantenimiento quincenal de jardín amplio",
    quoteDate: addDaysToToday(-3),
    status: ProspectStatus.quoteSent,
    notes: "Interesado en contrato anual",
  },
  {
    id: BigInt(3002),
    name: "Lucía Vargas",
    phone: "84321987",
    address: "Heredia, San Pablo, Calle Moravia #8",
    serviceRequested: "Diseño y creación de jardín nuevo",
    quoteDate: getTodayStr(),
    status: ProspectStatus.pending,
    notes: "Tienen terreno de 200m2 vacío",
  },
];

export const SAMPLE_FINANCIAL: FinancialEntry[] = [
  {
    id: BigInt(4001),
    entryType: FinancialEntryType.income,
    amount: BigInt(45000),
    category: "Servicio de mantenimiento",
    description: "Pago María Rodríguez - mantenimiento quincenal",
    date: addDaysToToday(-7),
  },
  {
    id: BigInt(4002),
    entryType: FinancialEntryType.income,
    amount: BigInt(65000),
    category: "Servicio de mantenimiento",
    description: "Pago Carlos Jiménez - corte semanal",
    date: addDaysToToday(-3),
  },
  {
    id: BigInt(4003),
    entryType: FinancialEntryType.expense,
    amount: BigInt(15000),
    category: "Combustible",
    description: "Gasolina para semana",
    date: addDaysToToday(-5),
  },
  {
    id: BigInt(4004),
    entryType: FinancialEntryType.expense,
    amount: BigInt(8500),
    category: "Mantenimiento equipos",
    description: "Afilado cuchillas cortadora",
    date: addDaysToToday(-2),
  },
  {
    id: BigInt(4005),
    entryType: FinancialEntryType.income,
    amount: BigInt(30000),
    category: "Servicio de mantenimiento",
    description: "Pago Ana Solís - mantenimiento mensual",
    date: addDaysToToday(-1),
  },
];
