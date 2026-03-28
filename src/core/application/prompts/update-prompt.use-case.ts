import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { updatePromptDTO } from './update-prompt.dto';

export class UpdatePromptUseCase {
  constructor(private promptRepository: PrismaPromptRepository) {}

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
