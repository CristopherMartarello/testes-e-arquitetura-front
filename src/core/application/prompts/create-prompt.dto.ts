import z from 'zod';

export const createPromptSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
});

export type createPromptDTO = z.infer<typeof createPromptSchema>;
