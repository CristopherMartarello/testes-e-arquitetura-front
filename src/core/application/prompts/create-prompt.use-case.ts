import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { createPromptDTO } from './create-prompt.dto';

export class CreatePromptUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(data: createPromptDTO): Promise<void> {
    const promptExists = await this.promptRepository.findByTitle(data.title);
    if (promptExists) {
      throw new Error('PROMPT_ALREADY_EXISTS');
    }

    await this.promptRepository.create(data);
  }
}
