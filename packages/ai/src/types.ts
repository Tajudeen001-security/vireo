import { z } from "zod";

export const DesignDirectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  mood: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    foreground: z.string(),
  }),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  previewHtml: z.string().optional(),
});

export const ProjectPlanSchema = z.object({
  brief: z.string(),
  goals: z.array(z.string()),
  pages: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      description: z.string(),
    })
  ),
  features: z.array(
    z.object({
      name: z.string(),
      priority: z.enum(["mvp", "later"]),
      description: z.string(),
    })
  ),
  dataModel: z.array(
    z.object({
      entity: z.string(),
      fields: z.array(z.string()),
    })
  ),
  stack: z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    auth: z.string(),
    hosting: z.string(),
  }),
  designDirections: z.array(DesignDirectionSchema).max(3),
});

export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;
export type DesignDirection = z.infer<typeof DesignDirectionSchema>;
