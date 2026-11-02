import { Save, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../services/api";
import { usuarioService } from "../../services/usuarioService";
import { EMAIL_REGEX, inputBase, inputState } from "../../theme/formStyles";
import type { Usuario, UsuarioPayload } from "../../types";
import AvisoBanner from "../AvisoBanner/AvisoBanner";
import Button from "../Button/Button";
import FormField from "../FormField/FormField";

interface CacadorFormProps {
  /** Se informado, o formulário edita (PUT); senão, cadastra (POST). */
  usuario?: Usuario;
  /** Prefixo dos ids, para permitir mais de um formulário por página. */
  idPrefixo?: string;
  onSalvo: (dados: UsuarioPayload, modo: "criado" | "editado") => void | Promise<void>;
  onCancelar?: () => void;
}

const NOME_MAX = 100;
const EMAIL_MAX = 100;

export default function CacadorForm({
  usuario,
  idPrefixo = "cacador",
  onSalvo,
  onCancelar,
}: CacadorFormProps) {
  const editando = usuario !== undefined;
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioPayload>({
    mode: "onTouched",
    defaultValues: { nome: usuario?.nome ?? "", email: usuario?.email ?? "" },
  });

  async function enviar(dados: UsuarioPayload) {
    setErroApi(null);
    const limpos: UsuarioPayload = { nome: dados.nome.trim(), email: dados.email.trim() };
    try {
      if (usuario) await usuarioService.atualizar(usuario.codigo, limpos);
      else await usuarioService.criar(limpos);
      await onSalvo(limpos, editando ? "editado" : "criado");
    } catch (erro) {
      setErroApi(erro instanceof ApiError ? erro.message : "Não foi possível salvar o caçador.");
    }
  }

  const idNome = `${idPrefixo}-nome`;
  const idEmail = `${idPrefixo}-email`;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-2">
      {erroApi && <AvisoBanner aviso={{ tipo: "erro", texto: erroApi }} />}

      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <FormField id={idNome} label="Nome do caçador" required error={errors.nome?.message}>
          <input
            id={idNome}
            type="text"
            autoComplete="nickname"
            placeholder="Ex.: Maria Caçadora"
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? `${idNome}-error` : undefined}
            className={`${inputBase} ${inputState(!!errors.nome)}`}
            {...register("nome", {
              required: "Informe o nome do caçador.",
              validate: (valor) => valor.trim().length >= 2 || "O nome precisa ter ao menos 2 letras.",
              maxLength: { value: NOME_MAX, message: `No máximo ${NOME_MAX} caracteres.` },
            })}
          />
        </FormField>

        <FormField
          id={idEmail}
          label="E-mail"
          required
          error={errors.email?.message}
          hint="Cada e-mail só pode ser cadastrado uma vez."
        >
          <input
            id={idEmail}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="voce@exemplo.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${idEmail}-error` : `${idEmail}-hint`}
            className={`${inputBase} ${inputState(!!errors.email)}`}
            {...register("email", {
              required: "Informe um e-mail.",
              pattern: { value: EMAIL_REGEX, message: "Digite um e-mail válido." },
              maxLength: { value: EMAIL_MAX, message: `No máximo ${EMAIL_MAX} caracteres.` },
            })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={isSubmitting}>
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {editando ? (
            <Save className="h-4 w-4" aria-hidden="true" />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar caçador"}
        </Button>
      </div>
    </form>
  );
}
