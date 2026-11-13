import { z } from "zod";

export const registrationSchema = z.object({
  programId: z.string().uuid(),
  scheduleId: z.string().uuid().optional().nullable(),
  learningMethod: z.enum(["offline", "online", "hybrid"]),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\\+?[0-9\\s-]{9,20}$/),
  email: z.union([z.string().email().max(180), z.literal("")]).optional(),
  educationLevel: z.string().trim().min(1).max(80),
  schoolName: z.string().trim().max(160).optional(),
  guardianName: z.string().trim().max(120).optional(),
  guardianPhone: z.string().trim().max(25).optional(),
  guardianConsent: z.boolean().default(false),
}).superRefine((data, ctx) => {
  const juniorOrYounger = /^(sd|smp|elementary|junior)/i.test(data.educationLevel);
  if (juniorOrYounger && (!data.guardianName || !data.guardianPhone || !data.guardianConsent)) {
    ctx.addIssue({ code: "custom", path: ["guardianConsent"], message: "Persetujuan dan kontak orang tua/wali wajib untuk peserta SD/SMP." });
  }
});
