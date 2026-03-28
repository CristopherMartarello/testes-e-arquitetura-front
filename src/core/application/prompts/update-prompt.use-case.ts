import { updatePromptDTO } from './update-prompt.dto';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

export class UpdatePromptUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(data: updatePromptDTO) {
    const exists = await this.promptRepository.findById(data.id);
    if (!exists) {
      throw new Error('PROMPT_NOT_FOUND');
    }

    return this.promptRepository.update(data.id, {
      title: data.title,
      content: data.content,
    });
  }
}
