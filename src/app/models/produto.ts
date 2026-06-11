export interface ArquivoProduto {
  id?: number;
  fid: string;
  nomeOriginal?: string;
  mimeType?: string;
  tamanhoBytes?: number;
  sha256?: string;
}

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  capacidade?: number;
  estoque?: number;

  imagemUrl?: string;
  imagens?: ArquivoProduto[];

  marcaId?: number;
  modeloId?: number;
  materialId?: number;
  tipoTampaId?: number;
  tipoIsolamentoId?: number;
  corIds?: number[];

  marca?: {
    id?: number;
    nome?: string;
  };

  modelo?: {
    id?: number;
    nome?: string;
    anoLancamento?: number;
    marcaId?: number;
  };

  material?: {
    id?: number;
    tipo?: string;
    resistenciaTemperatura?: number;
  };

  tipoTampa?: {
    id?: number;
    descricao?: string;
    material?: string;
  };

  tipoIsolamento?: {
    id?: number;
    descricao?: string;
    eficienciaTermica?: number;
  };

  cores?: {
    id?: number;
    nome?: string;
    codigoHex?: string;
  }[];
}