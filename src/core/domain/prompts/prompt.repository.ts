import { createPromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from './prompt.entity';

export interface PromptRepository {
  create(data: createPromptDTO): Promise<void>;
  update(id: string, data: Partial<createPromptDTO>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  findMany(): Promise<Prompt[]>;
  findById(id: string): Promise<Prompt | null>;
  findByTitle(title: string): Promise<Prompt | null>;
  searchMany(term: string): Promise<Prompt[]>;
}
