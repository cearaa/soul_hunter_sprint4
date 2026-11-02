import { Ghost as GhostIcon, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../services/api";
import { fantasmaService } from "../../services/fantasmaService";
import { inputBase, inputState } from "../../theme/formStyles";
import type { Fantasma, FantasmaPayload, Raridade, Usuario } from "../../types";
import AvisoBanner from "../AvisoBanner/AvisoBanner";
import Button from "../Button/Button";
import FormField from "../FormField/FormField";

const raridades: Raridade[] = ["Comum", "Raro", "Épico", "Lendário"];
const tiposSugeridos = ["Espectro", "Poltergeist", "Banshee", "Alma penada", "Fantasma de estação"];

interface FantasmaFormProps {
  usuarios: Usuario[];
  /** Se informado, edita (PUT); senão, cria (POST). */
  fantasma?: Fantasma;
  onSalvo: (modo: "criado" | "editado") => void;
  onCancelar: () => void;
}

interface CamposForm {
  nome: string;
  tipo: string;
  raridade: string;
  valorEssencia: number;
  codUsuario: number;
}

export default function FantasmaForm({ usuarios, fantasma, onSalvo, onCancelar }: FantasmaFormProps) {
  const editando = fantasma !== undefined;
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CamposForm>({
    mode: "onTouched",
    defaultValues: {
      nome: fantasma?.nome ?? "",
      tipo: fantasma?.tipo ?? "",
      raridade: fantasma?.raridade ?? "Comum",
      valorEssencia: fantasma?.valorEssencia ?? 10,
      codUsuario: fantasma?.codUsuario ?? usuarios[0]?.codigo,
    },
  });

  async function enviar(campos: CamposForm) {
    setErroApi(null);
    const dados: FantasmaPayload = {
      nome: campos.nome.trim(),
      tipo: campos.tipo.trim(),
      raridade: campos.raridade,
      valorEssencia: Number(campos.valorEssencia),
      codUsuario: Number(campos.codUsuario),
    };
    try {
      if (fantasma) await fantasmaService.atualizar(fantasma.codigo, dados);
      else await fantasmaService.criar(dados);
      onSalvo(editando ? "editado" : "criado");
    } catch (erro) {
      setErroApi(erro instanceof ApiError ? erro.message : "Não foi possível salvar o fantasma.");
    }
  }

  // Mantém no select uma raridade que já exista no banco mesmo fora da lista padrão.
  const opcoesRaridade: string[] =
    fantasma && !raridades.includes(fantasma.raridade as Raridade)
      ? [...raridades, fantasma.raridade]
      : raridades;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-2">
      {erroApi && <AvisoBanner aviso={{ tipo: "erro", texto: erroApi }} />}

      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 xl:grid-cols-3">
        <FormField id="fantasma-nome" label="Nome do fantasma" required error={errors.nome?.message}>
          <input
            id="fantasma-nome"
            type="text"
            placeholder="Ex.: Senhor Cartola"
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? "fantasma-nome-error" : undefined}
            className={`${inputBase} ${inputState(!!errors.nome)}`}
            {...register("nome", {
              required: "Dê um nome ao fantasma.",
              validate: (v) => v.trim().length > 0 || "Dê um nome ao fantasma.",
              maxLength: { value: 50, message: "No máximo 50 caracteres." },
            })}
          />
        </FormField>

        <FormField id="fantasma-tipo" label="Tipo" required error={errors.tipo?.message}>
          <input
            id="fantasma-tipo"
            type="text"
            list="tipos-fantasma"
            placeholder="Ex.: Espectro"
            aria-invalid={!!errors.tipo}
            aria-describedby={errors.tipo ? "fantasma-tipo-error" : undefined}
            className={`${inputBase} ${inputState(!!errors.tipo)}`}
            {...register("tipo", {
              required: "Informe o tipo do fantasma.",
              validate: (v) => v.trim().length > 0 || "Informe o tipo do fantasma.",
              maxLength: { value: 30, message: "No máximo 30 caracteres." },
            })}
          />
          <datalist id="tipos-fantasma">
            {tiposSugeridos.map((tipo) => (
              <option key={tipo} value={tipo} />
            ))}
          </datalist>
        </FormField>

        <FormField id="fantasma-raridade" label="Raridade" required error={errors.raridade?.message}>
          <select
            id="fantasma-raridade"
            className={`${inputBase} ${inputState(!!errors.raridade)}`}
            {...register("raridade", { required: "Escolha a raridade." })}
          >
            {opcoesRaridade.map((r) => (
              <option key={r} value={r} className="bg-soul-900">
                {r}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="fantasma-valor"
          label="Valor de essência"
          required
          error={errors.valorEssencia?.message}
          hint="Número maior ou igual a 0."
        >
          <input
            id="fantasma-valor"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            aria-invalid={!!errors.valorEssencia}
            aria-describedby={errors.valorEssencia ? "fantasma-valor-error" : "fantasma-valor-hint"}
            className={`${inputBase} ${inputState(!!errors.valorEssencia)}`}
            {...register("valorEssencia", {
              required: "Informe o valor de essência.",
              valueAsNumber: true,
              validate: (v) => (Number.isFinite(v) && v >= 0) || "Use um número maior ou igual a 0.",
            })}
          />
        </FormField>

        <FormField
          id="fantasma-dono"
          label="Caçador dono"
          required
          error={errors.codUsuario?.message}
          hint={editando ? "O dono não muda na edição (regra da API)." : undefined}
        >
          <select
            id="fantasma-dono"
            disabled={editando}
            className={`${inputBase} ${inputState(!!errors.codUsuario)}`}
            {...register("codUsuario", { required: "Escolha o caçador dono.", valueAsNumber: true })}
          >
            {usuarios.map((u) => (
              <option key={u.codigo} value={u.codigo} className="bg-soul-900">
                {u.nome}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancelar} disabled={isSubmitting}>
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {editando ? (
            <Save className="h-4 w-4" aria-hidden="true" />
          ) : (
            <GhostIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Salvando..." : editando ? "Salvar alterações" : "Capturar fantasma"}
        </Button>
      </div>
    </form>
  );
}
