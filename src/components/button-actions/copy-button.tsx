'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export type CopyButtonProps = {
  content: string;
};

const CopyButton = ({ content }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const isContentEmpty = !content.trim();

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCopy = async () => {
    const text = content.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      clearTimer();
      timerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      const _error = error as Error;
      toast.error(`Erro ao copiar o texto: ${_error.message}`);
    }
  };

  // Desmontando o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <Button
      variant="outline"
      type="button"
      size="sm"
      className="disabled:opacity-50"
      disabled={isContentEmpty}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="size-4 text-green-400" />
      ) : (
        <Copy className="size-4" />
      )}
      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
    </Button>
  );
};

export default CopyButton;
