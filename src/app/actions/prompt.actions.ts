'use server';

import {
  createPromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { CreatePromptUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prisma } from '@/lib/prisma';
import z, { success } from 'zod';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

export async function createPromptAction(data: createPromptDTO) {
  const validated = createPromptSchema.safeParse(data);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Erro de validação do prompt',
      errors: fieldErrors,
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new CreatePromptUseCase(repository);
    await useCase.execute(validated.data);
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_ALREADY_EXISTS') {
      return {
        success: false,
        message: 'Erro ao criar prompt: Este prompt já existe!',
      };
    }

    return {
      success: false,
      message: 'Falha ao criar o prompt.',
    };
  }

  return {
    success: true,
    message: 'Prompt criado com sucesso',
  };
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const term = String(formData.get('q') ?? '').trim();
  const repository = new PrismaPromptRepository(prisma);
  const useCase = new SearchPromptsUseCase(repository);

  try {
    const results = await useCase.execute(term);

    const summaries = results.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }));

    return {
      success: true,
      prompts: summaries,
    };
  } catch {
    return {
      success: false,
      message: 'Falha ao buscar prompts.',
    };
  }
}
