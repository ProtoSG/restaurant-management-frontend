import { useCallback, useEffect, useRef, useState } from "react";

// es-PE: este proyecto es para un restaurante peruano (America/Lima en el backend,
// S/ como moneda) — mismo criterio de locale que usa work-hub/PetChat.tsx, pero
// justificado acá por el dominio propio de este proyecto, no copiado sin más.
const SPEECH_LANG = "es-PE";

// El lado SpeechRecognition de la Web Speech API no está en el DOM lib estándar de
// TS (Chrome lo expone con prefijo, sigue sin ser estándar) — se declara solo el
// recorte que usamos acá, no todo un paquete de tipos para un botón de mic con
// feature-detection. Mismo patrón que work-hub/PetChat.tsx.
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

// Feature-detectado una sola vez al cargar el módulo, no por render — ningún otro
// navegador que Chrome expone esto (Safari/Firefox no la implementan igual), así
// que queda undefined ahí y el botón de mic se esconde entero (ver DictateStep).
const SpeechRecognitionImpl: SpeechRecognitionCtor | undefined =
  typeof window === "undefined"
    ? undefined
    : (
        window as unknown as {
          SpeechRecognition?: SpeechRecognitionCtor;
          webkitSpeechRecognition?: SpeechRecognitionCtor;
        }
      ).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

/**
 * Reconocimiento de voz REAL del navegador (Web Speech API) — no confundir con el
 * dictado nativo del teclado que ya usa el textarea de DictateStep. Es la misma
 * tecnología que se evaluó y se dejó de lado para el flujo principal por su
 * degradación con ruido de fondo (cocina/salón); este botón vive AL LADO del
 * campo de texto, como alternativa a probar, no lo reemplaza.
 *
 * A diferencia de PetChat.tsx (que auto-envía el resultado), acá `onResult` solo
 * completa el texto — el mesero sigue revisando antes de tocar "Extraer pedido",
 * consistente con el principio de este flujo de nunca saltear la confirmación.
 */
export function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  const isSupported = SpeechRecognitionImpl !== undefined;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl) return;
    setError(null);

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = SPEECH_LANG;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    recognition.onerror = () => {
      setError("No se pudo reconocer la voz");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  // Si DictateStep se desmonta (se pasó a "Revisar", o se cerró el flujo entero)
  // mientras seguía escuchando, corta la captura de mic en vez de dejarla viva
  // de fondo — mismo cuidado que work-hub/PetChat.tsx tiene al cerrar su panel.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, listening, error, toggle };
}
