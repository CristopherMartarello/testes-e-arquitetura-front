'use client';

import {
  createPromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';

const PromptForm = () => {
  const form = useForm<createPromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  return (
    <form action="" className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
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
