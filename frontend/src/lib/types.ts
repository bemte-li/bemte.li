export interface Usuario {
  id: string;
  email: string;
  created: string;
  updated: string;
}

export interface Niusleter {
  id: string;
  nome: string;
  descricao: string;
  foto_3x4?: string;
  display_mode: 'title_only' | 'title_with_3x4_photo' | 'title_image_horizontal';
  foto_horizontal?: string;
  caminho: string;
  usuario: string;
  created: string;
  updated: string;
  expand?: {
    usuario: Usuario;
  };
}

export interface Texto {
  id: string;
  titulo: string;
  corpo: string;
  enviado?: string;
  caminho: string;
  rodape_autor: string;
  rodape_descricao: string;
  rodape_field?: string;
  niusleter: string;
  created: string;
  updated: string;
  expand?: {
    niusleter: Niusleter;
  };
}

export interface Inscrito {
  id: string;
  email: string;
  nota?: string;
  niusleter?: string;
  verificado?: string;
  desinscrito?: string;
  created: string;
  updated: string;
  expand?: {
    niusleter: Niusleter;
  };
}

export interface Convite {
  id: string;
  email: string;
  nome: string;
  sobre: string;
  aprovada?: string;
  created: string;
  updated: string;
} 