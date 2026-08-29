import { useRef, useEffect, useCallback } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { cn } from "@/shared/utils/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  onExtract: () => void;
  isExtracting: boolean;
  showEmptyMessage: boolean;
}

export function DictateStep({ text, onChangeText, onExtract, isExtracting, showEmptyMessage }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Solo completa el campo — el mesero sigue revisando y tocando "Extraer
  // pedido" a mano, no se auto-envía como en PetChat.tsx.
  const handleSpeechResult = useCallback(
    (transcript: string) => onChangeText(text ? `${text} ${transcript}` : transcript),
    [text, onChangeText]
  );
  const speech = useSpeechRecognition(handleSpeechResult);

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-2xl mx-auto w-full gap-4">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange/15 flex items-center justify-center text-orange text-2xl">
          <FaMicrophone />
        </div>
        <p className="text-sm text-gray-400 px-4">
          Toca el campo, dicta con el micrófono del teclado y revisa antes de confirmar.
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Para la mesa 5, un trio marisco de 25 y una coca de un litro"
        rows={8}
        className="flex-1 min-h-[160px] resize-none border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-xl leading-relaxed focus:outline-none focus:border-orange transition-colors bg-white"
      />

      {speech.error && (
        <p className="text-sm text-red text-center px-4">{speech.error}</p>
      )}

      {showEmptyMessage && (
        <p className="text-sm text-red text-center px-4">
          No entendimos ningún ítem. Probá dictar de nuevo, más despacio.
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onExtract}
          disabled={!text.trim() || isExtracting}
          className="flex-1 py-3.5 rounded-xl bg-green text-white text-sm font-semibold disabled:opacity-40 cursor-pointer transition-opacity"
        >
          {isExtracting ? "Escuchando tu pedido…" : "Extraer pedido"}
        </button>

        {/* En prueba: reconocimiento de voz del navegador (Web Speech API), no el
            dictado del teclado. Requiere Chrome + contexto seguro (https o
            localhost) — si no, queda deshabilitado con el motivo en el title,
            en vez de escondido, justamente para poder diagnosticar la prueba. */}
        <button
          type="button"
          onClick={speech.toggle}
          disabled={!speech.isSupported}
          aria-label={speech.listening ? "Detener grabación" : "Probar reconocimiento de voz del navegador"}
          title={
            !speech.isSupported
              ? "No disponible: hace falta Chrome y un contexto seguro (https o localhost)"
              : speech.listening
                ? "Detener grabación"
                : "Reconocimiento de voz del navegador (en prueba)"
          }
          className={cn(
            "w-14 shrink-0 flex items-center justify-center rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
            speech.listening
              ? "bg-orange text-white animate-pulse"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          {speech.listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
      </div>
    </div>
  );
}
