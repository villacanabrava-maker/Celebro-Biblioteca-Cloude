export type TipoObra =
  | "livro"
  | "capitulo"
  | "artigo"
  | "carta"
  | "reflexao"
  | "ensaio"
  | "relato"
  | "mensagem"
  | "anotacao"
  | "transcricao"
  | "documento_profissional"
  | "material_metodologico"
  | "referencia_externa"
  | "outro";

export const TIPO_OBRA_LABELS: Record<TipoObra, string> = {
  livro: "Livro",
  capitulo: "Capítulo",
  artigo: "Artigo",
  carta: "Carta",
  reflexao: "Reflexão",
  ensaio: "Ensaio",
  relato: "Relato",
  mensagem: "Mensagem",
  anotacao: "Anotação",
  transcricao: "Transcrição",
  documento_profissional: "Documento profissional",
  material_metodologico: "Material metodológico",
  referencia_externa: "Referência externa",
  outro: "Outro",
};

export type Autoria = "autoral" | "externa";

export type EstadoProcessamento = "recebido" | "em_processamento" | "concluido" | "falhou";

export type EstadoExecucao =
  | "recebido"
  | "validando"
  | "extraindo"
  | "normalizando"
  | "estruturando"
  | "segmentando"
  | "sintetizando"
  | "analisando"
  | "classificando"
  | "vetorizando"
  | "relacionando"
  | "validando_resultado"
  | "finalizando"
  | "concluido"
  | "falhou"
  | "cancelado";

export const ESTADO_EXECUCAO_LABELS: Record<EstadoExecucao, string> = {
  recebido: "Recebido",
  validando: "Validando arquivo",
  extraindo: "Extraindo conteúdo",
  normalizando: "Normalizando texto",
  estruturando: "Identificando estrutura",
  segmentando: "Criando fragmentos",
  sintetizando: "Escrevendo sínteses",
  analisando: "Identificando elementos",
  classificando: "Organizando na taxonomia",
  vetorizando: "Gerando embeddings",
  relacionando: "Relacionando elementos",
  validando_resultado: "Validando resultado",
  finalizando: "Publicando",
  concluido: "Concluído",
  falhou: "Falhou",
  cancelado: "Cancelado",
};

export const FORMATOS_SUPORTADOS = ["pdf", "docx", "txt", "md"] as const;
export type FormatoSuportado = (typeof FORMATOS_SUPORTADOS)[number];

export const NOMES_ETAPAS = [
  "validar_arquivo",
  "identificar_formato",
  "extrair_conteudo",
  "normalizar_conteudo",
  "identificar_estrutura",
  "construir_hierarquia",
  "criar_fragmentos",
  "criar_sinteses",
  "extrair_elementos",
  "normalizar_taxonomia",
  "criar_relacoes",
  "gerar_embeddings",
  "criar_indices",
  "realizar_analise_autoral_local",
  "validar_processamento",
  "publicar_documento_processado",
] as const;
export type NomeEtapa = (typeof NOMES_ETAPAS)[number];

export const TIPOS_ELEMENTO = [
  "tema",
  "conceito",
  "ideia",
  "tese",
  "argumento",
  "valor",
  "principio",
  "pergunta",
  "tensao",
  "contradicao",
  "conclusao",
  "historia",
  "experiencia",
  "pessoa",
  "personagem",
  "lugar",
  "evento",
  "metafora",
  "analogia",
  "contraste",
  "frase_relevante",
  "padrao_linguistico",
  "recurso_narrativo",
  "estrutura_argumentativa",
  "mudanca_de_pensamento",
  "referencia",
] as const;
export type TipoElemento = (typeof TIPOS_ELEMENTO)[number];

export const DOMINIOS_TAXONOMIA = [
  "intelectual",
  "axiologico",
  "reflexivo",
  "narrativo",
  "entidades",
  "temporal",
  "retorico",
  "linguistico",
  "estrutural",
  "autoral",
] as const;
export type DominioTaxonomia = (typeof DOMINIOS_TAXONOMIA)[number];

const DOMINIO_POR_TIPO: Record<TipoElemento, DominioTaxonomia> = {
  tema: "intelectual",
  conceito: "intelectual",
  ideia: "intelectual",
  tese: "intelectual",
  argumento: "retorico",
  valor: "axiologico",
  principio: "axiologico",
  pergunta: "reflexivo",
  tensao: "reflexivo",
  contradicao: "reflexivo",
  conclusao: "reflexivo",
  historia: "narrativo",
  experiencia: "narrativo",
  pessoa: "entidades",
  personagem: "entidades",
  lugar: "entidades",
  evento: "entidades",
  metafora: "linguistico",
  analogia: "linguistico",
  contraste: "retorico",
  frase_relevante: "linguistico",
  padrao_linguistico: "linguistico",
  recurso_narrativo: "narrativo",
  estrutura_argumentativa: "estrutural",
  mudanca_de_pensamento: "temporal",
  referencia: "entidades",
};

export function dominioParaTipoElemento(tipo: TipoElemento): DominioTaxonomia {
  return DOMINIO_POR_TIPO[tipo] ?? "intelectual";
}

export const TIPOS_RELACAO = [
  "sustenta",
  "contradiz",
  "expande",
  "deriva_de",
  "exemplifica",
  "questiona",
  "responde_a",
  "evolui_para",
  "associa_se_a",
  "reformula",
] as const;
export type TipoRelacao = (typeof TIPOS_RELACAO)[number];
