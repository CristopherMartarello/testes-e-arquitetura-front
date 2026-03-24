import { createPromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: createPromptDTO }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: 'asc' | 'desc' };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });

  describe('create', () => {
    it('should call prisma create method with correct data', async () => {
      const input = {
        title: 'Test Prompt',
        content: 'This is a test prompt.',
      };

      await repository.create(input);

      expect(prisma.prompt.create).toHaveBeenCalledWith({ data: input });
    });
  });

  describe('findByTitle', () => {
    it('should call find first correctly with title', async () => {
      const title = 'title 01';
      const input = {
        id: 'p1',
        title,
        content: 'content 01',
      };

      prisma.prompt.findFirst.mockResolvedValue(input);
      const result = await repository.findByTitle(title);

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title },
      });
      expect(result).toEqual(input);
    });
  });

  describe('findMany', () => {
    it('should order by descendant createdAt and to map results', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          title: 'Title 02',
          content: 'Content 02',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(results);
    });
  });

  describe('searchMany', () => {
    it('should search by empty term and not to send where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('         ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('should search by term and to populate OR in where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('     title 01    ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              title: { contains: 'title 01', mode: 'insensitive' },
            },
            {
              content: { contains: 'title 01', mode: 'insensitive' },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('should handle undefined term', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];

      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany(undefined);

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });

      expect(results).toMatchObject(input);
    });
  });
});
