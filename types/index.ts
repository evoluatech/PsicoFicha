export type StatusAprendente = 'acompanhamento' | 'avaliacao' | 'pausado' | 'arquivado';

export interface Responsavel {
  id: string;
  nomeCompleto: string;
  parentesco: string;
  responsavelLegal: boolean;
  telefone: string;
  email: string;
  melhorContato: string;
  autorizacaoConsentimento: {
    status: 'autorizado' | 'pendente' | 'em_analise';
    dataAutorizacao: string;
    observacao: string;
  };
}

export interface ContextoEscolar {
  instituicao: string;
  etapaAno: string;
  turno: string;
  contatoEscolar?: string;
  demandasEscolares: string;
  adaptacoesApoios: string;
}

export interface Aprendente {
  id: string;
  codigoInterno: string;
  nomeCompleto: string;
  nomeSocial?: string;
  dataNascimento: string;
  idadeCalculada: number;
  pronome?: string;
  contatoPreferencial: string;
  cidadeUf: string;
  status: StatusAprendente;
  paisResponsaveis: Responsavel[];
  contextoEscolar: ContextoEscolar;
  notasInternas?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SecaoAnamnese {
  titulo: string;
  relatoFamilia: string;
  observacaoProfissional: string;
  hipoteseTrabalho: string;
}

export interface Anamnese {
  id: string;
  aprendenteId: string;
  atualizadoEm: string;
  salvoEm: string;
  status: 'rascunho' | 'revisado' | 'finalizado';
  motivoProcura: SecaoAnamnese;
  queixaPrincipal: SecaoAnamnese;
  historiaDesenvolvimento: SecaoAnamnese;
  gestacaoNascimento: SecaoAnamnese;
  saudeMedicacao: SecaoAnamnese;
  sonoAlimentacaoRotina: SecaoAnamnese;
  linguagemComunicacao: SecaoAnamnese;
  aspectosMotores: SecaoAnamnese;
  aspectosSocioemocionais: SecaoAnamnese;
  trajetoriaEscolar: SecaoAnamnese;
  leituraEscritaMatematica: SecaoAnamnese;
  relacoesFamiliares: SecaoAnamnese;
  recursosPotencialidades: SecaoAnamnese;
  observacoesAdicionais: SecaoAnamnese;
  documentosEncaminhamentos: {
    arquivosDemonstrativos: string[];
    anotacoes: string;
  };
}

export interface Sessao {
  id: string;
  aprendenteId: string;
  data: string;
  duracaoMinutos: number;
  modalidade: 'presencial_consultorio' | 'presencial_escola' | 'online';
  local: string;
  objetivo: string;
  atividades: string;
  comportamentoObservado: string;
  estrategiasEficazes: string;
  dificuldadesEncontradas: string;
  avancosPercebidos: string;
  orientacoesFamiliaEscola: string;
  proximosPassos: string;
  anexos: string[];
  status: 'rascunho' | 'revisado' | 'finalizado';
}

export interface RegistroEvolucaoDominio {
  dominioId: string;
  nome: string;
  descricaoTextual: string;
  pontos: {
    data: string;
    sessaoId?: string;
    nivelObservado: number; // 1 a 5 apenas como escala de observação qualitativa demonstrativa
    resumoObservacao: string;
  }[];
}

export interface AvaliacaoPsicopedagogica {
  id: string;
  aprendenteId: string;
  perguntaObjetivo: string;
  periodoAvaliacao: string;
  contextoFontes: string;
  procedimentosInstrumentos: string;
  observacoesQualitativas: string;
  fatoresFacilitadores: string;
  barreiras: string;
  sinteseDescritiva: string;
  recomendacoesPedagogicas: string;
  encaminhamentos: string;
  limitacoesAvaliacao: string;
  revisaoProfissional: {
    revisadoPor: string;
    crpCrppDemonstrativo: string;
    dataRevisao: string;
  };
  status: 'rascunho' | 'finalizado';
}

export interface RelatorioSecoes {
  capa: boolean;
  identificacaoAprendente: boolean;
  identificacaoResponsaveis: boolean;
  demandaMotivo: boolean;
  periodoContexto: boolean;
  procedimentosInstrumentos: boolean;
  antecedentesHistorico: boolean;
  observacoesProcesso: boolean;
  perfilAprendizagem: boolean;
  aspectosObservados: boolean;
  potencialidadesBarreiras: boolean;
  sinteseDescritiva: boolean;
  recomendacoesPraticas: boolean;
  planoAcompanhamento: boolean;
  limitacoesEticas: boolean;
  registroAtendimentoLivre?: boolean;
  identificacaoProfissional: boolean;
}

export interface RelatorioPsicopedagogico {
  id: string;
  codigoDocumento: string;
  aprendenteId: string;
  titulo: string;
  dataCriacao: string;
  dataFinalizacao?: string;
  status: 'rascunho' | 'em_revisao' | 'finalizado' | 'enviado' | 'arquivado';
  secoesAtivas: RelatorioSecoes;
  conteudo: {
    demandaMotivo: string;
    periodoContexto: string;
    procedimentosInstrumentos: string;
    antecedentesHistorico: string;
    observacoesProcesso: string;
    perfilAprendizagem: string;
    aspectosObservados: string;
    potencialidadesBarreiras: string;
    sinteseDescritiva: string;
    recomendacoesFamilia: string;
    recomendacoesEscola: string;
    planoAcompanhamento: string;
    limitacoesEticas: string;
    registroAtendimentoLivre?: string;
    identificacaoProfissional: {
      nome: string;
      registroProfissional: string;
      instituicaoConsultorio: string;
      cidadeData: string;
    };
  };
}

export interface ModeloFormulario {
  id: string;
  titulo: string;
  categoria: 'anamnese' | 'sessao' | 'avaliacao' | 'escolar' | 'devolutiva' | 'plano';
  descricao: string;
  indicacaoUso: string;
  itensEstimados: number;
  tempoMedioPreenchimentoMinutos: number;
}

export type TipoCompromisso = 'sessao_individual' | 'anamnese_inicial' | 'devolutiva_pais' | 'reuniao_escola' | 'avaliacao';
export type StatusLembrete = 'agendado' | 'concluido' | 'cancelado' | 'vencido';

export interface LembreteConsulta {
  id: string;
  aprendenteId: string;
  nomeAprendente: string;
  tipoCompromisso: TipoCompromisso;
  data: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  duracaoMinutos: number;
  fusoHorario: string;
  modalidade: 'presencial' | 'online';
  local: string;
  observacoes: string;
  recorrencia: 'nenhuma' | 'semanal' | 'quinzenal' | 'mensal';
  alertasAntecedencia: number[]; // minutos antes: [5, 15, 30, 60, 1440]
  status: StatusLembrete;
  disparado?: boolean;
}

export interface ConfiguracoesApp {
  tema: 'claro' | 'escuro' | 'sistema';
  tamanhoFonte: 'padrao' | 'grande' | 'maior';
  notificacoesAtivas: boolean;
  somAtivo: boolean;
  volume: number; // 0 a 100
  vibracaoAtiva: boolean;
  somEscolhido: 'suave_cristal' | 'harpa_calma' | 'sino_zen';
  alertasEmSegundoPlano: boolean;
  ocultarCamposVaziosImpressao: boolean;
  incluirSumarioRelatorio: boolean;
}

export interface ToastNotif {
  id: string;
  tipo: 'sucesso' | 'info' | 'aviso' | 'erro';
  mensagem: string;
  acaoTexto?: string;
  onAcao?: () => void;
}
