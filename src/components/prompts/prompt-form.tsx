'use client';

import {
  createPromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import {
  createPromptAction,
  updatedPromptAction,
} from '@/app/actions/prompt.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CopyButton from '../button-actions/copy-button';
import { Prompt } from '@/core/domain/prompts/prompt.entity';

type PromptFormProps = {
  prompt?: Prompt | null;
};

const PromptForm = ({ prompt }: PromptFormProps) => {
  const router = useRouter();

  const form = useForm<createPromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: prompt?.title || '',
      content: prompt?.content || '',
    },
  });

  const content = useWatch({
    control: form.control,
    name: 'content',
  });

  const isEdit = !!prompt?.id;

  const submit = async (data: createPromptDTO) => {
    const result = isEdit
      ? await updatedPromptAction({ id: prompt.id, ...data })
      : await createPromptAction(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <CopyButton content={content} />
        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>

      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">
                Título do Prompt
              </FieldLabel>
              <Input
                {...field}
                placeholder="Digite aqui o título do prompt..."
                variant="transparent"
                size="lg"
                autoFocus
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-content">
                Conteúdo do prompt
              </FieldLabel>
              <Textarea
                {...field}
                placeholder="Digite aqui o conteúdo do prompt..."
                variant="transparent"
                size="lg"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
};

export default PromptForm;
