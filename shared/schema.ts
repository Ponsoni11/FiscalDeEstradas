import { z } from "zod";

// Photo record schema
export const photoSchema = z.object({
  id: z.string(),
  filename: z.string(),
  highway: z.string(),
  direction: z.enum(["Norte", "Sul", "Leste", "Oeste", "Central"]),
  km: z.number(),
  meters: z.number(),
  activity: z.string(),
  subActivity: z.string(),
  notes: z.string().optional(),
  timestamp: z.number(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  imageData: z.string(), // Base64 encoded image with watermark
  watermarkSettings: z.object({
    position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"]),
    includeDateTime: z.boolean(),
    includeCoordinates: z.boolean(),
    includeHighway: z.boolean(),
    includeDirection: z.boolean(),
    includeLocation: z.boolean(),
    includeUser: z.boolean(),
    includeNotes: z.boolean()
  })
});

export type Photo = z.infer<typeof photoSchema>;

// App settings schema
export const settingsSchema = z.object({
  photoQuality: z.object({
    resolution: z.enum(["1920x1080", "1280x720", "640x480"]),
    compression: z.number().min(50).max(100)
  }),
  watermark: z.object({
    position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"]),
    includeDateTime: z.boolean(),
    includeCoordinates: z.boolean(),
    includeHighway: z.boolean(),
    includeDirection: z.boolean(),
    includeLocation: z.boolean(),
    includeUser: z.boolean(),
    includeNotes: z.boolean()
  }),
  fileNaming: z.object({
    pattern: z.string()
  }),
  storage: z.object({
    autoBackup: z.boolean(),
    organizeByDate: z.boolean(),
    organizeByHighway: z.boolean()
  }),
  highways: z.array(z.string()),
  activities: z.record(z.string(), z.array(z.string()))
});

export type Settings = z.infer<typeof settingsSchema>;

// Default settings
export const defaultSettings: Settings = {
  photoQuality: {
    resolution: "1920x1080",
    compression: 85
  },
  watermark: {
    position: "bottom-left",
    includeDateTime: true,
    includeCoordinates: true,
    includeHighway: true,
    includeDirection: true,
    includeLocation: true,
    includeUser: false,
    includeNotes: false
  },
  fileNaming: {
    pattern: "rodovia_sentido_data_hora_ocorre.jpg"
  },
  storage: {
    autoBackup: false,
    organizeByDate: true,
    organizeByHighway: false
  },
  highways: ["SP-310", "SP-333", "SP-326", "SP-351", "SP-323"],
  activities: {
    "pavimento": ["Panelo/Buraco", "Trinca tipo jacaré", "Remendo", "Trinca isolada"],
    "drenagem": ["Reparo de drenagem", "Limpeza de drenagem"],
    "faixa-dominio": ["Limpeza de vegetação", "Manutenção de cerca"],
    "seguranca": ["Barreira de segurança", "Defensas metálicas"],
    "estruturas": ["Pontes", "Viadutos", "Obras de arte"],
    "predios": ["Prédios administrativos", "Pátios de manutenção"],
    "iluminacao": ["Postes de iluminação", "Sistema elétrico"],
    "sinalizacao": ["Placas de sinalização", "Pintura de faixas"],
    "operacao": ["Controle de tráfego", "Monitoramento"]
  }
};
