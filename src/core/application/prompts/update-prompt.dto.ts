import z from 'zod';

export const updatePromptDTOSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
});

export type updatePromptDTO = z.infer<typeof updatePromptDTOSchema>;
