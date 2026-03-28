'use server';

import {
  createPromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { CreatePromptUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import {
  updatePromptDTO,
  updatePromptDTOSchema,
} from '@/core/application/prompts/update-prompt.dto';
import { UpdatePromptUseCase } from '@/core/application/prompts/update-prompt.use-case';
import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prisma } from '@/lib/prisma';
import z from 'zod';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

type FormState = {
  success: boolean;
  prompt?: PromptSummary[];
  message?: string;
  errors?: unknown;
};

export async function createPromptAction(
  data: createPromptDTO
): Promise<FormState> {
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

export async function updatePromptAction(
  data: updatePromptDTO
): Promise<FormState> {
  const validated = updatePromptDTOSchema.safeParse(data);
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
    const useCase = new UpdatePromptUseCase(repository);
    await useCase.execute(validated.data);

    return {
      success: true,
      message: 'Prompt atualizado com sucesso',
    };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_NOT_FOUND') {
      return {
        success: false,
        message: 'Prompt não encontrado',
      };
    }

    return {
      success: false,
      message: 'Falha ao atualizar prompt',
    };
  }
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
