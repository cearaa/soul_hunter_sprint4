import { Bike, Recycle } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import AvisoBanner from "../../components/AvisoBanner/AvisoBanner";
import Button from "../../components/Button/Button";
import FormField from "../../components/FormField/FormField";
import { ApiError } from "../../services/api";
import { usuarioService } from "../../services/usuarioService";
import { inputBase, inputState } from "../../theme/formStyles";
import type { TipoMaterial, TipoTransporte, Usuario } from "../../types";
import { essenciaReciclagem, essenciaTransporte } from "../../utils/essencia";

const materiais: TipoMaterial[] = ["Plástico", "Vidro", "Papel", "Metal", "Orgânico"];
const transportes: TipoTransporte[] = ["Bicicleta", "Caminhada", "Ônibus", "Metrô", "Trem"];

interface RegistroProps {
  codigo: number;
  /** Chamado com o usuário já atualizado pela API (essência e título novos). */
  onRegistrado: (usuario: Usuario) => void;
}

interface CamposReciclagem {
  tipoMaterial: TipoMaterial;
  quilos: number;
}

interface CamposTransporte {
  tipoTransporte: TipoTransporte;
  km: number;
}

function mensagem(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : "Não foi possível registrar a ação.";
}

export function RegistroReciclagem({ codigo, onRegistrado }: RegistroProps) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CamposReciclagem>({
    mode: "onTouched",
    defaultValues: { tipoMaterial: "Plástico", quilos: undefined },
  });

  const quilos = Number(useWatch({ control, name: "quilos" }));
  const previa = Number.isFinite(quilos) && quilos > 0 ? essenciaReciclagem(quilos) : 0;

  async function enviar(campos: CamposReciclagem) {
    setErroApi(null);
    try {
      const usuario = await usuarioService.registrarReciclagem(codigo, {
        tipoMaterial: campos.tipoMaterial,
        quilos: Number(campos.quilos),
      });
      reset({ tipoMaterial: campos.tipoMaterial, quilos: undefined });
      onRegistrado(usuario);
    } catch (erro) {
      setErroApi(mensagem(erro));
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="glass-card space-y-2 p-5 sm:p-6">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
        <Recycle className="h-5 w-5 text-soul-teal" aria-hidden="true" />
        Registrar reciclagem
      </h3>
      <p className="mb-3 text-xs text-white/50">
        <code>POST /usuarios/{"{codigo}"}/reciclagem</code> · +5 de essência por quilo
      </p>
      {erroApi && <AvisoBanner aviso={{ tipo: "erro", texto: erroApi }} />}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField id="reciclagem-material" label="Material" required>
          <select
            id="reciclagem-material"
            className={`${inputBase} ${inputState(false)}`}
            {...register("tipoMaterial", { required: true })}
          >
            {materiais.map((m) => (
              <option key={m} value={m} className="bg-soul-900">
                {m}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="reciclagem-quilos" label="Quilos" required error={errors.quilos?.message}>
          <input
            id="reciclagem-quilos"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="Ex.: 2"
            aria-invalid={!!errors.quilos}
            aria-describedby={errors.quilos ? "reciclagem-quilos-error" : undefined}
            className={`${inputBase} ${inputState(!!errors.quilos)}`}
            {...register("quilos", {
              required: "Informe quantos quilos você reciclou.",
              valueAsNumber: true,
              validate: (v) => (Number.isFinite(v) && v > 0) || "Use um valor maior que 0.",
            })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70" aria-live="polite">
          Você vai ganhar <strong className="text-soul-cyan">+{previa}</strong> de essência
        </p>
        <Button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm">
          {isSubmitting ? "Registrando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}

export function RegistroTransporte({ codigo, onRegistrado }: RegistroProps) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CamposTransporte>({
    mode: "onTouched",
    defaultValues: { tipoTransporte: "Bicicleta", km: undefined },
  });

  const km = Number(useWatch({ control, name: "km" }));
  const tipo = useWatch({ control, name: "tipoTransporte" });
  const previa = Number.isFinite(km) && km > 0 ? essenciaTransporte(tipo, km) : 0;

  async function enviar(campos: CamposTransporte) {
    setErroApi(null);
    try {
      const usuario = await usuarioService.registrarTransporte(codigo, {
        tipoTransporte: campos.tipoTransporte,
        km: Number(campos.km),
      });
      reset({ tipoTransporte: campos.tipoTransporte, km: undefined });
      onRegistrado(usuario);
    } catch (erro) {
      setErroApi(mensagem(erro));
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="glass-card space-y-2 p-5 sm:p-6">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
        <Bike className="h-5 w-5 text-soul-cyan" aria-hidden="true" />
        Registrar deslocamento
      </h3>
      <p className="mb-3 text-xs text-white/50">
        <code>POST /usuarios/{"{codigo}"}/transporte</code> · bicicleta +3 por km, demais meios +2
      </p>
      {erroApi && <AvisoBanner aviso={{ tipo: "erro", texto: erroApi }} />}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField id="transporte-tipo" label="Meio de transporte" required>
          <select
            id="transporte-tipo"
            className={`${inputBase} ${inputState(false)}`}
            {...register("tipoTransporte", { required: true })}
          >
            {transportes.map((t) => (
              <option key={t} value={t} className="bg-soul-900">
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="transporte-km" label="Distância (km)" required error={errors.km?.message}>
          <input
            id="transporte-km"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="Ex.: 5"
            aria-invalid={!!errors.km}
            aria-describedby={errors.km ? "transporte-km-error" : undefined}
            className={`${inputBase} ${inputState(!!errors.km)}`}
            {...register("km", {
              required: "Informe a distância percorrida.",
              valueAsNumber: true,
              validate: (v) => (Number.isFinite(v) && v > 0) || "Use um valor maior que 0.",
            })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70" aria-live="polite">
          Você vai ganhar <strong className="text-soul-cyan">+{previa}</strong> de essência
        </p>
        <Button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm">
          {isSubmitting ? "Registrando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
